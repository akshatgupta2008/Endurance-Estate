from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware

# Load your trained model
model = joblib.load("house_price_model.pkl")

# Create the FastAPI app
app = FastAPI()

# Allow CORS for your Next.js frontend
origins = [
    "http://localhost:3000",  # Allow your Next.js app (development)
    "http://frontend:3000",   # Allow Docker frontend service
    "http://127.0.0.1:3000",  # Allow local development
    # Add more origins if needed
]

# Add CORSMiddleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specifies which origins are allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define a model for the input data
class Features(BaseModel):
    Area: int
    Bedrooms: int
    Bathrooms: int
    Floors: int
    YearBuilt: int
    Location: str  # This may need to be encoded
    Condition: str  # This may need to be encoded
    Garage: int

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "real-estate-ml-api"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Real Estate ML API", "docs": "/docs"}

# Endpoint to predict house price
@app.post("/predict/")
async def predict(features: Features):
    try:
        # Handle the encoding of categorical features
        location_mapping = {'Downtown': 1, 'Urban': 2, 'Suburban': 3, 'Rural': 4}
        condition_mapping = {'Fair': 1, 'Excellent': 2, 'Poor': 3, 'Good': 4}

        encoded_location = location_mapping.get(features.Location, 0)  # Default to 0 if not found
        encoded_condition = condition_mapping.get(features.Condition, 0)  # Default to 0 if not found

        # Prepare the features for the model
        input_features = np.array([
            features.Area,
            features.Bedrooms,
            features.Bathrooms,
            features.Floors,
            features.YearBuilt,
            encoded_location,  # Encoded Location
            encoded_condition,  # Encoded Condition
            features.Garage
        ]).reshape(1, -1)
        
        print(input_features)

        # Get prediction
        predicted_price = model.predict(input_features)[0]
        print("Predicted price:", predicted_price)

        # Return the predicted price in a dictionary as a JSON response
        return {"predicted_price": str(predicted_price)}

    except Exception as e:
        # Return a proper error message in case of exception
        return {"error": str(e)}, 500
