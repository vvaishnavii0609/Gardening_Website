import numpy as np
import string
from collections import defaultdict
import random

# ------------------------ DATA PREPROCESSING ----------------------------

def tokenize(text):
    return text.lower().translate(str.maketrans('', '', string.punctuation)).split()

# Prepare vocabulary
def build_vocab(data):
    vocab = defaultdict(lambda: len(vocab))
    vocab['<PAD>'] = 0  # Padding token
    vocab['<SOS>'] = 1  # Start of sentence token
    vocab['<EOS>'] = 2  # End of sentence token
    
    for pair in data:
        question = tokenize(pair['question'])
        answer = tokenize(pair['answer'])
        for word in question + answer:
            vocab[word]  # Add word to vocab
    return dict(vocab)

def text_to_sequence(text, vocab, max_len=20):
    tokens = tokenize(text)
    sequence = [vocab.get(word, vocab['<PAD>']) for word in tokens]
    sequence = [vocab['<SOS>']] + sequence[:max_len-2] + [vocab['<EOS>']]  # Ensure <SOS> and <EOS>
    return sequence + [vocab['<PAD>']] * (max_len - len(sequence))  # Pad to fixed length

# ------------------------ DATA EXAMPLE ----------------------------
data = [
    {"question": "How often should I water my garden?", "answer": "It depends on the type of plants and the climate, but generally, gardens need about 1 inch of water per week."},
    {"question": "What is the capital of France?", "answer": "Paris is the capital of France."},
    {"question": "How do I bake a cake?", "answer": "To bake a cake, mix the ingredients, preheat the oven, and bake for 30 minutes."}
]

vocab = build_vocab(data)
max_len = 20

X = [text_to_sequence(pair['question'], vocab, max_len) for pair in data]
Y = [text_to_sequence(pair['answer'], vocab, max_len) for pair in data]

# ------------------------ MODEL ARCHITECTURE ----------------------------

class Encoder:
    def __init__(self, vocab_size, hidden_size):
        self.Wxh = np.random.randn(hidden_size, vocab_size) * 0.01
        self.Whh = np.random.randn(hidden_size, hidden_size) * 0.01
        self.bh = np.zeros((hidden_size, 1))
        self.hidden_size = hidden_size
    
    def forward(self, inputs):
        h = np.zeros((self.hidden_size, 1))
        self.hidden_states = []
        for word_idx in inputs:
            x = np.zeros((len(self.Wxh[0]), 1))
            x[word_idx] = 1
            h = np.tanh(np.dot(self.Wxh, x) + np.dot(self.Whh, h) + self.bh)
            self.hidden_states.append(h)
        return self.hidden_states

    def backward(self, d_hidden):
        d_Wxh, d_Whh, d_bh = np.zeros_like(self.Wxh), np.zeros_like(self.Whh), np.zeros_like(self.bh)
        for dh in reversed(d_hidden):
            d_bh += dh
            d_Wxh += np.outer(dh, self.hidden_states)
            d_Whh += np.outer(dh, self.hidden_states)
        return d_Wxh, d_Whh, d_bh

class Attention:
    def calculate_attention(self, query, keys, values):
        scores = [np.dot(query.T, k) for k in keys]
        attention_weights = np.exp(scores) / np.sum(np.exp(scores))
        context_vector = sum(w * v for w, v in zip(attention_weights, values))
        return context_vector, attention_weights

    def backward(self, d_context, keys, values):
        d_query = sum(d_context * k for k in keys)
        return d_query

class Decoder:
    def __init__(self, vocab_size, hidden_size):
        self.Wxh = np.random.randn(hidden_size, vocab_size) * 0.01
        self.Whh = np.random.randn(hidden_size, hidden_size) * 0.01
        self.Who = np.random.randn(vocab_size, hidden_size) * 0.01
        self.bh = np.zeros((hidden_size, 1))
        self.bo = np.zeros((vocab_size, 1))
        self.hidden_size = hidden_size
    
    def forward(self, inputs, hidden, context):
        outputs = []
        h = hidden
        for word_idx in inputs:
            x = np.zeros((len(self.Wxh[0]), 1))
            x[word_idx] = 1
            h = np.tanh(np.dot(self.Wxh, x) + np.dot(self.Whh, h) + np.dot(self.Who, context) + self.bh)
            o = np.dot(self.Who, h) + self.bo
            outputs.append(o)
        return outputs

    def backward(self, d_output, hidden, context, inputs):
        d_Wxh, d_Whh, d_Who, d_bh = np.zeros_like(self.Wxh), np.zeros_like(self.Whh), np.zeros_like(self.Who), np.zeros_like(self.bh)
        for do in d_output:
            d_Wxh += np.outer(do, hidden)
            d_Whh += np.outer(do, hidden)
            d_Who += np.outer(do, context)
            d_bh += do
        return d_Who, d_Wxh, d_Whh, d_bh

