'use client';
import React, { useState, useEffect } from 'react';
import { query, where, collection, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/firebase'; 
import { ArrowRight, Bed, Bath, Move, Map, Calendar } from 'lucide-react';

const PropertyCard = () => {
    interface Property {
        id: string;
        image?: string;
        title?: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        beds?: number;
        baths?: number;
        sqft?: number;
        createdAt?: string;
        description?: string;
        price?: number;
        status?: string;
    }

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dominantColor, setDominantColor] = useState('#3b82f6'); 



    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams(window.location.search);
                const id = params.get('id');
                console.log(id);


                if (!id) {
                    throw new Error('Property ID not found in URL');
                }

                const propertyQuery = query(
                    collection(db, 'properties'),
                    where('id', '==', id),
                    limit(1)
                );

                const propertySnap = await getDocs(propertyQuery);

                

                if (propertySnap.empty) {
                    throw new Error('Property not found');
                }

                const propertyData = propertySnap.docs[0].data();

                setProperty(propertyData as Property);

                // Extract dominant color from image
                if (propertyData.image) {
                    extractDominantColor(propertyData.image);
                }
            } catch (err) {
                console.error('Error fetching property:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, []);

    const extractDominantColor = (imageUrl: string) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, img.width, img.height);
            } else {
                console.error('Failed to get 2D context for canvas');
            }

            if (!ctx) {
                console.error('Failed to get 2D context for canvas');
                return;
            }
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            const pixelCount = data.length / 4;

            // Simple averaging for demo purposes
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            r = Math.floor(r / pixelCount);
            g = Math.floor(g / pixelCount);
            b = Math.floor(b / pixelCount);

            const color = `rgb(${r}, ${g}, ${b})`;
            setDominantColor(color);
        };

        img.onerror = () => {
            console.error('Error loading image for color extraction');
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                    <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return null;
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(property.price ?? 0);

    // Format date
    const formattedDate = property.createdAt
        ? new Date(property.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : ''; // Provide a fallback value if property.createdAt is falsy

    // Generate a lighter version of the dominant color for backgrounds
    const generateLighterColor = (color: string) => {
        // Extract RGB values
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);

            const lighterR = Math.min(r + 180, 255);
            const lighterG = Math.min(g + 180, 255);
            const lighterB = Math.min(b + 180, 255);

            return `rgba(${lighterR}, ${lighterG}, ${lighterB}, 0.15)`;
        }
        return 'rgba(59, 130, 246, 0.1)'; // Default light blue
    };


    const handleBuy = () => {
        console.log('Buy Now clicked');
        try {
            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST,
              amount: Number(property.price) * 100,
              currency: 'INR',
              description: `Buy/Rent: ${property.title}`,
              image: '',
              handler: async function (response: any) {
                try {
                  console.log('Payment successful:', response);
                //   router.push(`/payment-successful-gaumata?donorId=${donorId}`);
                } catch (error) {
                  console.error('Error processing successful payment:', error);
                }
              },
              modal: {
                ondismiss: function () {
                  console.log('Donation cancelled');
                }
              },
              prefill: {
                name: property.title,
              },
              notes: {
                address: property.address,
              },
              theme: {
                color: '#827efc',
              },
            };
      
            const rzp1 = new (window as any).Razorpay(options);
      
            rzp1.on('payment.failed', function (response: any) {
              console.error('Donation failed:', response.error);
            });
      
            rzp1.open();
      
          } catch (err) {
            console.error('Error initiating Razorpay payment:', err);
          }
    }


    const lightColor = generateLighterColor(dominantColor);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Hero image */}
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                        <span
                            className="px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: dominantColor, color: 'white' }}
                        >
                            {property.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        {/* Left section */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                            <p className="text-gray-600 mb-2">{property.address}, {property.city}, {property.state} {property.zipCode}</p>

                            <div className="flex flex-wrap gap-6 my-6">
                                <div className="flex items-center">
                                    <Bed className="w-5 h-5 mr-2 text-gray-500" />
                                    <span className="font-medium">{property.beds} Beds</span>
                                </div>
                                <div className="flex items-center">
                                    <Bath className="w-5 h-5 mr-2 text-gray-500" />
                                    <span className="font-medium">{property.baths} Baths</span>
                                </div>
                                <div className="flex items-center">
                                    <Move className="w-5 h-5 mr-2 text-gray-500" />
                                    <span className="font-medium">{property.sqft} sqft</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                                    <span className="font-medium">Listed on {formattedDate}</span>
                                </div>
                            </div>

                            <div
                                className="rounded-lg p-6 my-6"
                                style={{ backgroundColor: lightColor }}
                            >
                                <h2 className="text-xl font-semibold mb-3">About This Property</h2>
                                <p className="text-gray-700 leading-relaxed">{property.description}</p>
                            </div>
                        </div>

                        {/* Right section - Price and actions */}
                        <div className="w-full md:w-80 bg-white rounded-lg shadow-md p-6 border border-gray-100">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold" style={{ color: dominantColor }}>{formattedPrice}</h2>
                            </div>

                            <div className="space-y-3">
                                <button
                                    className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                                    onClick={handleBuy}
                                    style={{ backgroundColor: dominantColor, color: 'white' }}
                                >
                                    {property.status === 'For Sale' ? 'Buy Now' : 'Rent Now'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </button>

                                <button
                                    className="w-full py-3 px-4 rounded-lg font-medium border flex items-center justify-center"
                                    style={{ borderColor: dominantColor, color: dominantColor }}
                                >
                                    Schedule a Tour
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center mb-4">
                                    <Map className="w-5 h-5 mr-2 text-gray-500" />
                                    <span className="font-medium text-gray-700">View on Map</span>
                                </div>
                                <div className="bg-gray-200 h-36 rounded-lg overflow-hidden">
                                    {/* Map placeholder - would be replaced with actual map component */}
                                    <div className="h-full w-full flex items-center justify-center bg-gray-300">
                                        <span className="text-gray-600">Map View</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;