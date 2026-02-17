//adhar-verify-page.tsx

'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiPhone, FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

interface VerificationFormData {
  fullName: string;
  phoneNumber: string;
  aadhaarNumber: string;
}

// OTP verification states
interface OTPState {
  phoneOTP: string;
  aadhaarOTP: string;
  phoneVerified: boolean;
  aadhaarVerified: boolean;
  showPhoneOTPInput: boolean;
  showAadhaarOTPInput: boolean;
}

export default function AadhaarVerification() {
  const [formData, setFormData] = useState<VerificationFormData>({
    fullName: '',
    phoneNumber: '',
    aadhaarNumber: '',
  });

  const [otpState, setOtpState] = useState<OTPState>({
    phoneOTP: '',
    aadhaarOTP: '',
    phoneVerified: false,
    aadhaarVerified: false,
    showPhoneOTPInput: false,
    showAadhaarOTPInput: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format Aadhaar number with spaces (XXXX XXXX XXXX)
    if (name === 'aadhaarNumber') {
      const formatted = value
        .replace(/\D/g, '') // Remove non-digits
        .substring(0, 12) // Max 12 digits
        .replace(/(\d{4})(?=\d)/g, '$1 '); // Add space after every 4 digits
      
      setFormData({ ...formData, [name]: formatted });
    } 
    // Format phone number (e.g., 9999 999 999)
    else if (name === 'phoneNumber') {
      const formatted = value
        .replace(/\D/g, '') // Remove non-digits
        .substring(0, 10); // Max 10 digits
      
      setFormData({ ...formData, [name]: formatted });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOTPChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow digits and limit to 6 characters
    const otp = value.replace(/\D/g, '').substring(0, 6);
    setOtpState({ ...otpState, [name]: otp });
  };

  const validateAadhaarNumber = (aadhaarNum: string): boolean => {
    // Remove spaces and check if it's 12 digits
    const cleanedNum = aadhaarNum.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanedNum);
  };

  const validatePhoneNumber = (phoneNum: string): boolean => {
    // Indian phone numbers are typically 10 digits
    return /^\d{10}$/.test(phoneNum);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 3;
  };

  // Simulate sending OTP to phone
  const sendPhoneOTP = async () => {
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real application, you would call an API to send OTP
      // Here we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtpState({
        ...otpState,
        showPhoneOTPInput: true
      });
      
      // For demo purposes, we'll use a fixed OTP
      // In production, this would come from your backend
      console.log('Phone OTP sent: 123456');
      
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate sending OTP to Aadhaar registered number
  const sendAadhaarOTP = async () => {
    if (!validateAadhaarNumber(formData.aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real application, you would call an API to verify Aadhaar
      // and send OTP to the registered phone number
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpState({
        ...otpState,
        showAadhaarOTPInput: true
      });
      
      // For demo purposes, we'll use a fixed OTP
      // In production, this would come from your backend
      console.log('Aadhaar OTP sent: 654321');
      
    } catch (err) {
      setError('Failed to send Aadhaar verification OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify phone OTP
  const verifyPhoneOTP = async () => {
    if (otpState.phoneOTP.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real application, you would call an API to verify the OTP
      // Here we'll simulate it with a timeout and accept any 6-digit code for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll accept "123456" as the valid OTP
      if (otpState.phoneOTP === '123456') {
        setOtpState({
          ...otpState,
          phoneVerified: true
        });
      } else {
        setError('Invalid OTP. Please try again.');
      }
      
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Aadhaar OTP
  const verifyAadhaarOTP = async () => {
    if (otpState.aadhaarOTP.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real application, you would call an API to verify the OTP
      // Here we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll accept "654321" as the valid OTP
      if (otpState.aadhaarOTP === '654321') {
        setOtpState({
          ...otpState,
          aadhaarVerified: true
        });
      } else {
        setError('Invalid Aadhaar OTP. Please try again.');
      }
      
    } catch (err) {
      setError('Failed to verify Aadhaar OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if the user already exists and create if they don't
  const createOrGetUser = async () => {
    try {
      // Check if user with this Aadhaar already exists
      const q = query(
        collection(db, 'users'), 
        where('aadhaarNumber', '==', formData.aadhaarNumber.replace(/\s/g, ''))
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User exists, return their ID
        const userDoc = querySnapshot.docs[0];
        return userDoc.id;
      } else {
        // Create new user
        const userRef = await addDoc(collection(db, 'properties_users'), {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          aadhaarNumber: formData.aadhaarNumber.replace(/\s/g, ''),
          phoneVerified: true,
          aadhaarVerified: true,
          createdAt: new Date().toISOString(),
        });
        
        return userRef.id;
      }
    } catch (error) {
      console.error("Error creating/getting user:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateName(formData.fullName)) {
      setError('Please enter a valid full name (at least 3 characters)');
      return;
    }
    
    if (!otpState.phoneVerified) {
      setError('Please verify your phone number');
      return;
    }
    
    if (!otpState.aadhaarVerified) {
      setError('Please verify your Aadhaar number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create or get user ID
      const userIdValue = await createOrGetUser();
      setUserId(userIdValue);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to property listing page after a short delay
      setTimeout(() => {
        // Store user ID in localStorage or sessionStorage for use in the next page
        sessionStorage.setItem('currentUserId', userIdValue);
        router.push('/auction-form');
      }, 2000);
      
    } catch (error) {
      console.error("Error during form submission:", error);
      setError('Failed to complete verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
          <h1 className="text-2xl font-bold text-white">Verify Your Identity</h1>
          <p className="text-blue-100 mt-1">Complete verification before listing your property</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Success message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <FiCheck className="mr-2" />
              <span>Verification successful! Redirecting to property listing page...</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                  placeholder="Enter your full name as per Aadhaar"
                  required
                />
              </div>
            </div>
            
            {/* Phone Number with OTP verification */}
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
                {otpState.phoneVerified && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiCheck className="mr-1" />
                    Verified
                  </span>
                )}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 py-3"
                    placeholder="10-digit mobile number"
                    required
                    disabled={otpState.phoneVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendPhoneOTP}
                  disabled={otpState.phoneVerified || loading || !validatePhoneNumber(formData.phoneNumber)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                    otpState.phoneVerified || loading || !validatePhoneNumber(formData.phoneNumber)
                      ? 'bg-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading && !otpState.showPhoneOTPInput ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>
            
            {/* Phone OTP Input */}
            {otpState.showPhoneOTPInput && !otpState.phoneVerified && (
              <div>
                <label htmlFor="phoneOTP" className="block text-gray-700 text-sm font-semibold mb-2">
                  Enter OTP sent to your phone
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phoneOTP"
                      name="phoneOTP"
                      value={otpState.phoneOTP}
                      onChange={handleOTPChange}
                      className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 py-3"
                      placeholder="6-digit OTP"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyPhoneOTP}
                    disabled={loading || otpState.phoneOTP.length !== 6}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                      loading || otpState.phoneOTP.length !== 6
                        ? 'bg-gray-300'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  For demo: use "123456" as the OTP
                </p>
              </div>
            )}
            
            {/* Aadhaar Number with OTP verification */}
            <div>
              <label htmlFor="aadhaarNumber" className="block text-gray-700 text-sm font-semibold mb-2">
                Aadhaar Number <span className="text-red-500">*</span>
                {otpState.aadhaarVerified && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FiCheck className="mr-1" />
                    Verified
                  </span>
                )}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCreditCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 py-3"
                    placeholder="XXXX XXXX XXXX"
                    required
                    disabled={otpState.aadhaarVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendAadhaarOTP}
                  disabled={otpState.aadhaarVerified || loading || !validateAadhaarNumber(formData.aadhaarNumber)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                    otpState.aadhaarVerified || loading || !validateAadhaarNumber(formData.aadhaarNumber)
                      ? 'bg-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading && !otpState.showAadhaarOTPInput ? 'Sending...' : 'Verify'}
                </button>
              </div>
            </div>
            
            {/* Aadhaar OTP Input */}
            {otpState.showAadhaarOTPInput && !otpState.aadhaarVerified && (
              <div>
                <label htmlFor="aadhaarOTP" className="block text-gray-700 text-sm font-semibold mb-2">
                  Enter OTP sent to Aadhaar-linked mobile
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="aadhaarOTP"
                      name="aadhaarOTP"
                      value={otpState.aadhaarOTP}
                      onChange={handleOTPChange}
                      className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 py-3"
                      placeholder="6-digit OTP"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyAadhaarOTP}
                    disabled={loading || otpState.aadhaarOTP.length !== 6}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                      loading || otpState.aadhaarOTP.length !== 6
                        ? 'bg-gray-300'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  For demo: use "654321" as the OTP
                </p>
              </div>
            )}
            
            {/* Security note */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Your data is secure with us</h3>
              <p className="mt-1 text-sm text-blue-600">
                We use industry-standard encryption to protect your Aadhaar and personal information. 
                Your details will only be used for identity verification and property listing purposes.
              </p>
            </div>
            
            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !otpState.phoneVerified || !otpState.aadhaarVerified}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg font-medium ${
                  loading || !otpState.phoneVerified || !otpState.aadhaarVerified
                    ? 'bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Continue to Property Listing'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}