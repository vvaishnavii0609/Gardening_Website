import numpy as np
import re

# Step 1: Define Keywords and Responses
keyword_responses = {
    "planting": "Ensure to plant during the right season. Use soil testing to decide on the best crops.",
    "irrigation": "Irrigation methods depend on your crop and region. Consider drip irrigation for efficiency.",
    "pest control": "Integrated Pest Management (IPM) strategies can help you control pests effectively.",
    "fertilization": "Regular soil testing can guide you in choosing the right type of fertilizer.",
    "harvesting": "Harvesting at the right time ensures maximum yield. Monitor crop maturity closely.",
    "crop rotation": "Crop rotation can enhance soil health and reduce pests.",
    "organic farming": "Organic farming focuses on sustainable practices and avoiding synthetic fertilizers.",
    "climate change": "Adapt your farming practices to mitigate the effects of climate change.",
    "soil health": "Healthy soil is critical for successful farming. Regular testing helps maintain soil quality.",
    "weed control": "Mulching and regular monitoring can help control weeds effectively."
}

# Extract keywords and responses
keywords = list(keyword_responses.keys())
responses = list(keyword_responses.values())

# Step 2: Tokenization Function
def tokenize(text):
    """Tokenize the input text and return a list of tokens."""
    tokens = re.findall(r'\b\w+\b', text.lower())
    return tokens

# Step 3: Manual Vectorization
def vectorize(tokens, keywords):
    """Create a bag-of-words representation of the tokens based on the keywords."""
    vector = np.zeros(len(keywords), dtype=int)
    for token in tokens:
        if token in keywords:
            index = keywords.index(token)
            vector[index] += 1  # Increment the count for this keyword
    return vector

# Step 4: Calculate Cosine Similarity
def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors."""
    dot_product = np.dot(vec1, vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

# Step 5: Get the Most Similar Response
def get_most_similar_response(user_query):
    """Get the best response based on the user's query."""
    user_tokens = tokenize(user_query)
    user_vector = vectorize(user_tokens, keywords)
    
    best_index = -1
    best_score = -1
    
    for i, keyword in enumerate(keywords):
        keyword_vector = vectorize([keyword], keywords)
        score = cosine_similarity(user_vector, keyword_vector)
        
        if score > best_score:
            best_score = score
            best_index = i
    
    # Check if the similarity score is significant
    if best_score > 0.1:  # You can adjust this threshold
        return responses[best_index]
    else:
        return "I'm sorry, I don't have information on that topic."

# Step 6: User Interface
def farming_assistant():
    print("Welcome to the Farming Assistant! Ask me anything about farming.")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye! Happy farming!")
            break
        
        # Get response based on keywords
        response = get_most_similar_response(user_input)
        print(f"Assistant: {response}")

# Run the assistant
if __name__ == "__main__":
    farming_assistant()
