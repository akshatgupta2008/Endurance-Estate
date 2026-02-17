'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            About Endurance Estates
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Revolutionizing the real estate experience by integrating advanced technology with seamless property transactions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Welcome Section */}
        <section className="mb-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Endurance Estates</h2>
          <p className="text-gray-600 text-lg mb-6">
            At Endurance Estates, we revolutionize the real estate experience by integrating advanced technology with seamless property transactions. 
            Whether you're looking to buy, sell, rent, or predict property prices, our platform provides a comprehensive solution for all your real estate needs.
          </p>
          
          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h3>
            <p className="text-gray-600">
              We aim to create a transparent, data-driven, and efficient real estate marketplace that simplifies property dealings 
              while ensuring maximum value for our users.
            </p>
          </div>
        </section>
        
        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What We Offer</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="text-emerald-600 text-2xl mb-4">🔹 Live Property Auctions</div>
              <p className="text-gray-600 flex-grow">Buy and sell properties through our automated auction system.</p>
              <Link href="/live-auction" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                Explore Auctions →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="text-emerald-600 text-2xl mb-4">🔹 Price Prediction</div>
              <p className="text-gray-600 flex-grow">Leverage AI-powered models to predict accurate house prices based on market trends.</p>
              <Link href="/price-prediction" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                Predict Prices →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="text-emerald-600 text-2xl mb-4">🔹 Rental & Leasing Services</div>
              <p className="text-gray-600 flex-grow">Effortlessly find rental properties and manage lease agreements.</p>
              <Link href="/rental-property" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                Find Rentals →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="text-emerald-600 text-2xl mb-4">🔹 Property Maintenance</div>
              <p className="text-gray-600 flex-grow">Get hassle-free property maintenance and leasing support.</p>
              <Link href="/lease-property-maintenance" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                Maintenance Services →
              </Link>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="mb-16 bg-gray-100 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Choose Us?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="text-emerald-600 font-bold mr-4">✔</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Driven Insights</h3>
                <p className="text-gray-600">Make smarter real estate decisions with cutting-edge machine learning models.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-emerald-600 font-bold mr-4">✔</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Seamless Transactions</h3>
                <p className="text-gray-600">A user-friendly experience for buyers, sellers, and tenants.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-emerald-600 font-bold mr-4">✔</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Trust & Transparency</h3>
                <p className="text-gray-600">We prioritize secure and reliable real estate solutions.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="text-center bg-emerald-600 text-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-4">Join us at Endurance Estates</h2>
          <p className="text-xl mb-8">Where technology meets real estate innovation!</p>
          <Link href="/properties" className="inline-block bg-white text-emerald-600 font-semibold py-3 px-8 rounded-md shadow-md hover:bg-gray-100 transition duration-300">
            Explore Properties
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;