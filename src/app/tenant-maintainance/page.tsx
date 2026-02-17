'use client';
import { useState, useEffect } from 'react';
import { addDoc, collection, where, limit, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';


interface MaintenanceRequest {
    id: string;
    houseId: string;
    categories: string[];
    issue: string;
    urgency: string;
    status: string;
    createdAt: any;
    preferredDate?: string | null;
    preferredTime?: string | null;
}

const MaintenanceRequestForm = () => {
    const [houseId, setHouseId] = useState('');
    const [tenantName, setTenantName] = useState('');
    const [owner_email, setOwnerEmail] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [otherCategory, setOtherCategory] = useState('');
    const [issue, setIssue] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [entryPermission, setEntryPermission] = useState('yes');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [existingRequests, setExistingRequests] = useState<MaintenanceRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const maintenanceCategories = [
        { value: 'plumbing', label: 'Plumbing' },
        { value: 'electrical', label: 'Electrical' },
        { value: 'hvac', label: 'HVAC / Climate Control' },
        { value: 'appliance', label: 'Appliance Repair' },
        { value: 'structural', label: 'Structural Issues' },
        { value: 'pest', label: 'Pest Control' },
        { value: 'landscaping', label: 'Landscaping / Exterior' },
        { value: 'security', label: 'Security / Locks' },
        { value: 'other', label: 'Other' }
    ];

    // Function to fetch existing maintenance requests
    const fetchExistingRequests = async (houseIdValue: string) => {
        console.log('Fetching existing requests for house ID:', houseIdValue);
        try {
            setLoadingRequests(true);
            const requestsQuery = query(
                collection(db, 'maintenanceRequests'),
                where('houseId', '==', houseIdValue)
            );
            console.log('Requests query:', requestsQuery);  
            
            const requestsSnapshot = await getDocs(requestsQuery);
            console.log('Requests snapshot:', requestsSnapshot);
            const requests: MaintenanceRequest[] = [];
            requestsSnapshot.forEach(doc => {
                const data = doc.data();
                requests.push({
                    id: doc.id,
                    houseId: data.houseId,
                    categories: data.categories,
                    issue: data.issue,
                    urgency: data.urgency,
                    status: data.status,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    preferredDate: data.preferredDate,
                    preferredTime: data.preferredTime
                });
            });
            
            setExistingRequests(requests);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        const checkHouseId = async () => {
            try {
                setIsLoading(true);
                
                // Get houseId from URL parameters
                const params = new URLSearchParams(window.location.search);
                const urlHouseId = params.get('houseId');
                
                if (!urlHouseId) {
                    setIsLoading(false);
                    return;
                }

                console.log('House ID:', urlHouseId);
                
                // Query Firestore to check if houseId exists
                const houseQuery = query(
                    collection(db, 'properties'),
                    where('id', '==', urlHouseId),
                    limit(1)
                );
                
                const houseSnapshot = await getDocs(houseQuery);
                
                if (houseSnapshot.empty) {
                    // House ID doesn't exist, redirect to lease property maintenance
                    alert('Property ID does not exist in our system.');
                    window.location.href = '/lease-property-maintenance';
                    return;
                }
                
                // House ID exists, set it in the form
                setHouseId(urlHouseId);
                
                // Fetch existing maintenance requests for this house
                await fetchExistingRequests(urlHouseId);
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error checking house ID:', error);
                setIsLoading(false);
                alert('An error occurred while checking the property ID. Please try again.');
            }
        };
        
        checkHouseId();
    }, []);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const sendOrderEmail = async (issueDetails: any) => {
        try {
            const response = await fetch('/api/send-mtnc-to-owner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(issueDetails),
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate form
        if (!houseId || !issue || (selectedCategories.length === 0)) {
            setError('Please complete all required fields');
            return;
        }

        // If "Other" is selected but no description provided
        if (selectedCategories.includes('other') && !otherCategory) {
            setError('Please specify the "Other" category');
            return;
        }

        setIsSubmitting(true);

        try {
            // Check if the houseId exists in Firestore
            const houseQuery = query(
                collection(db, 'properties'),
                where('id', '==', houseId),
                limit(1)
            );
            const houseSnapshot = await getDocs(houseQuery);

            // Check if documents were returned
            if (houseSnapshot.empty) {
                setError('Property ID does not exist or is not available.');
                setIsSubmitting(false);
                return;
            }

            const houseDoc = houseSnapshot.docs[0];

            // Safely check if the document exists
            if (!houseDoc.exists()) {
                setError('Property ID does not exist or is not available.');
                setIsSubmitting(false);
                return;
            }
            // Prepare categories list including "other" description if applicable
            const categories = selectedCategories.includes('other')
                ? [...selectedCategories.filter(c => c !== 'other'), `other: ${otherCategory}`]
                : selectedCategories;

            // Submit the maintenance request
            await addDoc(collection(db, 'maintenanceRequests'), {
                houseId,
                categories,
                issue,
                urgency,
                preferredDate: preferredDate || null,
                preferredTime: preferredTime || null,
                entryPermission,
                status: 'Pending',
                createdAt: new Date(),
            });

            // Send email to property owner
            await sendOrderEmail({
                houseId,
                tenantName, // Tenant's name
                issueCategory: categories.join(', '),
                issue,
                urgency,
                preferredDate,
                preferredTime,
                entryPermission,
                owner_email    // Owner's email 
            });

            // Refresh the list of maintenance requests
            await fetchExistingRequests(houseId);

            // Reset form
            setIssue('');
            setSelectedCategories([]);
            setOtherCategory('');
            setUrgency('medium');
            setPreferredDate('');
            setPreferredTime('');
            setEntryPermission('yes');
            setSuccess('Maintenance request submitted successfully! Our team will contact you shortly.');
            
            // Hide the form after successful submission
            setShowForm(false);
        } catch (error) {
            setError('Error submitting maintenance request. Please try again.');
            console.error(error);
        }

        setIsSubmitting(false);
    };

    // Function to format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color class
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get urgency color class
    const getUrgencyColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white bg-opacity-95 rounded-lg shadow-2xl flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying property information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white bg-opacity-95 rounded-lg shadow-2xl"
            style={{ borderTop: "4px solid #2c4a63" }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">MAINTENANCE REQUESTS</h2>
            <p className="text-gray-600 text-center mb-8">Excellence in property care and management</p>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded">
                    {success}
                </div>
            )}

            {/* Toggle Button */}
            <div className="mb-8 flex justify-center">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded shadow-lg transition duration-300"
                    style={{ backgroundColor: "#2c4a63" }}
                >
                    {showForm ? 'View Existing Requests' : 'Submit New Request'}
                </button>
            </div>

            {/* Display existing requests if not showing form */}
            {!showForm && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Maintenance Requests</h3>
                    
                    {loadingRequests ? (
                        <div className="text-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading requests...</p>
                        </div>
                    ) : existingRequests.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No maintenance requests found for this property.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {existingRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {request.categories.join(', ')}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Submitted on {formatDate(request.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                                                {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-2 mb-3">{request.issue}</p>
                                    {(request.preferredDate || request.preferredTime) && (
                                        <p className="text-sm text-gray-600">
                                            Preferred time: {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Any date'} 
                                            {request.preferredTime ? ` - ${request.preferredTime}` : ''}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Maintenance Request Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="houseId" className="block text-gray-700 font-medium mb-2">Property ID*</label>
                                <input
                                    id="houseId"
                                    type="text"
                                    value={houseId}
                                    onChange={(e) => setHouseId(e.target.value)}
                                    placeholder="Enter your Property ID"
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                    readOnly={houseId !== ''}
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name*</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                    placeholder="Enter your Name"
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Issue Categories* (Select all that apply)</label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {maintenanceCategories.map((category) => (
                                        <div
                                            key={category.value}
                                            onClick={() => toggleCategory(category.value)}
                                            className={`p-3 text-center rounded border cursor-pointer transition-all ${selectedCategories.includes(category.value)
                                                ? 'bg-blue-700 text-white border-blue-800'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {category.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Other category input */}
                                {selectedCategories.includes('other') && (
                                    <input
                                        type="text"
                                        value={otherCategory}
                                        onChange={(e) => setOtherCategory(e.target.value)}
                                        placeholder="Please specify other issue type"
                                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mt-2"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Urgency Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setUrgency('low')}
                                        className={`p-3 text-center rounded border ${urgency === 'low'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Low
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUrgency('medium')}
                                        className={`p-3 text-center rounded border ${urgency === 'medium'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Medium
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUrgency('high')}
                                        className={`p-3 text-center rounded border ${urgency === 'high'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        High
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Preferred Service Date/Time (Optional)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={preferredDate}
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                    <select
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        <option value="">Select time</option>
                                        <option value="morning">Morning (8AM-12PM)</option>
                                        <option value="afternoon">Afternoon (12PM-5PM)</option>
                                        <option value="evening">Evening (5PM-8PM)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Permission to Enter Property</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEntryPermission('yes')}
                                        className={`p-3 text-center rounded border ${entryPermission === 'yes'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Yes, enter if I'm not home
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEntryPermission('no')}
                                        className={`p-3 text-center rounded border ${entryPermission === 'no'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        No, I must be present
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="ownerid" className="block text-gray-700 font-medium mb-2">Owner Email*</label>
                                <input
                                    id="ownerid"
                                    type="email"
                                    value={owner_email}
                                    onChange={(e) => setOwnerEmail(e.target.value)}
                                    placeholder="Enter Owner's Email"
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            
                        </div>
                    </div>

                    {/* Full width description */}
                    <div>
                        <label htmlFor="issue" className="block text-gray-700 font-medium mb-2">Describe the Issue in Detail*</label>
                        <textarea
                            id="issue"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            placeholder="Please provide as much detail as possible about the issue..."
                            className="w-full p-3 border border-gray-300 rounded h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded shadow-lg disabled:bg-gray-400 transition duration-300"
                        style={{ backgroundColor: "#2c4a63" }}
                    >
                        {isSubmitting ? 'Processing...' : 'SUBMIT REQUEST'}
                    </button>
                </form>
            )}

            <div className="mt-6 text-center text-gray-600">
                <p>For urgent after-hours emergencies, please call +91-9368152845</p>
            </div>
        </div>
    );
};

export default MaintenanceRequestForm;