# ------------------------ TRAINING ----------------------------

class GradientDescentOptimizer:
    def __init__(self, lr):
        self.lr = lr

    def update(self, weights, gradients):
        for w, g in zip(weights, gradients):
            w -= self.lr * g

# Hyperparameters
hidden_size = 128
vocab_size = len(vocab)
epochs = 1000
learning_rate = 0.01
batch_size = 2

# Initialize model
encoder = Encoder(vocab_size, hidden_size)
attention = Attention()
decoder = Decoder(vocab_size, hidden_size)
optimizer = GradientDescentOptimizer(lr=learning_rate)

# Training loop
for epoch in range(epochs):
    total_loss = 0
    for i in range(0, len(X), batch_size):
        X_batch = np.array(X[i:i + batch_size])
        Y_batch = np.array(Y[i:i + batch_size])

        for j in range(len(X_batch)):
            # Forward pass through encoder
            encoder_hidden_states = encoder.forward(X_batch[j])

            # Forward pass through decoder
            batch_loss = 0
            context_vector, _ = attention.calculate_attention(encoder_hidden_states[-1], encoder_hidden_states, encoder_hidden_states)
            decoder_output = decoder.forward(Y_batch[j], encoder_hidden_states[-1], context_vector)
            
            # Simplified loss calculation
            loss = np.sum((decoder_output[-1] - Y_batch[j]) ** 2)  # Mean squared error loss
            batch_loss += loss

            # Backpropagation
            d_output = decoder_output[-1] - Y_batch[j]
            d_Who, d_Wxh, d_Whh, d_bh = decoder.backward(d_output, encoder_hidden_states[-1], context_vector, Y_batch[j])
            d_context_vector = np.sum(d_output, axis=0)
            d_query = attention.backward(d_context_vector, encoder_hidden_states, encoder_hidden_states)
            d_Wxh_enc, d_Whh_enc, d_bh_enc = encoder.backward(d_query)
            
            # Update weights
            optimizer.update([decoder.Who, decoder.Wxh, decoder.Whh, decoder.bh], [d_Who, d_Wxh, d_Whh, d_bh])
            optimizer.update([encoder.Wxh, encoder.Whh, encoder.bh], [d_Wxh_enc, d_Whh_enc, d_bh_enc])

        total_loss += batch_loss

    if epoch % 100 == 0:
        print(f'Epoch {epoch+1}/{epochs}, Loss: {total_loss / len(X)}')

# ------------------------ GENERATE RESPONSE ----------------------------

def generate_response(query, encoder, decoder, attention, vocab, max_len=20):
    query_sequence = text_to_sequence(query, vocab, max_len)

    # Forward pass through encoder
    encoder_hidden_states = encoder.forward(query_sequence)

    # Start decoding process (greedy search)
    response_sequence = [vocab['<SOS>']]
    for _ in range(max_len):
        context_vector, _ = attention.calculate_attention(encoder_hidden_states[-1], encoder_hidden_states, encoder_hidden_states)
        decoder_output = decoder.forward(response_sequence[-1:], encoder_hidden_states[-1], context_vector)
        
        # Get the token with the highest probability (greedy decoding)
        next_token = np.argmax(decoder_output[-1], axis=-1)
        
        # Append to response
        response_sequence.append(next_token)
        
        # Stop if EOS token is generated
        if next_token == vocab['<EOS>']:
            break

    reverse_vocab = {idx: word for word, idx in vocab.items()}
    response = [reverse_vocab[token] for token in response_sequence if token not in [vocab['<SOS>'], vocab['<EOS>'], vocab['<PAD>']]]

    return ' '.join(response)

# ------------------------ TEST CHATBOT ----------------------------

query = "How often should I water my garden?"
response = generate_response(query, encoder, decoder, attention, vocab)
print(f"User: {query}")
print(f"Chatbot: {response}")
