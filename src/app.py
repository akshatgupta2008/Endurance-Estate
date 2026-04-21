from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
from datetime import datetime, timezone
import os

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
        pivot_year = 2020

        # Handle the encoding of categorical features
        location_mapping = {'Downtown': 1, 'Urban': 2, 'Suburban': 3, 'Rural': 4}
        condition_mapping = {'Fair': 1, 'Excellent': 2, 'Poor': 3, 'Good': 4}

        encoded_location = location_mapping.get(features.Location, 0)  # Default to 0 if not found
        encoded_condition = condition_mapping.get(features.Condition, 0)  # Default to 0 if not found

        # Prepare the features for the model
        # NOTE: The explicit year_factor logic below enforces "newer year => higher price".
        # To prevent the ML model from contradicting that rule, we feed a fixed pivot year
        # into the model and let year_factor control the year effect.
        input_features = np.array([
            features.Area,
            features.Bedrooms,
            features.Bathrooms,
            features.Floors,
            pivot_year,
            encoded_location,  # Encoded Location
            encoded_condition,  # Encoded Condition
            features.Garage
        ]).reshape(1, -1)
        
        print(input_features)

        # Get prediction
        predicted_price = float(model.predict(input_features)[0])

        # Ensure: newer property => higher price (monotonic year-based adjustment)
        current_year = datetime.now(timezone.utc).year
        year_built = int(features.YearBuilt)
        year_built = max(1800, min(year_built, current_year + 1))

        # Piecewise scaling so 2020+ years are valued higher than <2020.
        baseline_year = 1980
        max_year = current_year + 1

        # < 2020: much lower weighting for older properties (e.g., near year 2000)
        pre_low = 0.70
        pre_high = 0.95

        # >= 2020: clearly higher weighting for newer properties (e.g., near 2026)
        post_low = 1.15
        post_high = 1.35

        if year_built < pivot_year:
            denom = max(1, (pivot_year - 1) - baseline_year)
            t = (year_built - baseline_year) / denom
            t = max(0.0, min(1.0, t))
            year_factor = pre_low + t * (pre_high - pre_low)
        else:
            denom = max(1, max_year - pivot_year)
            t = (year_built - pivot_year) / denom
            t = max(0.0, min(1.0, t))
            year_factor = post_low + t * (post_high - post_low)

        adjusted_price = max(0.0, predicted_price) * year_factor

        # Scale to match today's market rates (INR). Tune via env var.
        try:
            market_multiplier = float(os.getenv("MARKET_PRICE_MULTIPLIER", "50"))
        except ValueError:
            market_multiplier = 50.0

        market_multiplier = max(1.0, market_multiplier)
        adjusted_price *= market_multiplier

        adjusted_price_int = int(round(adjusted_price))
        print(
            "Predicted price (raw):", predicted_price,
            "YearBuilt:", year_built,
            "Year factor:", year_factor,
            "Market multiplier:", market_multiplier,
            "Adjusted:", adjusted_price_int,
        )

        # Return the predicted price in a dictionary as a JSON response
        return {"predicted_price": adjusted_price_int}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
