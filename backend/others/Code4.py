import json
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, LSTM, Dense, Embedding

# Step 1: Loading and Processing Data
with open('questions_answers.json', 'r') as f:
    data = json.load(f)

questions = [item['question'] for item in data]
answers = [item['answer'] for item in data]

tokenizer = Tokenizer()
tokenizer.fit_on_texts(questions + answers)

questions_seq = tokenizer.texts_to_sequences(questions)
answers_seq = tokenizer.texts_to_sequences(answers)

max_len = max(len(seq) for seq in questions_seq + answers_seq)
questions_padded = pad_sequences(questions_seq, maxlen=max_len, padding='post')
answers_padded = pad_sequences(answers_seq, maxlen=max_len, padding='post')

vocab_size = len(tokenizer.word_index) + 1

# Step 2: Building the Model
embedding_dim = 256
latent_dim = 256

encoder_inputs = Input(shape=(max_len,))
encoder_embedding = Embedding(vocab_size, embedding_dim)(encoder_inputs)
encoder_lstm, state_h, state_c = LSTM(latent_dim, return_state=True)(encoder_embedding)
encoder_states = [state_h, state_c]

decoder_inputs = Input(shape=(max_len,))
decoder_embedding = Embedding(vocab_size, embedding_dim)(decoder_inputs)
decoder_lstm, _, _ = LSTM(latent_dim, return_sequences=True, return_state=True)(decoder_embedding, initial_state=encoder_states)
decoder_dense = Dense(vocab_size, activation='softmax')
decoder_outputs = decoder_dense(decoder_lstm)

model = Model([encoder_inputs, decoder_inputs], decoder_outputs)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')

# Step 3: Training the Model
decoder_target_data = np.zeros_like(answers_padded)
decoder_target_data[:, :-1] = answers_padded[:, 1:]

model.fit([questions_padded, answers_padded], decoder_target_data, batch_size=64, epochs=100, validation_split=0.2)
model.save('chatbot_model.h5')

# Step 4: Creating Interaction Functions
def preprocess_input(text):
    seq = tokenizer.texts_to_sequences([text])
    padded_seq = pad_sequences(seq, maxlen=max_len, padding='post')
    return padded_seq

def decode_sequence(predicted_seq):
    decoded_sentence = []
    for idx in np.argmax(predicted_seq[0], axis=1):
        word = tokenizer.index_word.get(idx)
        if word == '<end>' or word is None:
            break
        decoded_sentence.append(word)
    return ' '.join(decoded_sentence)

def generate_response(user_input):
    input_seq = preprocess_input(user_input)
    decoder_input = np.zeros((1, max_len))
    encoder_outputs, state_h, state_c = encoder_lstm.predict(input_seq)
    encoder_states = [state_h, state_c]
    response = ''
    for _ in range(max_len):
        output_tokens, h, c = decoder_lstm.predict([decoder_input] + encoder_states)
        decoded_word = decode_sequence(output_tokens)
        response += ' ' + decoded_word
        if decoded_word == '<end>':
            break
        decoder_input = np.argmax(output_tokens, axis=-1)
        encoder_states = [h, c]
    return response.strip()

# Step 5: Setting Up a Chat Loop
def chatbot():
    print("Start chatting with the bot! (Type 'quit' to stop)")
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            print("Chatbot: Goodbye!")
            break
        response = generate_response(user_input)
        print(f"Chatbot: {response}")

chatbot()
