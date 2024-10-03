import numpy as np

def attention(q, k, v, mask=None):
    """
    q: Query matrix (batch_size, seq_len, d_k)
    k: Key matrix (batch_size, seq_len, d_k)
    v: Value matrix (batch_size, seq_len, d_v)
    mask: Mask matrix to ignore certain positions (optional)
    """
    # Step 1: Compute the dot product between Q and K^T (transpose of K)
    d_k = q.shape[-1]  # Dimension of the key vectors
    scores = np.matmul(q, k.transpose(0, 2, 1)) / np.sqrt(d_k)
    
    # Step 2: Apply mask if provided (optional, for padding)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    
    # Step 3: Apply softmax to get attention weights
    attention_weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))  # Shift for numerical stability
    attention_weights /= np.sum(attention_weights, axis=-1, keepdims=True)

    # Step 4: Multiply the attention weights with the Value matrix to get the final output
    output = np.matmul(attention_weights, v)
    
    return output, attention_weights


# Example usage
batch_size = 2
seq_len = 5
d_k = 4  # Dimension of key/query vectors
d_v = 6  # Dimension of value vectors

# Random input data for query (q), key (k), and value (v)
q = np.random.rand(batch_size, seq_len, d_k)
k = np.random.rand(batch_size, seq_len, d_k)
v = np.random.rand(batch_size, seq_len, d_v)

# Call attention layer
output, attention_weights = attention(q, k, v)

print("Attention Output:\n", output)
print("Attention Weights:\n", attention_weights)
