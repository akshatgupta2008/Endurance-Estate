// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '@/firebase/firebase';
// import Image from 'next/image';
// import { FiDownload, FiCheck, FiFileText, FiDollarSign, FiHome, FiMapPin, FiUser, FiCalendar, FiHash, FiAlertCircle } from 'react-icons/fi';
// import { generateBlockchainTransaction, verifyAgreement } from '@/utils/blockchain';

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// interface BlockchainTransaction {
//   transactionId: string;
//   blockNumber?: number;
//   network?: string;
//   agreementId?: string;
//   timestamp?: string;
// }

// interface PropertyData {
//   propertyId: string;
//   title: string;
//   price: number;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   image: string;
//   description: string;
// }

// interface AgreementData {
//   propertyData: PropertyData | null;
//   sellerName: string;
//   sellerEmail: string;
//   sellerAddress: string;
//   buyerName: string;
//   buyerEmail: string;
//   buyerAddress: string;
//   agreementDate: string;
//   closingDate: string;
//   agreementPrice: string;
//   downPayment: string;
//   financingDetails: string;
//   specialConditions: string;
//   transactionId: string;
//   blockNumber?: string;
//   network?: string;
//   agreementId?: string;
//   blockTimestamp?: string;
// }

// const initialAgreementData: AgreementData = {
//   propertyData: null,
//   sellerName: '',
//   sellerEmail: '',
//   sellerAddress: '',
//   buyerName: '',
//   buyerEmail: '',
//   buyerAddress: '',
//   agreementDate: new Date().toISOString().split('T')[0],
//   closingDate: '',
//   agreementPrice: '',
//   downPayment: '',
//   financingDetails: '',
//   specialConditions: '',
//   transactionId: ''
// };

// export default function PropertyAgreement() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const propertyId = searchParams.get('id');
  
//   const [agreementData, setAgreementData] = useState<AgreementData>(initialAgreementData);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');
//   const [sellerSigned, setSellerSigned] = useState<boolean>(false);
//   const [buyerSigned, setBuyerSigned] = useState<boolean>(false);
//   const [generatingAgreement, setGeneratingAgreement] = useState<boolean>(false);
//   const [agreementGenerated, setAgreementGenerated] = useState<boolean>(false);
//   const [walletConnected, setWalletConnected] = useState<boolean>(false);
//   const [walletError, setWalletError] = useState<string>('');

//   useEffect(() => {
//     const fetchPropertyData = async () => {
//       if (!propertyId) {
//         setError('Property ID is missing. Please select a property first.');
//         setLoading(false);
//         return;
//       }

//       try {
//         // Fetch property data from Firestore
//         const propertyRef = doc(db, 'properties', propertyId);
//         const propertySnap = await getDoc(propertyRef);

//         if (propertySnap.exists()) {
//           const data = propertySnap.data() as PropertyData;
//           setAgreementData(prev => ({
//             ...prev,
//             propertyData: data,
//             agreementPrice: data.price.toString(),
//             downPayment: (data.price * 0.2).toString() // Default down payment as 20%
//           }));
//         } else {
//           setError('Property not found. Please try again.');
//         }
//       } catch (err) {
//         console.error('Error fetching property:', err);
//         setError('Failed to load property data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPropertyData();
    
//     // Check if wallet is available
//     if (typeof window !== 'undefined' && window.ethereum) {
//       setWalletConnected(true);
      
//       // Listen for account changes
//       window.ethereum.on('accountsChanged', () => {
//         // Reset signed status when account changes
//         setSellerSigned(false);
//         setBuyerSigned(false);
//       });
//     } else {
//       setWalletError('No Ethereum wallet detected. The app will use simulated blockchain transactions.');
//     }
//   }, [propertyId]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setAgreementData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSellerSign = async () => {
//     if (!agreementData.sellerName || !agreementData.sellerEmail) {
//       setError('Please fill in all seller information before signing.');
//       return;
//     }
    
//     try {
//       // In a real implementation, you might request a signature from the connected wallet
//       if (window.ethereum) {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         if (accounts.length === 0) {
//           setError('Please connect your wallet to sign the agreement.');
//           return;
//         }
//       }
      
//       setSellerSigned(true);
//       setError('');
//     } catch (err) {
//       console.error('Error signing as seller:', err);
//       setError('Failed to sign. Please ensure your wallet is connected.');
//     }
//   };

