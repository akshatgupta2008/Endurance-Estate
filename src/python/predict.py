# # Create the Python directory and script
# mkdir -p python

# # Create the Python prediction script
# cat > python/predict.py << 'EOL'
import sys
import json
import os
import random

def predict_price(features):
    """
    Simple dummy prediction function.
    In a real scenario, this would load and use your ML model.
    """
    # Simple formula to generate a reasonable house price
    base_price = 150000
    
    if features.get('Area'):
        base_price += features['Area'] * 100
    
    if features.get('Bedrooms'):
        base_price += features['Bedrooms'] * 25000
    
    if features.get('Bathrooms'):
        base_price += features['Bathrooms'] * 15000
    
    if features.get('Floors'):
        base_price += features['Floors'] * 20000
    
    # Add random variation
    random_factor = 0.9 + random.random() * 0.2  # 0.9 to 1.1
    return round(base_price * random_factor)

if __name__ == "__main__":
    try:
        # Get input data from command line arguments
        input_json = sys.argv[1]
        features = json.loads(input_json)
        
        # Make a simple prediction (replace this with your model)
        price = predict_price(features)
        
        # Print the prediction (will be captured by Node.js)
        print(json.dumps(price))
    
    except Exception as e:
        # Print error message (will be captured as stderr)
        print(f"Error in prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)
# EOL

# # Make the script executable
# chmod +x python/predict.py

# echo "Python script has been created at ./python/predict.py"