# Required libraries
import numpy as np
import matplotlib.pyplot as plt

example = "Hello! This is an example of a paragraph that has been split into its basic components. I wonder what will come next! Any guesses?"

def tokenize(sequence):
    for punc in ["!", ".", "?"]:
        sequence = sequence.replace(punc, "")
    return [token.lower() for token in sequence.split(" ")]

def build_vocab(data):
    vocab = list(set(tokenize(data)))
    vocab.sort()
    stoi = {word: i for i, word in enumerate(vocab)}
    return stoi

stoi = build_vocab(example)
vocab_size = len(stoi)
print("Vocabulary:", stoi)
print("Vocab Size:", vocab_size)

embedding_dim = 3

embedding_matrix = np.random.rand(vocab_size, embedding_dim)
print("Embedding matrix shape:", embedding_matrix.shape)

def get_embedding(sequence, stoi, embedding_matrix):

    indices = [stoi[word] for word in tokenize(sequence)]

    embedded_sequence = embedding_matrix[indices]
    
    return embedded_sequence

sequence = "I wonder what will come next!"
embedded_sequence = get_embedding(sequence, stoi, embedding_matrix)

print("Embedded Sequence:\n", embedded_sequence)

x, y, z = embedded_sequence[:, 0], embedded_sequence[:, 1], embedded_sequence[:, 2] 
fig = plt.figure()
ax = plt.axes(projection='3d')
ax.scatter(x, y, z)

words = tokenize(sequence)
for i, word in enumerate(words):
    ax.text(x[i], y[i], z[i], word, size=10, zorder=1, color='k') 

ax.set_xlabel('X dimension')
ax.set_ylabel('Y dimension')
ax.set_zlabel('Z dimension')
ax.set_title('3D Embeddings Visualization')
plt.show()
