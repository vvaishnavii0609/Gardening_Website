import numpy as np

# Function for one-hot encoding
def one_hot_encode(sequences, num_classes):
    """Convert sequences of integers into one-hot encoded vectors."""
    return np.eye(num_classes)[sequences]

# Embedding Layer
class Embedding:
    def __init__(self, input_dim, output_dim):
        self.input_dim = input_dim
        self.output_dim = output_dim
        # Randomly initialize embedding weights
        self.weights = np.random.rand(input_dim, output_dim)

    def forward(self, x):
        """Convert input sequences to dense vectors."""
        return self.weights[x]

# LSTM Layer
class LSTM:
    def __init__(self, input_dim, hidden_dim):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        # Initialize weights
        self.Wf = np.random.rand(hidden_dim, input_dim + hidden_dim)
        self.Wi = np.random.rand(hidden_dim, input_dim + hidden_dim)
        self.Wc = np.random.rand(hidden_dim, input_dim + hidden_dim)
        self.Wo = np.random.rand(hidden_dim, input_dim + hidden_dim)
        self.bf = np.zeros((hidden_dim, 1))
        self.bi = np.zeros((hidden_dim, 1))
        self.bc = np.zeros((hidden_dim, 1))
        self.bo = np.zeros((hidden_dim, 1))

    def forward(self, x):
        """Perform a forward pass through the LSTM layer."""
        self.batch_size, self.seq_len, _ = x.shape
        self.h = np.zeros((self.batch_size, self.hidden_dim))
        self.c = np.zeros((self.batch_size, self.hidden_dim))
        
        self.h_t = []
        for t in range(self.seq_len):
            x_t = x[:, t, :]  # Current timestep input
            combined = np.hstack((self.h, x_t))
            
            ft = self.sigmoid(np.dot(self.Wf, combined.T) + self.bf)
            it = self.sigmoid(np.dot(self.Wi, combined.T) + self.bi)
            ct_hat = np.tanh(np.dot(self.Wc, combined.T) + self.bc)
            self.c = ft * self.c + it * ct_hat
            ot = self.sigmoid(np.dot(self.Wo, combined.T) + self.bo)
            self.h = ot * np.tanh(self.c)
            self.h_t.append(self.h)

        self.h_t = np.array(self.h_t)
        return self.h_t

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

# Attention Layer
class Attention:
    def forward(self, lstm_output):
        """Calculate the attention scores and output the weighted sum."""
        # Simple additive attention mechanism
        scores = np.tanh(lstm_output)  # Using tanh activation for attention scores
        weights = np.exp(scores) / np.sum(np.exp(scores), axis=0)  # Softmax
        attention_output = np.sum(weights[:, :, np.newaxis] * lstm_output, axis=0)  # Weighted sum
        return attention_output, weights

# Dense Layer
class Dense:
    def __init__(self, input_dim, output_dim):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.weights = np.random.rand(output_dim, input_dim)
        self.bias = np.zeros((output_dim, 1))

    def forward(self, x):
        """Perform a forward pass through the dense layer."""
        return np.dot(self.weights, x) + self.bias

# Gradient Clipping Function
def clip_gradients(grads, max_norm):
    """Clip gradients to prevent exploding gradients."""
    norm = np.linalg.norm(grads)
    if norm > max_norm:
        return grads * (max_norm / norm)
    return grads

# Complete Neural Network Model
class NeuralNetwork:
    def __init__(self, vocab_size, embed_dim, hidden_dim, output_dim):
        self.embedding = Embedding(vocab_size, embed_dim)
        self.lstm = LSTM(embed_dim, hidden_dim)
        self.attention = Attention()
        self.dense = Dense(hidden_dim, output_dim)

    def forward(self, x):
        """Forward pass through the entire network."""
        embedded = self.embedding.forward(x)
        lstm_output = self.lstm.forward(embedded)
        attention_output, _ = self.attention.forward(lstm_output)
        output = self.dense.forward(attention_output)
        return output

# Example usage
def main():
    # Hyperparameters
    vocab_size = 100  # Size of vocabulary
    embed_dim = 64    # Embedding dimension
    hidden_dim = 128  # LSTM hidden state dimension
    output_dim = 10   # Number of output classes
    max_seq_length = 5  # Sequence length

    # Sample input: batch of sequences (batch_size x seq_len)
    batch_size = 3
    sample_sequences = np.random.randint(0, vocab_size, (batch_size, max_seq_length))

    # Instantiate and run the model
    model = NeuralNetwork(vocab_size, embed_dim, hidden_dim, output_dim)
    output = model.forward(sample_sequences)

    print("Output shape:", output.shape)  # Should be (output_dim, batch_size)

if __name__ == "__main__":
    main()
