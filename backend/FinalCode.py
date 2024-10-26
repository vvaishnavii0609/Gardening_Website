from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import re
import json
import requests

app = Flask(__name__)
CORS(app)

# Configure MongoDB URI
app.config["MONGO_URI"] = "mongodb://localhost:27017/Mpr_sem5"
mongo = PyMongo(app)

# Load predefined answers from a JSON file
with open('responses.json', 'r') as file:
    responses = json.load(file)

# Keywords mapping to responses
keywords = {
    "what": ["garden", "gardening", "soil", "plant", "flower", "vegetable", "herb", "tree", "shrub", "weed"],
    "how": ["water", "prune", "grow", "fertilize", "mulch", "transplant", "divide", "support", "control_pests", "plan"],
    "when": ["plant", "harvest", "prune", "transplant", "feed", "sow", "water", "mulch", "start_indoor", "apply_fertilizer"],
    "why": ["compost", "mulch", "fertilize", "rotate", "divide", "pest_control", "weeding", "garden_design", "sunlight", "soil_health", "environment"]
}

def chatbot_response(user_input):
    user_input = user_input.lower()
    user_input = re.sub(r'\W', ' ', user_input)
    
    words = user_input.split()

    question_type = None
    for word in words:
        if word in keywords:
            question_type = word
            break
    
    if question_type:
        for keyword in keywords[question_type]:
            if keyword in words:
                return responses.get(f"{question_type}_{keyword}", responses["unknown"])
    
    return responses["unknown"]

@app.route('/api/plants', methods=['POST'])
def add_plant():
    try:
        plant_data = request.json
        result = mongo.db.plants.insert_one(plant_data)
        plant_data['_id'] = str(result.inserted_id)
        return jsonify({"message": "Plant uploaded successfully", "plant": plant_data}), 201
    except Exception as e:
        return jsonify({"message": "Error uploading plant", "error": str(e)}), 500

@app.route('/api/plants', methods=['GET'])
def get_plants():
    try:
        plants = list(mongo.db.plants.find())
        for plant in plants:
            plant['_id'] = str(plant['_id'])
        return jsonify(plants), 200
    except Exception as e:
        return jsonify({"message": "Error fetching plants", "error": str(e)}), 500

@app.route('/generate_response', methods=['POST'])
def api_generate_response():
    data = request.json
    input_text = data['input_text']
    response = chatbot_response(input_text)
    return jsonify({'response': response})

@app.route('/api/weather', methods=['POST'])
def get_weather():
    try:
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
        response = requests.get(weather_url)
        weather_data = response.json()
        
        return jsonify(weather_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