//   const handleBuyerSign = async () => {
//     if (!agreementData.buyerName || !agreementData.buyerEmail) {
//       setError('Please fill in all buyer information before signing.');
//       return;
//     }
    
//     try {
//       // In a real implementation, you might request a signature from the connected wallet
//       if (window.ethereum) {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         if (accounts.length === 0) {
//           setError('Please connect your wallet to sign the agreement.');
//           return;
//         }
//       }
      
//       setBuyerSigned(true);
//       setError('');
//     } catch (err) {
//       console.error('Error signing as buyer:', err);
//       setError('Failed to sign. Please ensure your wallet is connected.');
//     }
//   };

//   const handleGenerateAgreement = async () => {
//     setGeneratingAgreement(true);
//     setError('');

//     // Validate all required fields
//     if (
//       !agreementData.sellerName || 
//       !agreementData.sellerEmail || 
//       !agreementData.buyerName ||
//       !agreementData.buyerEmail ||
//       !agreementData.closingDate ||
//       !agreementData.agreementPrice ||
//       !agreementData.downPayment
//     ) {
//       setError('Please fill in all required fields and ensure both parties have signed before generating the agreement.');
//       setGeneratingAgreement(false);
//       return;
//     }

//     try {
//       // Call blockchain transaction function
//       const transaction = await generateBlockchainTransaction(agreementData) as BlockchainTransaction;
      
//       // Update agreement data with blockchain transaction details
//       setAgreementData(prev => ({
//         ...prev,
//         transactionId: transaction.transactionId,
//         blockNumber: transaction.blockNumber?.toString(),
//         network: transaction.network,
//         agreementId: transaction.agreementId,
//         blockTimestamp: transaction.timestamp
//       }));
//       setAgreementData(prev => ({
//         ...prev,
//         transactionId: transaction.transactionId,
//         blockNumber: transaction.blockNumber?.toString(),
//         network: transaction.network,
//         agreementId: transaction.agreementId,
//         blockTimestamp: transaction.timestamp
//       }));

//       setAgreementGenerated(true);
//     } catch (err) {
//       console.error('Error generating agreement:', err);
//       setError('Failed to generate blockchain agreement. Please try again.');
//     } finally {
//       setGeneratingAgreement(false);
//     }
//   };

//   const handleVerifyAgreement = async () => {
//     if (!agreementData.transactionId) {
//       setError('No transaction ID to verify.');
//       return;
//     }
    
//     try {
//       setGeneratingAgreement(true);
//       const verification = await verifyAgreement(agreementData.transactionId);
      
//       if (verification) {
//         setError('');
//         alert(`Agreement verified on blockchain!`);
//       } else {
//         setError(`Verification failed:`);
//       }
//     } catch (err) {
//       console.error('Error verifying agreement:', err);
//       setError('Failed to verify agreement on blockchain.');
//     } finally {
//       setGeneratingAgreement(false);
//     }
//   };

//   const handleDownloadAgreement = () => {
//     // Create the agreement content
//     const property = agreementData.propertyData;
//     if (!property) return;

//     const agreementContent = `
// REAL ESTATE PURCHASE AGREEMENT

// TRANSACTION ID: ${agreementData.transactionId}
// AGREEMENT ID: ${agreementData.agreementId || 'N/A'}
// BLOCKCHAIN: ${agreementData.network || 'N/A'}
// BLOCK NUMBER: ${agreementData.blockNumber || 'N/A'}
// TIMESTAMP: ${agreementData.blockTimestamp || new Date().toISOString()}
// DATE: ${agreementData.agreementDate}

// PROPERTY DETAILS:
// Property ID: ${property.propertyId}
// Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
// Description: ${property.description}

// SELLER INFORMATION:
// Name: ${agreementData.sellerName}
// Email: ${agreementData.sellerEmail}
// Address: ${agreementData.sellerAddress}

// BUYER INFORMATION:
// Name: ${agreementData.buyerName}
// Email: ${agreementData.buyerEmail}
// Address: ${agreementData.buyerAddress}

// AGREEMENT TERMS:
// Purchase Price: $${Number(agreementData.agreementPrice).toLocaleString()}
// Down Payment: $${Number(agreementData.downPayment).toLocaleString()}
// Closing Date: ${agreementData.closingDate}
// Financing Details: ${agreementData.financingDetails}

// SPECIAL CONDITIONS:
// ${agreementData.specialConditions}

