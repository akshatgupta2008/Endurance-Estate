'use client';
import { useState, useEffect, SetStateAction } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const OwnerMaintenancePage = () => {
    const [houseId, setHouseId] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [maintenanceRequests, setMaintenanceRequests] = useState<{ 
        id: string; 
        houseId: any; 
        categories: any; 
        issue: any; 
        urgency: any; 
        status: any; 
        createdAt: Date; 
        preferredDate: any; 
        preferredTime: any; 
        entryPermission: any; 
    }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    useEffect(() => {
        const verifyHouseAndFetchRequests = async () => {
            try {
                setIsLoading(true);

                // Extract houseId from URL
                const params = new URLSearchParams(window.location.search);
                const urlHouseId = params.get('houseId');

                if (!urlHouseId) {
                    setError('No property ID provided');
                    setIsLoading(false);
                    return;
                }

                // Verify that the house exists
                const houseQuery = query(
                    collection(db, 'properties'),
                    where('id', '==', urlHouseId),
                    limit(1)
                );

                const houseSnapshot = await getDocs(houseQuery);

                if (houseSnapshot.empty) {
                    alert('Property ID does not exist in our system.');
                    window.location.href = '/lease-property-maintenance';
                    return;
                }

                // Set house information
                const houseData = houseSnapshot.docs[0].data();
                setPropertyName(houseData.title || 'Your Property');
                setHouseId(urlHouseId);

                // Fetch maintenance requests for this house
                await fetchMaintenanceRequests(urlHouseId);

            } catch (error) {
                console.error('Error verifying house ID:', error);
                setError('Failed to load property information');
            } finally {
                setIsLoading(false);
            }
        };

        verifyHouseAndFetchRequests();
    }, []);

    const fetchMaintenanceRequests = async (houseIdValue: string) => {
        try {
            const requestsQuery = query(
                collection(db, 'maintenanceRequests'),
                where('houseId', '==', houseIdValue)
            );

            const requestsSnapshot = await getDocs(requestsQuery);
            const requests: ((prevState: never[]) => never[]) | { id: string; houseId: any; categories: any; issue: any; urgency: any; status: any; createdAt: any; preferredDate: any; preferredTime: any; entryPermission: any; }[] = [];

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
                    preferredTime: data.preferredTime,
                    entryPermission: data.entryPermission
                });
            });

            // Sort by date (newest first)
            requests.sort((a, b) => b.createdAt - a.createdAt);
            setMaintenanceRequests(requests);

        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            setError('Failed to load maintenance requests');
        }
    };

    const markAsCompleted = async (requestId: string) => {
        try {
            setUpdating(true);
            setSelectedRequestId(requestId);

            // Update the status in Firestore
            const requestRef = doc(db, 'maintenanceRequests', requestId);
            await updateDoc(requestRef, {
                status: 'Completed',
                completedAt: new Date()
            });

            // Refresh the list of maintenance requests
            await fetchMaintenanceRequests(houseId);

            setSuccessMessage('Maintenance request marked as completed');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (error) {
            console.error('Error updating maintenance request:', error);
            setError('Failed to update request status');

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        } finally {
            setUpdating(false);
            setSelectedRequestId(null);
        }
    };

    // Format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color class
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
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
        switch (urgency?.toLowerCase()) {
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
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading property information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Maintenance Requests for {propertyName}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        View and manage maintenance requests for your property
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-md">
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Maintenance Requests List */}
                {maintenanceRequests.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-600">No maintenance requests found for this property.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {maintenanceRequests.map((request) => (
                            <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-wrap items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {request.categories.join(', ')}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Submitted on {formatDate(request.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2 mt-2 sm:mt-0">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                                                {request.urgency} priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Description:</h4>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                                            {request.issue}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {request.preferredDate && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Preferred Date:</h4>
                                                <p className="text-gray-600">{request.preferredDate}</p>
                                            </div>
                                        )}

                                        {request.preferredTime && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Preferred Time:</h4>
                                                <p className="text-gray-600">{request.preferredTime}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700">Entry Permission:</h4>
                                            <p className="text-gray-600">{request.entryPermission === 'yes' ? 'Granted' : 'Not granted'}</p>
                                        </div>
                                    </div>

                                    {request.status !== 'Completed' && (
                                        <div className="mt-6">
                                            <button
                                                onClick={() => markAsCompleted(request.id)}
                                                disabled={updating && selectedRequestId === request.id}
                                                className={`w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${updating && selectedRequestId === request.id ? 'opacity-75 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {updating && selectedRequestId === request.id ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </span>
                                                ) : (
                                                    'Mark as Completed'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerMaintenancePage;