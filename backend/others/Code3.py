import json
import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense, Embedding
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

# Load and preprocess data
def load_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    questions = []
    answers = []
    for pair in data['conversations']:
        questions.append(pair['question'])
        # Adding <start> and <end> tokens to answers for Seq2Seq learning
        answers.append('<start> ' + pair['answer'] + ' <end>')
    return questions, answers

# Tokenize and sequence the text data
def tokenize_text(texts, num_words=None):
    tokenizer = Tokenizer(num_words=num_words, oov_token='<OOV>')
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)
    return tokenizer, sequences

# Prepare the target sequences (for decoder output)
def prepare_decoder_target_sequences(sequences, vocab_size):
    sequences = np.array(sequences)
    decoder_targets = [to_categorical(seq, num_classes=vocab_size) for seq in sequences]
    return np.array(decoder_targets)

# Load data from the JSON file
questions, answers = load_data('NN1/data.json')

# Tokenize questions and answers
question_tokenizer, question_sequences = tokenize_text(questions)
answer_tokenizer, answer_sequences = tokenize_text(answers)

# Get vocabulary sizes
question_vocab_size = len(question_tokenizer.word_index) + 1
answer_vocab_size = len(answer_tokenizer.word_index) + 1

# Dynamically determine the maximum sequence lengths based on the longest sequence
max_question_len = max([len(seq) for seq in question_sequences])
max_answer_len = max([len(seq) for seq in answer_sequences])

# Pad sequences for uniformity
encoder_input_sequences = pad_sequences(question_sequences, maxlen=max_question_len, padding='post')
decoder_input_sequences = pad_sequences(answer_sequences, maxlen=max_answer_len, padding='post')

# Prepare decoder target sequences (shifted by one position to the right)
decoder_target_sequences = prepare_decoder_target_sequences(answer_sequences, answer_vocab_size)

# Load GloVe embeddings
def load_glove_embeddings(glove_file_path, word_index, embedding_dim):
    embeddings_index = {}
    with open(glove_file_path, 'r', encoding='utf-8') as file:
        for line in file:
            values = line.split()
            word = values[0]
            embedding_vector = np.asarray(values[1:], dtype='float32')
            embeddings_index[word] = embedding_vector
    
    # Create an embedding matrix where each row corresponds to a word in the tokenizer
    embedding_matrix = np.zeros((len(word_index) + 1, embedding_dim))
    for word, i in word_index.items():
        embedding_vector = embeddings_index.get(word)
        if embedding_vector is not None:
            # Words not found in the GloVe embedding will be left as zero vectors
            embedding_matrix[i] = embedding_vector
    
    return embedding_matrix

# Define the embedding dimensions and load GloVe
embedding_dim = 100
glove_file_path = 'NN1/glove.6B.100d.txt'
embedding_matrix = load_glove_embeddings(glove_file_path, question_tokenizer.word_index, embedding_dim)

# Train-Test Split
encoder_input_train, encoder_input_test, decoder_input_train, decoder_input_test, decoder_target_train, decoder_target_test = train_test_split(
    encoder_input_sequences, decoder_input_sequences, decoder_target_sequences, test_size=0.2)

# Seq2Seq Model Architecture
latent_dim = 256  # Latent dimensionality of the encoding space

# Encoder
encoder_inputs = Input(shape=(max_question_len,))
encoder_embedding = Embedding(input_dim=question_vocab_size, output_dim=embedding_dim, weights=[embedding_matrix], 
                              input_length=max_question_len, trainable=False)(encoder_inputs)
encoder_lstm, state_h, state_c = LSTM(latent_dim, return_state=True)(encoder_embedding)
encoder_states = [state_h, state_c]

# Decoder
decoder_inputs = Input(shape=(max_answer_len,))
decoder_embedding = Embedding(input_dim=answer_vocab_size, output_dim=embedding_dim, input_length=max_answer_len)(decoder_inputs)
decoder_lstm = LSTM(latent_dim, return_sequences=True, return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_embedding, initial_state=encoder_states)
decoder_dense = Dense(answer_vocab_size, activation='softmax')
decoder_outputs = decoder_dense(decoder_outputs)

# Define the model that will turn encoder_input_data & decoder_input_data into decoder_target_data
model = Model([encoder_inputs, decoder_inputs], decoder_outputs)

# Compile the model
model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit([encoder_input_train, decoder_input_train], decoder_target_train, 
          batch_size=64, epochs=100, validation_split=0.2)

# Save the model
model.save('seq2seq_chatbot_with_glove.h5')
