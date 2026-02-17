'use client';
import { useState } from "react";
import Link from "next/link";
import img from '../../../public/hero-img.jpg';

export default function Maintenance() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [houseId, setHouseId] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoleSelection = (role: string) => {
    setIsAnimating(true);
    setSelectedRole(role);
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleSubmit = () => {
    if (!houseId.trim()) {
      alert("Please enter a house ID");
      return;
    }
    
    // Navigate to the appropriate page with the house ID
    if (selectedRole === "tenant") {
      window.location.href = `/tenant-maintainance?houseId=${houseId}`;
    } else if (selectedRole === "owner") {
      window.location.href = `/owner-maintainance?houseId=${houseId}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      

      {/* Overlay container with semi-transparent background */}
      <div 
        className="min-h-screen w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${img.src})` }}
      >
        <div className="absolute inset-0 bg-slate-900/60"></div>
        
        {/* Main content */}
        <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col min-h-screen relative z-10">
          <div className="my-auto py-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-wide">
                PROPERTY MAINTENANCE
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mt-6">
                Seamless property management at your fingertips
              </p>
            </div>

            {/* Role selection cards with hover effects */}
            {!selectedRole ? (
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div 
                  onClick={() => handleRoleSelection("tenant")}
                  className="cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-md bg-white/90 p-8 h-80 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
                    <div className="relative z-10 text-center">
                      <div className="bg-blue-50 p-4 rounded-full inline-block mb-6 border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-slate-800">I'm a Tenant</h2>
                      <p className="text-slate-600">Report maintenance issues and track requests</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleRoleSelection("owner")}
                  className="cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-md bg-slate-800/90 p-8 h-80 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]">
                    <div className="relative z-10 text-center">
                      <div className="bg-slate-700 p-4 rounded-full inline-block mb-6 border border-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-white">I'm an Owner</h2>
                      <p className="text-gray-300">Manage your properties and maintenance requests</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                <div className="max-w-md mx-auto">
                  <div className="bg-white rounded-md border border-gray-200 p-8 shadow-xl">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-slate-800">
                        {selectedRole === "tenant" ? "Tenant Access" : "Owner Access"}
                      </h3>
                      <p className="text-slate-600">
                        Please enter your house ID to continue
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="houseId" className="block text-sm font-medium mb-1 text-slate-700">House ID</label>
                        <input
                          id="houseId"
                          type="text"
                          value={houseId}
                          onChange={(e) => setHouseId(e.target.value)}
                          placeholder="Enter your House ID"
                          className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                        />
                      </div>
                      
                      <button
                        onClick={handleSubmit}
                        className={`w-full py-3 rounded-md font-medium text-white transition-all duration-300 ${
                          selectedRole === "tenant" 
                            ? "bg-blue-800 hover:bg-blue-900" 
                            : "bg-slate-800 hover:bg-slate-900"
                        }`}
                      >
                        {selectedRole === "tenant" ? "Report Issue" : "Manage Property"}
                      </button>
                      
                      <button
                        onClick={() => setSelectedRole(null)}
                        className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors duration-300"
                      >
                        ← Back to role selection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {/* <footer className="text-center text-sm text-white/80 mt-auto pt-8">
            <p className="text-lg">Excited to see your future home? Let's get started.</p>
            <p className="mt-2">© 2025 Endurance Estates. All rights reserved.</p>
          </footer> */}
        </div>
      </div>
    </div>
  );
}