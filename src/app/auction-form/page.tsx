'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/firebase';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import { FiUpload, FiDollarSign, FiHome, FiMapPin, FiBox, FiDroplet, FiMaximize, FiFileText, FiCheck } from 'react-icons/fi';

interface FormData {
  propertyId: string;
  title: string;
  status: string;
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  beds: string;
  baths: string;
  sqft: string;
  description: string;
}

const initialFormData: FormData = {
  propertyId: '',
  title: '',
  status: 'PENDING',
  price: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  beds: '',
  baths: '',
  sqft: '',
  description: '',
};

export default function AddProperty() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const statusOptions = ['PENDING', 'FOR SALE', 'SOLD', 'FOR RENT'];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.type.includes('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateForm = (): boolean => {
    if (!image) {
      setError('Please upload a property image');
      return false;
    }
    
    if (!formData.title.trim()) {
      setError('Property title is required');
      return false;
    }
    
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      setError('Please enter a valid price');
      return false;
    }
    
    if (!formData.propertyId.trim()) {
      setError('Property ID is required');
      return false;
    }
    
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      setError('Complete address is required');
      return false;
    }
    
    if (!formData.beds.trim() || isNaN(Number(formData.beds))) {
      setError('Please enter a valid number of bedrooms');
      return false;
    }
    
    if (!formData.baths.trim() || isNaN(Number(formData.baths))) {
      setError('Please enter a valid number of bathrooms');
      return false;
    }
    
    if (!formData.sqft.trim() || isNaN(Number(formData.sqft))) {
      setError('Please enter a valid square footage');
      return false;
    }
    
    if (!formData.description.trim() || formData.description.length < 50) {
      setError('Please provide a detailed description (at least 50 characters)');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${image!.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const storageRef = ref(storage, `properties/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, image!);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          
          if (error.code === 'storage/unauthorized') {
            setError('CORS error: Not authorized to access Firebase Storage. Please check your Firebase Storage rules and CORS configuration.');
          } else if (error.code === 'storage/canceled') {
            setError('Upload was canceled');
          } else {
            setError(`Failed to upload image: ${error.message}`);
          }
          
          setLoading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            await addDoc(collection(db, 'properties'), {
              propertyId: formData.propertyId,
              title: formData.title,
              status: formData.status,
              price: Number(formData.price),
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              beds: Number(formData.beds),
              baths: Number(formData.baths),
              sqft: Number(formData.sqft),
              description: formData.description,
              image: downloadURL,
              createdAt: new Date().toISOString(),
            });
            
            setLoading(false);
            setSuccess(true);
            setFormData(initialFormData);
            setImage(null);
            setImagePreview(null);
            setUploadProgress(0);
            
            setTimeout(() => {
              router.push('/properties');
            }, 2000);
          } catch (docError) {
            console.error('Error adding document:', docError);
            setError('Successfully uploaded image but failed to save property data. Please try again.');
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error initializing upload:', error);
      setError('Failed to start upload process. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
          <h1 className="text-2xl font-bold text-white">Add New Property</h1>
          <p className="text-blue-100 mt-1">Fill in the details to list your property</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <FiCheck className="mr-2" />
              <span>Property added successfully! Redirecting to properties page...</span>
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-8">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Property Image <span className="text-red-500">*</span>
            </label>
            <div 
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition duration-200 ${
                imagePreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 w-full h-64 relative">
                    <Image 
                      src={imagePreview} 
                      alt="Property preview" 
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <p className="mt-2 text-sm text-green-600">Image uploaded! Click to change</p>
                </div>
              ) : (
                <div className="py-8">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload a property image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHome className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                    placeholder="e.g., Beautiful Family Home"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-gray-700 text-sm font-semibold mb-2">
                  Listing Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-gray-700 text-sm font-semibold mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                  placeholder="e.g., 900000"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="propertyId" className="block text-gray-700 text-sm font-semibold mb-2">
                Property ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="propertyId"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleInputChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                placeholder="e.g., H10"
                required
              />  
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Location Details</h3>
              
              <div>
                <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                    placeholder="e.g., 418 197th Place SW"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-2">
                  <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                    placeholder="e.g., Lynnwood"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-gray-700 text-sm font-semibold mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                    placeholder="e.g., WA"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-gray-700 text-sm font-semibold mb-2">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                    placeholder="e.g., 98036"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="beds" className="block text-gray-700 text-sm font-semibold mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBox className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="beds"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      min="0"
                      className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                      placeholder="e.g., 4"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="baths" className="block text-gray-700 text-sm font-semibold mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDroplet className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="baths"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                      placeholder="e.g., 2.5"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="sqft" className="block text-gray-700 text-sm font-semibold mb-2">
                    Square Feet <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMaximize className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="sqft"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleInputChange}
                      min="0"
                      className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300 py-3"
                      placeholder="e.g., 2017"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                Property Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <FiFileText className="text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md border-gray-300"
                  placeholder="Describe your property in detail..."
                  required
                ></textarea>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Minimum 50 characters. {formData.description.length}/1000
              </p>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg font-medium ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading {uploadProgress}%
                  </div>
                ) : (
                  'Submit Property'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}