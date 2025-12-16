import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { FaCalendar, FaClock, FaUsers, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock as FaClockPending, FaTimes } from 'react-icons/fa';
import { Card, Button } from '../components';

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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{documentType} Viewer</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
          <img 
            src={documentUrl} 
            alt={documentType} 
            className="max-w-full max-h-[70vh] object-contain"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="text-center p-4">
                  <p class="text-red-400 mb-2">Error loading image</p>
                  <a href="${documentUrl}" target="_blank" class="text-electric-400 hover:text-electric-300 underline">Open in new tab</a>
                </div>
              `;
            }}
          />
        </div>
      </Card>
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
      
      const response = await axios.get('/api/users/bookings');

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
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'Approved':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Booked':
        return <FaCheckCircle className="h-5 w-5 text-green-400" />;
      case 'Pending':
        return <FaClockPending className="h-5 w-5 text-yellow-400" />;
      case 'Rejected':
        return <FaTimesCircle className="h-5 w-5 text-red-400" />;
      case 'Approved':
        return <FaCheckCircle className="h-5 w-5 text-blue-400" />;
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
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto p-6 glass-effect border border-white/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <FaTimesCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Error loading bookings</h3>
              <p className="text-neutral-300 mb-4">{error}</p>
              <p className="text-sm text-neutral-400 mb-6">Please check your authentication and try again.</p>
              <Button 
                onClick={fetchUserBookings} 
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh py-12">
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

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recent Bookings</h1>
          <p className="text-neutral-300">View and manage your event bookings</p>
        </div>
        
        {bookings.length === 0 ? (
          <Card className="text-center p-12 glass-effect border border-white/10">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendar className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Bookings Yet</h3>
              <p className="text-neutral-300 mb-6">You haven't made any bookings yet.</p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/booking'}
              >
                Book an Event
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card 
                key={booking._id} 
                className="p-6 glass-effect border border-white/10 hover:shadow-xl transition-all duration-300"
                hoverEffect={true}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{booking.eventType}</h3>
                    <p className="text-neutral-300">Booking ID: {booking._id}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-2">{booking.status}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-neutral-300">
                    <FaCalendar className="mr-3 text-electric-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Date</p>
                      <p className="font-medium text-white">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-neutral-300">
                    <FaUsers className="mr-3 text-electric-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Guests</p>
                      <p className="font-medium text-white">{booking.guestCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-neutral-300">
                    <FaClock className="mr-3 text-electric-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Submitted</p>
                      <p className="font-medium text-white">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {booking.eventDocuments && booking.eventDocuments.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="font-medium text-white mb-3">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.eventDocuments.map((doc, index) => (
                        <button
                          key={index}
                          onClick={() => handleViewDocument(doc.url, doc.type)}
                          className="inline-flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/10"
                        >
                          <FaFileAlt className="mr-2" />
                          <span className="text-sm">{doc.type || `Document ${index + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentBookings;