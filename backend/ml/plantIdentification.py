import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import io
import base64
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions
import json

class PlantIdentificationSystem:
    def __init__(self):
        # Load pre-trained model for plant identification
        self.model = ResNet50(weights='imagenet')
        self.plant_classes = self.load_plant_classes()
        self.confidence_threshold = 0.7
        
    def load_plant_classes(self):
        """Load plant-specific classes from ImageNet"""
        # Filter ImageNet classes to only include plants
        plant_keywords = [
            'plant', 'flower', 'tree', 'leaf', 'rose', 'tulip', 'daisy',
            'sunflower', 'lily', 'orchid', 'cactus', 'fern', 'palm',
            'oak', 'maple', 'pine', 'cherry', 'apple', 'orange', 'lemon'
        ]
        
        # Load ImageNet class names
        with open('imagenet_classes.json', 'r') as f:
            all_classes = json.load(f)
        
        # Filter to plant-related classes
        plant_classes = []
        for i, class_name in enumerate(all_classes):
            if any(keyword in class_name.lower() for keyword in plant_keywords):
                plant_classes.append({
                    'id': i,
                    'name': class_name,
                    'confidence': 0.0
                })
        
        return plant_classes
    
    def preprocess_image(self, image_data):
        """Preprocess image for model input"""
        try:
            # Convert base64 to image
            if isinstance(image_data, str):
                image_bytes = base64.b64decode(image_data.split(',')[1])
                img = Image.open(io.BytesIO(image_bytes))
            else:
                img = Image.open(image_data)
            
            # Resize image
            img = img.resize((224, 224))
            
            # Convert to array and preprocess
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            
            return x
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def identify_plant(self, image_data):
        """Identify plant from image"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_data)
            if processed_image is None:
                return {'error': 'Failed to process image'}
            
            # Make prediction
            predictions = self.model.predict(processed_image)
            
            # Decode predictions
            decoded_predictions = decode_predictions(predictions, top=10)[0]
            
            # Filter plant-related predictions
            plant_predictions = []
            for pred in decoded_predictions:
                class_name = pred[1].lower()
                confidence = float(pred[2])
                
                # Check if it's a plant-related class
                if any(keyword in class_name for keyword in ['plant', 'flower', 'tree', 'leaf']):
                    plant_predictions.append({
                        'name': pred[1],
                        'confidence': confidence,
                        'description': pred[1].replace('_', ' ').title()
                    })
            
            # Return top plant prediction
            if plant_predictions:
                best_prediction = plant_predictions[0]
                if best_prediction['confidence'] > self.confidence_threshold:
                    return {
                        'success': True,
                        'plant_name': best_prediction['name'],
                        'confidence': best_prediction['confidence'],
                        'description': best_prediction['description'],
                        'all_predictions': plant_predictions[:5]
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Plant identification confidence too low',
                        'confidence': best_prediction['confidence']
                    }
            else:
                return {
                    'success': False,
                    'message': 'No plant detected in image'
                }
                
        except Exception as e:
            return {'error': f'Identification failed: {str(e)}'}
    
    def analyze_plant_health(self, image_data):
        """Analyze plant health from image"""
        try:
            # Convert image to OpenCV format
            if isinstance(image_data, str):
                image_bytes = base64.b64decode(image_data.split(',')[1])
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                img = cv2.imread(image_data)
            
            # Convert to HSV for color analysis
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Analyze color distribution
            green_lower = np.array([35, 50, 50])
            green_upper = np.array([85, 255, 255])
            green_mask = cv2.inRange(hsv, green_lower, green_upper)
            green_pixels = cv2.countNonZero(green_mask)
            total_pixels = img.shape[0] * img.shape[1]
            green_percentage = (green_pixels / total_pixels) * 100
            
            # Analyze brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            
            # Health assessment
            health_score = 0
            health_issues = []
            
            if green_percentage < 30:
                health_issues.append('Low green content - possible disease or stress')
                health_score -= 30
            elif green_percentage > 70:
                health_score += 20
            
            if brightness < 100:
                health_issues.append('Low brightness - possible overwatering or disease')
                health_score -= 20
            elif brightness > 200:
                health_issues.append('High brightness - possible sunburn or dehydration')
                health_score -= 15
            
            # Normalize health score
            health_score = max(0, min(100, 50 + health_score))
            
            return {
                'success': True,
                'health_score': health_score,
                'green_percentage': green_percentage,
                'brightness': brightness,
                'health_issues': health_issues,
                'recommendations': self.get_health_recommendations(health_issues)
            }
            
        except Exception as e:
            return {'error': f'Health analysis failed: {str(e)}'}
    
    def get_health_recommendations(self, health_issues):
        """Generate recommendations based on health issues"""
        recommendations = []
        
        for issue in health_issues:
            if 'Low green content' in issue:
                recommendations.append('Check for pests, diseases, or nutrient deficiencies')
                recommendations.append('Ensure proper watering and lighting conditions')
            elif 'Low brightness' in issue:
                recommendations.append('Reduce watering frequency')
                recommendations.append('Check for root rot or fungal diseases')
            elif 'High brightness' in issue:
                recommendations.append('Move plant to shadier location')
                recommendations.append('Increase watering frequency')
        
        return recommendations

# Usage example
if __name__ == "__main__":
    plant_id = PlantIdentificationSystem()
    
    # Test with sample image
    # result = plant_id.identify_plant("path/to/image.jpg")
    # print(result) 