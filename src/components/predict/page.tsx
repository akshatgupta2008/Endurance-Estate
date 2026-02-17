'use client';
import React from "react";
import { useState } from "react";

const Predict = () => {
    // const features = ['Area', 'Bedrooms', 'Bathrooms', 'Floors', 'YearBuilt', 'Location', 'Condition', 'Garage'];

    // Initialize state with null values to represent empty inputs
    // const [inputValues, setInputValues] = useState<(number | null)[]>(
    //     Array(features.length).fill(null)
    // );
    const [area, setArea] = useState<string | null>(null);
    const [bedrooms, setBedrooms] = useState<string | null>(null);
    const [bathrooms, setBathrooms] = useState<string | null>(null);
    const [floors, setFloors] = useState<string | null>(null);
    const [yearBuilt, setYearBuilt] = useState<string | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [condition, setCondition] = useState<string | null>(null);
    const [garage, setGarage] = useState<string | null>(null);



    const [prediction, setPrediction] = useState<number | string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            
            const featureObject = {
                Area: Number(area), 
                Bedrooms: Number(bedrooms),
                Bathrooms: Number(bathrooms),
                Floors: Number(floors),
                YearBuilt: Number(yearBuilt),
                Location: location,
                Condition: condition,
                Garage: Number(garage),
            };


            console.log("Sending features:", featureObject); 

            const response = await fetch("http://127.0.0.1:8000/predict/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(featureObject)  
            });

            console.log("Response:", response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log("Data:", data); 
            setPrediction(data.predicted_price);

        } catch (err) {
            console.error('Prediction error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white px-4 py-12">
            <main className="max-w-4xl mx-auto bg-white rounded-none shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-800 p-8 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-0"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold">PRICE PREDICTION</h1>
                        <p className="text-gray-300 mt-2 text-lg">Discover the true value of your property</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Area (sq ft)</label>
                            <input
                                type="text"
                                value={area || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setArea(value);
                                    }
                                }}                                
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 1200"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Bedrooms</label>
                            <input
                                type="text"
                                value={bedrooms || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setBedrooms(value);
                                    }
                                }}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 3"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Bathrooms</label>
                            <input
                                type="text"
                                value={bathrooms || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setBathrooms(value);
                                    }
                                }}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Floors</label>
                            <input
                                type="text"
                                value={floors || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setFloors(value);
                                    }
                                }}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 2"
                                inputMode="numeric"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Year Built</label>
                            <input
                                type="text"
                                value={yearBuilt || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setYearBuilt(value);
                                    }
                                }}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 2005"
                                inputMode="numeric"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Location</label>
                            <input
                                type="text"
                                value={location || ''}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. Downtown"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Condition</label>
                            <select
                                value={condition || ''}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                required
                            >
                                <option value="" disabled>Select condition</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium">Garage Spaces</label>
                            <input
                                type="text"
                                value={garage || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setGarage(value);
                                    }
                                }}
                                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition placeholder-gray-400 text-gray-900 bg-gray-50"
                                placeholder="e.g. 2"
                                inputMode="numeric"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-4 px-6 hover:bg-gray-700 transition duration-300 font-medium tracking-wide text-lg"
                        >
                            ESTIMATE PROPERTY VALUE
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mx-8 mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {prediction !== null && !error && (
                    <div className="mx-8 mb-8 p-8 border border-gray-200 bg-gray-50 text-center">
                        <h2 className="font-semibold text-xl text-gray-700 mb-2">ESTIMATED PROPERTY VALUE</h2>
                        <p className="text-4xl font-bold text-gray-800">
                        ₹{typeof prediction === 'number' ? prediction.toLocaleString() : prediction}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Predict;