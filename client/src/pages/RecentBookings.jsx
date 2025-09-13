import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendar, FaClock, FaUsers, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock as FaClockPending, FaTimes } from 'react-icons/fa';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const DocumentViewer = ({ documentUrl, documentType, onClose }) => {
  console.log('Viewing document in RecentBookings:', { documentUrl, documentType });
  
  // Determine file type from URL
  const fileExtension = documentUrl.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  
  // For non-image files, directly open in default application
  if (!isImage) {
    window.open(documentUrl, '_blank');
    onClose(); // Close the modal after opening the document
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{documentType} Viewer</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
          <img 
            src={documentUrl} 
            alt={documentType} 
            className="max-w-full max-h-[80vh] object-contain"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="text-center p-4">
                  <p class="text-red-500 mb-2">Error loading image</p>
                  <a href="${documentUrl}" target="_blank" class="text-indigo-600 hover:underline">Open in new tab</a>
                </div>
              `;
            }}
          />
        </div>
      </div>
    </div>
  );
};

const RecentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('Document');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to be logged in to view your bookings');
      setLoading(false);
      return;
    }
    
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching user bookings with token:', token.substring(0, 10) + '...');
      
      const response = await axios.get('/api/users/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Bookings response:', response.data);
      setBookings(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response data'
      });
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Booked':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'Pending':
        return <FaClockPending className="h-5 w-5 text-yellow-500" />;
      case 'Rejected':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      case 'Approved':
        return <FaCheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleViewDocument = (documentUrl, documentType) => {
    console.log('Viewing document in RecentBookings:', { documentUrl, documentType });
    
    // Ensure the URL is properly formatted
    const formattedUrl = documentUrl.startsWith('http') 
      ? documentUrl 
      : `http://localhost:3000${documentUrl.startsWith('/') ? '' : '/'}${documentUrl}`;
    
    console.log('Formatted URL:', formattedUrl);
    
    setSelectedDocument(formattedUrl);
    setSelectedDocumentType(documentType || 'Document');
    setShowDocumentViewer(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-red-50 rounded-md">
        <p className="font-bold">Error loading bookings</p>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please check your authentication and try again.</p>
        <button 
          onClick={fetchUserBookings} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showDocumentViewer && (
        <DocumentViewer
          documentUrl={selectedDocument}
          documentType={selectedDocumentType}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
            setSelectedDocumentType('Document');
          }}
        />
      )}

      <h1 className="text-3xl font-bold mb-6">Recent Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You haven't made any bookings yet.</p>
          <a
            href="/booking"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Book Now
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {booking.eventType}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Booking ID: {booking._id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className="text-sm font-medium">{booking.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaCalendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUsers className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-medium">{booking.guestCount}</p>
                  </div>
                </div>

                {booking.eventDocument && (
                  <div className="flex items-center space-x-3">
                    <FaFileAlt className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Document</p>
                      <button
                        onClick={() => handleViewDocument(booking.eventDocument, booking.documentType)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        View Document
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {booking.additionalNotes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Additional Notes:</p>
                  <p className="mt-1 text-gray-700">{booking.additionalNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentBookings;