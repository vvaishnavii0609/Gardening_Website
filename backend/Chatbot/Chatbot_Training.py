import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, LSTM, Dense, Bidirectional, Concatenate
from tensorflow.keras.optimizers import Adam

# Load the data
with open('NN1/data.json') as f:
    data = json.load(f)

questions = [item['question'] for item in data]
answers = [item['answer'] for item in data]

# Tokenize the questions and answers
tokenizer = Tokenizer()
tokenizer.fit_on_texts(questions + answers)

# Convert text to sequences
question_sequences = tokenizer.texts_to_sequences(questions)
answer_sequences = tokenizer.texts_to_sequences(answers)

# Dynamically adjust max_len based on the longest sequence
max_len = max(max(len(seq) for seq in question_sequences), max(len(seq) for seq in answer_sequences))

# Pad the sequences
question_sequences = pad_sequences(question_sequences, maxlen=max_len, padding='post')
answer_sequences = pad_sequences(answer_sequences, maxlen=max_len, padding='post')

# Convert answers to categorical (one-hot encoding)
vocab_size = len(tokenizer.word_index) + 1
answer_sequences = tf.keras.utils.to_categorical(answer_sequences, num_classes=vocab_size)

# Load GloVe embeddings
embedding_dim = 100
embeddings_index = {}
with open('NN1\glove.6B.100d.txt', encoding='utf-8') as f:
    for line in f:
        values = line.split()
        word = values[0]
        coefs = np.asarray(values[1:], dtype='float32')
        embeddings_index[word] = coefs

embedding_matrix = np.zeros((vocab_size, embedding_dim))
for word, i in tokenizer.word_index.items():
    embedding_vector = embeddings_index.get(word)
    if embedding_vector is not None:
        embedding_matrix[i] = embedding_vector

# Define the encoder
encoder_inputs = Input(shape=(max_len,))
encoder_embedding = Embedding(input_dim=vocab_size, output_dim=embedding_dim, weights=[embedding_matrix], input_length=max_len, trainable=False)(encoder_inputs)
encoder_lstm = Bidirectional(LSTM(1024, return_sequences=True, return_state=True))
encoder_outputs, forward_h, forward_c, backward_h, backward_c = encoder_lstm(encoder_embedding)
state_h = Concatenate()([forward_h, backward_h])
state_c = Concatenate()([forward_c, backward_c])

# Define the decoder
decoder_inputs = Input(shape=(max_len,))
decoder_embedding = Embedding(input_dim=vocab_size, output_dim=embedding_dim, weights=[embedding_matrix], input_length=max_len, trainable=False)(decoder_inputs)
decoder_lstm = LSTM(2048, return_sequences=True, return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_embedding, initial_state=[state_h, state_c])

# Attention mechanism
attention = tf.keras.layers.Attention(use_scale=True)([decoder_outputs, encoder_outputs])
context_vector = Concatenate()([decoder_outputs, attention])

# Output layer
decoder_dense = Dense(vocab_size, activation='softmax')
decoder_outputs = decoder_dense(context_vector)

# Define the model
model = Model([encoder_inputs, decoder_inputs], decoder_outputs)

# Compile the model
model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
batch_size = 16
epochs = 70

model.fit([question_sequences, question_sequences], answer_sequences, batch_size=batch_size, epochs=epochs, )
model.save('NN1/testmodel_1.keras')
# Function to generate a response
def generate_response(input_text):
    input_seq = tokenizer.texts_to_sequences([input_text])
    input_seq = pad_sequences(input_seq, maxlen=max_len, padding='post')
    prediction = model.predict([input_seq, input_seq])
    response_seq = np.argmax(prediction[0], axis=-1)
    response = ' '.join(tokenizer.index_word.get(idx, '') for idx in response_seq if idx != 0)
    return response.strip()

# Interactive loop
while True:
    input_text = input("You: ")
    response = generate_response(input_text)
    print("Bot:", response)