// This agreement is secured by blockchain technology under transaction ID ${agreementData.transactionId}.
// Both parties have electronically signed this agreement on ${agreementData.agreementDate}.

// SELLER SIGNATURE: ${agreementData.sellerName} (Signed electronically)
// BUYER SIGNATURE: ${agreementData.buyerName} (Signed electronically)
// `;

//     // Create a blob and download it
//     const blob = new Blob([agreementContent], { type: 'text/plain' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `property_agreement_${property.propertyId}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const property = agreementData.propertyData;

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
//           <h1 className="text-2xl font-bold text-white">Property Purchase Agreement</h1>
//           <p className="text-blue-100 mt-1">Secure blockchain-based agreement between seller and buyer</p>
//         </div>

//         {walletError && (
//           <div className="m-8 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded flex items-center">
//             <FiAlertCircle className="mr-2" />
//             <span>{walletError}</span>
//           </div>
//         )}

//         {error && (
//           <div className="m-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//             {error}
//           </div>
//         )}

//         {agreementGenerated && (
//           <div className="m-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
//             <FiCheck className="mr-2" />
//             <span>Agreement successfully generated and secured on blockchain!</span>
//           </div>
//         )}

//         {!property ? (
//           <div className="p-8 text-center">
//             <p className="text-red-600">Property data not found. Please select a valid property.</p>
//             <button 
//               onClick={() => router.push('/properties')}
//               className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Browse Properties
//             </button>
//           </div>
//         ) : (
//           <div className="p-8">
//             {/* Property Details Section */}
//             <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
//               <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                   <FiHome className="mr-2" /> Property Details
//                 </h2>
//               </div>
//               <div className="p-6">
//                 <div className="flex flex-col md:flex-row gap-6">
//                   <div className="md:w-1/3">
//                     <div className="aspect-w-16 aspect-h-9 w-full h-48 relative rounded-lg overflow-hidden">
//                       <Image 
//                         src={property.image} 
//                         alt={property.title}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                   </div>
//                   <div className="md:w-2/3">
//                     <h3 className="text-xl font-bold text-gray-800">{property.title}</h3>
//                     <p className="text-gray-600 flex items-center mt-2">
//                       <FiMapPin className="mr-1" /> 
//                       {property.address}, {property.city}, {property.state} {property.zipCode}
//                     </p>
//                     <p className="text-2xl font-bold text-blue-600 mt-3 flex items-center">
//                       <FiDollarSign className="mr-1" /> 
//                       {property.price.toLocaleString()}
//                     </p>
//                     <p className="text-gray-600 mt-2">{property.description.substring(0, 150)}...</p>
//                     <p className="text-sm text-gray-500 mt-2">
//                       Property ID: {property.propertyId}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Agreement Form */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Seller Information */}
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <FiUser className="mr-2" /> Seller Information
//                   </h2>
//                   {sellerSigned && (
//                     <span className="text-green-600 flex items-center">
//                       <FiCheck className="mr-1" /> Signed
//                     </span>
//                   )}
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div>
//                     <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       id="sellerName"
//                       name="sellerName"
//                       value={agreementData.sellerName}
//                       onChange={handleInputChange}
//                       disabled={sellerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${sellerSigned ? 'bg-gray-100' : ''}`}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700">
//                       Email Address <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       id="sellerEmail"
//                       name="sellerEmail"
//                       value={agreementData.sellerEmail}
//                       onChange={handleInputChange}
//                       disabled={sellerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${sellerSigned ? 'bg-gray-100' : ''}`}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">
//                       Current Address
//                     </label>
//                     <input
//                       type="text"
//                       id="sellerAddress"
//                       name="sellerAddress"
//                       value={agreementData.sellerAddress}
//                       onChange={handleInputChange}
//                       disabled={sellerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${sellerSigned ? 'bg-gray-100' : ''}`}
//                     />
//                   </div>
//                   {!sellerSigned && (
//                     <button
//                       type="button"
//                       onClick={handleSellerSign}
//                       className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                     >
//                       Sign as Seller
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Buyer Information */}
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <FiUser className="mr-2" /> Buyer Information
//                   </h2>
//                   {buyerSigned && (
//                     <span className="text-green-600 flex items-center">
//                       <FiCheck className="mr-1" /> Signed
//                     </span>
//                   )}
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div>
//                     <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       id="buyerName"
//                       name="buyerName"
//                       value={agreementData.buyerName}
//                       onChange={handleInputChange}
//                       disabled={buyerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${buyerSigned ? 'bg-gray-100' : ''}`}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700">
//                       Email Address <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       id="buyerEmail"
//                       name="buyerEmail"
//                       value={agreementData.buyerEmail}
//                       onChange={handleInputChange}
//                       disabled={buyerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${buyerSigned ? 'bg-gray-100' : ''}`}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="buyerAddress" className="block text-sm font-medium text-gray-700">
//                       Current Address
//                     </label>
//                     <input
//                       type="text"
//                       id="buyerAddress"
//                       name="buyerAddress"
//                       value={agreementData.buyerAddress}
//                       onChange={handleInputChange}
//                       disabled={buyerSigned}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${buyerSigned ? 'bg-gray-100' : ''}`}
//                     />
//                   </div>
//                   {!buyerSigned && (
//                     <button
//                       type="button"
//                       onClick={handleBuyerSign}
//                       className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                     >
//                       Sign as Buyer
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Agreement Terms */}
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <FiFileText className="mr-2" /> Agreement Terms
//                   </h2>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div>
//                     <label htmlFor="agreementDate" className="block text-sm font-medium text-gray-700">
//                       Agreement Date
//                     </label>
//                     <input
//                       type="date"
//                       id="agreementDate"
//                       name="agreementDate"
//                       value={agreementData.agreementDate}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700">
//                       Closing Date <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       id="closingDate"
//                       name="closingDate"
//                       value={agreementData.closingDate}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="agreementPrice" className="block text-sm font-medium text-gray-700">
//                       Purchase Price ($) <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       id="agreementPrice"
//                       name="agreementPrice"
//                       value={agreementData.agreementPrice}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700">
//                       Down Payment ($) <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       id="downPayment"
//                       name="downPayment"
//                       value={agreementData.downPayment}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Information */}
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <FiFileText className="mr-2" /> Additional Information
//                   </h2>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div>
//                     <label htmlFor="financingDetails" className="block text-sm font-medium text-gray-700">
//                       Financing Details
//                     </label>
//                     <textarea
//                       id="financingDetails"
//                       name="financingDetails"
//                       rows={3}
//                       value={agreementData.financingDetails}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                       placeholder="Specify financing terms, loan type, interest rate, etc."
//                     ></textarea>
//                   </div>
//                   <div>
//                     <label htmlFor="specialConditions" className="block text-sm font-medium text-gray-700">
//                       Special Conditions
//                     </label>
//                     <textarea
//                       id="specialConditions"
//                       name="specialConditions"
//                       rows={3}
//                       value={agreementData.specialConditions}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                       disabled={agreementGenerated}
//                       placeholder="Inspection requirements, contingencies, fixtures included, etc."
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Blockchain Transaction Info */}
//             {agreementGenerated && (
//               <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
//                   <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <FiHash className="mr-2" /> Blockchain Transaction Details
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Transaction ID</p>
//                       <p className="mt-1 text-sm text-gray-900 break-all">{agreementData.transactionId}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Agreement ID</p>
//                       <p className="mt-1 text-sm text-gray-900">{agreementData.agreementId || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Network</p>
//                       <p className="mt-1 text-sm text-gray-900">{agreementData.network || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Block Number</p>
//                       <p className="mt-1 text-sm text-gray-900">{agreementData.blockNumber || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Timestamp</p>
//                       <p className="mt-1 text-sm text-gray-900">{agreementData.blockTimestamp || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="mt-6 flex flex-col sm:flex-row gap-3">
//                     <button
//                       type="button"
//                       onClick={handleVerifyAgreement}
//                       className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//                       disabled={generatingAgreement}
//                     >
//                       <FiCheck className="mr-2" />
//                       Verify on Blockchain
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleDownloadAgreement}
//                       className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                     >
//                       <FiDownload className="mr-2" />
//                       Download Agreement
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
//               <button
//                 type="button"
//                 onClick={() => router.push('/properties')}
//                 className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Back to Properties
//               </button>

//               {!agreementGenerated && (
//                 <button
//                   type="button"
//                   onClick={handleGenerateAgreement}
//                   disabled={!sellerSigned || !buyerSigned || generatingAgreement}
//                   className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white ${(!sellerSigned || !buyerSigned) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
//                 >
//                   {generatingAgreement ? (
//                     <>
//                       <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <FiHash className="mr-2" />
//                       Generate Blockchain Agreement
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }