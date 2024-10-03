from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

app = Flask(__name__)
CORS(app)

with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)

max_len = 47

model = tf.keras.models.load_model('improved_model.keras')

def generate_response(input_text):
    input_seq = tokenizer.texts_to_sequences([input_text])
    input_seq = pad_sequences(input_seq, maxlen=max_len, padding='post')

    prediction = model.predict([input_seq, input_seq])

    response_seq = np.argmax(prediction[0], axis=-1)
    response = ' '.join(tokenizer.index_word.get(idx, '') for idx in response_seq if idx != 0)
    return response.strip()

@app.route('/generate_response', methods=['POST'])
def api_generate_response():
    data = request.json
    input_text = data['input_text']
    response = generate_response(input_text)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
