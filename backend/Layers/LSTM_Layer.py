import numpy as np

class LSTM:
    def __init__(self, input_size, hidden_size):
        # Initialize input, hidden, and cell state sizes
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # Weights for input, forget, cell, and output gates (i, f, g, o)
        # Weight matrices for inputs (Wx) and for hidden states (Wh)
        self.Wf = np.random.randn(hidden_size, input_size)  # Forget gate
        self.Wi = np.random.randn(hidden_size, input_size)  # Input gate
        self.Wg = np.random.randn(hidden_size, input_size)  # Cell gate
        self.Wo = np.random.randn(hidden_size, input_size)  # Output gate

        self.Uf = np.random.randn(hidden_size, hidden_size)
        self.Ui = np.random.randn(hidden_size, hidden_size)
        self.Ug = np.random.randn(hidden_size, hidden_size)
        self.Uo = np.random.randn(hidden_size, hidden_size)

        # Biases
        self.bf = np.zeros((hidden_size, 1))
        self.bi = np.zeros((hidden_size, 1))
        self.bg = np.zeros((hidden_size, 1))
        self.bo = np.zeros((hidden_size, 1))

        # Cell state and hidden state initialization
        self.h = np.zeros((hidden_size, 1))
        self.c = np.zeros((hidden_size, 1))

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def tanh(self, x):
        return np.tanh(x)

    def forward(self, x_t):
        # x_t is the input at the current timestep (shape: [input_size, 1])
        # Concatenate input and hidden state
        x_t = x_t.reshape(self.input_size, 1)
        
        # Forget gate: f_t = sigmoid(Wf * x_t + Uf * h_t + bf)
        f_t = self.sigmoid(np.dot(self.Wf, x_t) + np.dot(self.Uf, self.h) + self.bf)

        # Input gate: i_t = sigmoid(Wi * x_t + Ui * h_t + bi)
        i_t = self.sigmoid(np.dot(self.Wi, x_t) + np.dot(self.Ui, self.h) + self.bi)

        # Candidate cell state: g_t = tanh(Wg * x_t + Ug * h_t + bg)
        g_t = self.tanh(np.dot(self.Wg, x_t) + np.dot(self.Ug, self.h) + self.bg)

        # Output gate: o_t = sigmoid(Wo * x_t + Uo * h_t + bo)
        o_t = self.sigmoid(np.dot(self.Wo, x_t) + np.dot(self.Uo, self.h) + self.bo)

        # Update cell state: c_t = f_t * c_{t-1} + i_t * g_t
        self.c = f_t * self.c + i_t * g_t

        # Update hidden state: h_t = o_t * tanh(c_t)
        self.h = o_t * self.tanh(self.c)

        return self.h

# Test the LSTM implementation
np.random.seed(42)

input_size = 10   # Input dimension
hidden_size = 20  # Number of LSTM units (hidden size)
lstm = LSTM(input_size, hidden_size)

# Example input for one timestep (input size = 10)
x_t = np.random.randn(input_size)

# Forward pass through the LSTM for the current timestep
h_t = lstm.forward(x_t)

print("Hidden state at current timestep:")
print(h_t)
