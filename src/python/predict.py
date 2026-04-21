# # Create the Python directory and script
# mkdir -p python

# # Create the Python prediction script
# cat > python/predict.py << 'EOL'
import sys
import json
import os
import random
from datetime import datetime, timezone


def _parse_lenient_object(s: str) -> dict:
    """Parse PowerShell-quote-stripped pseudo-JSON like {Area:1200,Location:Downtown}.

    Node.js (used by the app) passes valid JSON, but PowerShell sometimes strips
    quotes when invoking executables with JSON-like arguments.
    """
    s = (s or "").strip()
    if s.startswith("{") and s.endswith("}"):
        s = s[1:-1]

    result: dict = {}
    if not s:
        return result

    parts = [p.strip() for p in s.split(",") if p.strip()]
    for part in parts:
        if ":" not in part:
            continue
        key, raw_value = part.split(":", 1)
        key = key.strip().strip('"').strip("'")
        raw_value = raw_value.strip().strip('"').strip("'")

        # Try numeric first
        try:
            if "." in raw_value:
                value = float(raw_value)
            else:
                value = int(raw_value)
        except ValueError:
            value = raw_value

        result[key] = value
    return result

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

    # Year built: newer property => higher price (monotonic adjustment)
    year_built = features.get('YearBuilt')
    if year_built is not None:
        try:
            year_built = int(year_built)
            current_year = datetime.now(timezone.utc).year
            year_built = max(1800, min(year_built, current_year + 1))

            baseline_year = 1980
            max_year = current_year + 1
            low_factor = 0.85
            high_factor = 1.15

            if max_year > baseline_year:
                t = (year_built - baseline_year) / (max_year - baseline_year)
                t = max(0.0, min(1.0, t))
                year_factor = low_factor + t * (high_factor - low_factor)
            else:
                year_factor = 1.0

            base_price = base_price * year_factor
        except (TypeError, ValueError):
            pass
    
    # Add random variation
    random_factor = 0.9 + random.random() * 0.2  # 0.9 to 1.1
    return round(base_price * random_factor)

if __name__ == "__main__":
    try:
        # Get input data from command line arguments
        input_json = sys.argv[1]
        try:
            features = json.loads(input_json)
        except json.JSONDecodeError:
            features = _parse_lenient_object(input_json)
        
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