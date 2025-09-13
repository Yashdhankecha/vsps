import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon, PencilIcon, DocumentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configure axios defaults
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg p-4 shadow-lg ${bgColor} border ${borderColor}`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
          ) : (
            <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
          )}
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

const RejectionModal = ({ onClose, onSubmit, bookingType }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Enter Rejection Reason for {bookingType || 'Booking'}
        </h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="4"
          placeholder="Please provide a reason for rejection..."
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onSubmit(reason);
                onClose();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentViewer = ({ documentUrl, documentType, onClose }) => {
  // Determine file type from URL
  const fileExtension = documentUrl.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  
  console.log('Viewing document:', { documentUrl, documentType, fileExtension });
  
  // For non-image files, directly open in default application
  if (!isImage) {
    // Open in a new tab instead of using window.open directly
    const link = document.createElement('a');
    link.href = documentUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose(); // Close the modal after opening the document
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">{documentType} Viewer</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = documentUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Open with Default Application
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
    </div>
  );
};

// CollapsibleSection component for interactive panels
function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 border rounded-lg">
      <button
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-t-lg focus:outline-none"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="font-semibold">{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionBookingId, setRejectionBookingId] = useState(null);
  const [rejectionType, setRejectionType] = useState('booking');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('Document');
  const [activeCategory, setActiveCategory] = useState('all');
  const [samuhLaganRequests, setSamuhLaganRequests] = useState([]);
  const [studentAwardRequests, setStudentAwardRequests] = useState([]);
  const [teamRegistrationRequests, setTeamRegistrationRequests] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [deleteBookingType, setDeleteBookingType] = useState(null);
  // Add loading states for each action
  const [loadingActions, setLoadingActions] = useState({
    approve: {},
    reject: {},
    confirm: {},
    delete: {},
    view: {}  // Add view property
  });

  useEffect(() => {
    fetchBookings();
    fetchSamuhLaganRequests();
    fetchStudentAwardRequests();
    fetchTeamRegistrationRequests();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings');
      // Handle the response data directly since we modified the controller
      setBookings(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSamuhLaganRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      const response = await axios.get('/api/bookings/samuh-lagan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSamuhLaganRequests(response.data);
    } catch (error) {
      console.error('Error fetching Samuh Lagan requests:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification('Failed to fetch Samuh Lagan requests', 'error');
      }
    }
  };

  const fetchStudentAwardRequests = async () => {
    try {
      const response = await axios.get('/api/bookings/student-awards');
      setStudentAwardRequests(response.data);
    } catch (error) {
      console.error('Error fetching Student Award requests:', error);
      showNotification('Failed to fetch Student Award requests', 'error');
    }
  };

  const fetchTeamRegistrationRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      const response = await axios.get('/api/admin/forms/team-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Ensure we're setting an array, even if the response is empty
      setTeamRegistrationRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching Team Registration requests:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification('Failed to fetch Team Registration requests', 'error');
      }
      // Set empty array on error to prevent map errors
      setTeamRegistrationRequests([]);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: true } }));
      const response = await axios.put(`/api/bookings/approve/${id}`);

      if (response.data) {
        showNotification('Booking approved successfully');
        await fetchBookings();
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      showNotification(error.response?.data?.message || 'Failed to approve booking', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: false } }));
    }
  };

  const handleReject = async (id) => {
    setRejectionBookingId(id);
    setRejectionType('booking');
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = async (reason) => {
    try {
      setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [rejectionBookingId]: true } }));
      let response;
      
      switch(rejectionType) {
        case 'booking':
          response = await axios.put(`/api/bookings/reject/${rejectionBookingId}`, { 
            bookingId: rejectionBookingId, 
            rejectionReason: reason 
          });
          if (response.data) {
            showNotification('Booking rejected successfully');
            fetchBookings();
          }
          break;
          
        case 'samuhLagan':
          const token = localStorage.getItem('token');
          if (!token) {
            showNotification('Please login again', 'error');
            return;
          }
          
          response = await axios.patch(`/api/bookings/samuh-lagan/${rejectionBookingId}/reject`, { 
            reason: reason
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data) {
            showNotification('Samuh Lagan request rejected successfully');
            fetchSamuhLaganRequests();
          }
          break;
          
        case 'studentAward':
          response = await axios.put(`/api/bookings/student-awards/reject/${rejectionBookingId}`, { 
            rejectionReason: reason 
          });
          
          if (response.data) {
            showNotification('Student Award request rejected successfully');
            fetchStudentAwardRequests();
          }
          break;
          
        case 'teamRegistration':
          response = await axios.put(`/api/team-registrations/reject/${rejectionBookingId}`, { 
            rejectionReason: reason 
          });
          if (response.data) {
            showNotification('Team Registration request rejected successfully');
            fetchTeamRegistrationRequests();
          }
          break;
          
        default:
          throw new Error('Unknown rejection type');
      }
    } catch (error) {
      console.error(`Error rejecting ${rejectionType}:`, error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification(error.response?.data?.error || `Failed to reject ${rejectionType}`, 'error');
      }
    } finally {
      setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [rejectionBookingId]: false } }));
      setShowRejectionModal(false);
      setRejectionBookingId(null);
      setRejectionType('booking');
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      await axios.put(`/api/bookings/confirm-payment/${id}`, {
        bookingId: id
      });
      showNotification('Payment confirmed successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error confirming payment:', error);
      showNotification('Failed to confirm payment', 'error');
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: true } }));
      const response = await axios.put(`/api/bookings/confirm-booking/${id}`);

      if (response.data) {
        showNotification('Booking confirmed successfully');
        await fetchBookings();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      showNotification(error.response?.data?.message || 'Failed to confirm booking', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: false } }));
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedData({ ...selectedBooking });
  };

  const handleViewBooking = async (booking) => {
    try {
      setLoadingActions(prev => ({ ...prev, view: { ...prev.view, [booking._id]: true } }));
      setSelectedBooking(booking);
      setIsEditing(false);
      setEditedData(null);
    } catch (error) {
      console.error('Error viewing booking:', error);
      showNotification('Failed to view booking details', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, view: { ...prev.view, [booking._id]: false } }));
    }
  };

  const handleSave = async () => {
    try {
      // Format the date properly before sending
      const formattedData = {
        ...editedData,
        date: new Date(editedData.date).toISOString(),
        guestCount: parseInt(editedData.guestCount),
      };

      // Remove any undefined or null values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === null) {
          delete formattedData[key];
        }
      });

      console.log('Sending data:', formattedData); // Debug log

      let response;
      if (editedData.eventType === 'Samuh Lagan') {
        response = await axios.put(`/api/bookings/samuh-lagan/update/${editedData._id}`, formattedData);
      } else {
        response = await axios.put(`/api/bookings/update/${editedData._id}`, formattedData);
      }

      if (response.data) {
        showNotification('Booking updated successfully');
        setIsEditing(false);
        setSelectedBooking(response.data.booking || response.data);
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking:', error.response?.data || error);
      showNotification('Failed to update booking: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleViewDocument = (documentUrl, documentType) => {
    console.log('Viewing document:', { documentUrl, documentType });
    
    // Ensure the URL is properly formatted
    const formattedUrl = documentUrl.startsWith('http') 
      ? documentUrl 
      : `http://localhost:3000${documentUrl.startsWith('/') ? '' : '/'}${documentUrl}`;
    
    console.log('Formatted URL:', formattedUrl);
    
    // Prevent default behavior and page refresh
    event.preventDefault();
    
    // Open the document in a new tab
    window.open(formattedUrl, '_blank');
  };

  const handleApproveSamuhLagan = async (id) => {
    try {
      // Get fresh token
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      await axios.patch(`/api/bookings/samuh-lagan/${id}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Samuh Lagan request approved successfully');
      fetchSamuhLaganRequests();
    } catch (error) {
      console.error('Error approving Samuh Lagan request:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification('Failed to approve Samuh Lagan request', 'error');
      }
    }
  };

  const handleRejectSamuhLagan = async (id) => {
    setRejectionBookingId(id);
    setRejectionType('samuhLagan');
    setShowRejectionModal(true);
  };

  const handleConfirmSamuhLagan = async (id) => {
    try {
      // Get fresh token
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      await axios.patch(`/api/bookings/samuh-lagan/${id}/confirm-payment`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Samuh Lagan request confirmed successfully');
      fetchSamuhLaganRequests();
    } catch (error) {
      console.error('Error confirming Samuh Lagan request:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification('Failed to confirm Samuh Lagan request', 'error');
      }
    }
  };

  const handleFileUpload = async (files, type) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append(type, file);
      });

      const response = await axios.post('/api/bookings/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.documentUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Failed to upload file', 'error');
      return null;
    }
  };

  const handleApproveStudentAward = async (id) => {
    try {
      await axios.put(`/api/bookings/student-awards/approve/${id}`);
      showNotification('Student Award request approved successfully');
      fetchStudentAwardRequests();
    } catch (error) {
      console.error('Error approving Student Award request:', error);
      showNotification('Failed to approve Student Award request', 'error');
    }
  };

  const handleRejectStudentAward = async (id) => {
    setRejectionBookingId(id);
    setRejectionType('studentAward');
    setShowRejectionModal(true);
  };

  const handleDelete = async (id, type) => {
    setDeleteBookingId(id);
    setDeleteBookingType(type);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [deleteBookingId]: true } }));
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      let response;
      switch(deleteBookingType) {
        case 'booking':
          response = await axios.delete(`/api/bookings/${deleteBookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.data) {
            showNotification('Booking deleted successfully');
            fetchBookings();
          }
          break;

        case 'samuhLagan':
          response = await axios.delete(`/api/bookings/samuh-lagan/${deleteBookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.data) {
            showNotification('Samuh Lagan registration deleted successfully');
            fetchSamuhLaganRequests();
          }
          break;

        case 'studentAward':
          response = await axios.delete(`/api/bookings/student-awards/${deleteBookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.data) {
            showNotification('Student Award registration deleted successfully');
            fetchStudentAwardRequests();
          }
          break;

        case 'teamRegistration':
          response = await axios.delete(`/api/bookings/team-registrations/${deleteBookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.data) {
            showNotification('Team Registration deleted successfully');
            fetchTeamRegistrationRequests();
          }
          break;

        default:
          throw new Error('Unknown booking type');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      showNotification(
        error.response?.data?.error || 
        'Failed to delete registration. Please try again.',
        'error'
      );
    } finally {
      setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [deleteBookingId]: false } }));
      setShowDeleteConfirmation(false);
      setDeleteBookingId(null);
      setDeleteBookingType(null);
    }
  };

  const handleApproveTeamRegistration = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login again', 'error');
        return;
      }

      await axios.put(`/api/admin/forms/team-registrations/${id}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showNotification('Team Registration request approved successfully');
      fetchTeamRegistrationRequests();
    } catch (error) {
      console.error('Error approving Team Registration request:', error);
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again', 'error');
      } else {
        showNotification('Failed to approve Team Registration request', 'error');
      }
    }
  };

  const handleRejectTeamRegistration = async (id) => {
    setRejectionBookingId(id);
    setRejectionType('teamRegistration');
    setShowRejectionModal(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Complete Booking Management Report', 14, 15);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    // Add summary
    doc.setFontSize(12);
    doc.text('Summary:', 14, 35);
    doc.setFontSize(10);
    doc.text(`Total Event Bookings: ${bookings.length}`, 20, 42);
    doc.text(`Total Samuh Lagan Requests: ${samuhLaganRequests.length}`, 20, 49);
    doc.text(`Total Student Award Requests: ${studentAwardRequests.length}`, 20, 56);
    doc.text(`Total Team Registration Requests: ${teamRegistrationRequests.length}`, 20, 63);
    
    let yPosition = 75;

    // Event Bookings Section
    if (bookings.length > 0) {
      doc.setFontSize(14);
      doc.text('Event Bookings', 14, yPosition);
      yPosition += 10;

      const eventBookingsColumns = ['Customer', 'Service', 'Date', 'Status', 'Guest Count'];
      const eventBookingsRows = bookings.map(booking => [
        booking.firstName && booking.surname ? `${booking.firstName} ${booking.surname}` : 'N/A',
        booking.eventType || 'N/A',
        new Date(booking.date).toLocaleDateString(),
        booking.status || 'N/A',
        booking.guestCount || 'N/A'
      ]);

      autoTable(doc, {
        head: [eventBookingsColumns],
        body: eventBookingsRows,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Samuh Lagan Section
    if (samuhLaganRequests.length > 0) {
      doc.setFontSize(14);
      doc.text('Samuh Lagan Requests', 14, yPosition);
      yPosition += 10;

      const samuhLaganColumns = ['Bride', 'Groom', 'Date', 'Status', 'Guest Count'];
      const samuhLaganRows = samuhLaganRequests.map(request => [
        request.bride?.name || 'N/A',
        request.groom?.name || 'N/A',
        new Date(request.ceremonyDate).toLocaleDateString(),
        request.status || 'N/A',
        request.guestCount || 'N/A'
      ]);

      autoTable(doc, {
        head: [samuhLaganColumns],
        body: samuhLaganRows,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Student Award Section
    if (studentAwardRequests.length > 0) {
      doc.setFontSize(14);
      doc.text('Student Award Requests', 14, yPosition);
      yPosition += 10;

      const studentAwardColumns = ['Student Name', 'School', 'Percentage', 'Rank', 'Status'];
      const studentAwardRows = studentAwardRequests.map(request => [
        request.name || 'N/A',
        request.schoolName || 'N/A',
        `${request.totalPercentage}%` || 'N/A',
        request.rank || 'N/A',
        request.status || 'N/A'
      ]);

      autoTable(doc, {
        head: [studentAwardColumns],
        body: studentAwardRows,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Team Registration Section
    if (teamRegistrationRequests.length > 0) {
      doc.setFontSize(14);
      doc.text('Team Registration Requests', 14, yPosition);
      yPosition += 10;

      const teamRegistrationColumns = ['Game Name', 'Team Name', 'Captain', 'Contact', 'Status'];
      const teamRegistrationRows = teamRegistrationRequests.map(request => [
        request.gameName || 'N/A',
        request.teamName || 'N/A',
        request.captainName || 'N/A',
        request.mobileNumber || 'N/A',
        request.status || 'N/A'
      ]);

      autoTable(doc, {
        head: [teamRegistrationColumns],
        body: teamRegistrationRows,
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
      });
    }
    
    // Save the PDF
    doc.save(`complete-bookings-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSectionPDF = (section) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${section} Report`, 14, 15);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    let yPosition = 35;

    switch(section) {
      case 'Event Bookings':
        if (bookings.length > 0) {
          const columns = ['Customer', 'Service', 'Date', 'Status', 'Guest Count'];
          const rows = bookings.map(booking => [
            booking.firstName && booking.surname ? `${booking.firstName} ${booking.surname}` : 'N/A',
            booking.eventType || 'N/A',
            new Date(booking.date).toLocaleDateString(),
            booking.status || 'N/A',
            booking.guestCount || 'N/A'
          ]);

          autoTable(doc, {
            head: [columns],
            body: rows,
            startY: yPosition,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [147, 51, 234],
              textColor: 255,
              fontStyle: 'bold',
            },
          });
        }
        break;

      case 'Samuh Lagan':
        if (samuhLaganRequests.length > 0) {
          const columns = ['Bride', 'Groom', 'Date', 'Status', 'Guest Count'];
          const rows = samuhLaganRequests.map(request => [
            request.bride?.name || 'N/A',
            request.groom?.name || 'N/A',
            new Date(request.ceremonyDate).toLocaleDateString(),
            request.status || 'N/A',
            request.guestCount || 'N/A'
          ]);

          autoTable(doc, {
            head: [columns],
            body: rows,
            startY: yPosition,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [147, 51, 234],
              textColor: 255,
              fontStyle: 'bold',
            },
          });
        }
        break;

      case 'Student Award':
        if (studentAwardRequests.length > 0) {
          const columns = ['Student Name', 'School', 'Percentage', 'Rank', 'Status'];
          const rows = studentAwardRequests.map(request => [
            request.name || 'N/A',
            request.schoolName || 'N/A',
            `${request.totalPercentage}%` || 'N/A',
            request.rank || 'N/A',
            request.status || 'N/A'
          ]);

          autoTable(doc, {
            head: [columns],
            body: rows,
            startY: yPosition,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [147, 51, 234],
              textColor: 255,
              fontStyle: 'bold',
            },
          });
        }
        break;

      case 'Team Registration':
        if (teamRegistrationRequests.length > 0) {
          const columns = ['Game Name', 'Team Name', 'Captain', 'Contact', 'Status'];
          const rows = teamRegistrationRequests.map(request => [
            request.gameName || 'N/A',
            request.teamName || 'N/A',
            request.captainName || 'N/A',
            request.mobileNumber || 'N/A',
            request.status || 'N/A'
          ]);

          autoTable(doc, {
            head: [columns],
            body: rows,
            startY: yPosition,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [147, 51, 234],
              textColor: 255,
              fontStyle: 'bold',
            },
          });
        }
        break;
    }
    
    // Save the PDF
    doc.save(`${section.toLowerCase().replace(' ', '-')}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Filter bookings based on active category
  const filteredBookings = bookings.filter(booking => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'samuh-lagan') return booking.eventType === 'Samuh Lagan';
    if (activeCategory === 'student-award') return booking.eventType === 'Student Award Registration';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

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

      {showRejectionModal && (
        <RejectionModal
          onClose={() => {
            setShowRejectionModal(false);
            setRejectionBookingId(null);
            setRejectionType('booking');
          }}
          onSubmit={handleRejectionSubmit}
          bookingType={rejectionType === 'booking' ? 'Booking' : 
                       rejectionType === 'samuhLagan' ? 'Samuh Lagan Request' : 
                       rejectionType === 'studentAward' ? 'Student Award Request' :
                       'Team Registration Request'}
        />
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowDeleteConfirmation(false);
            setDeleteBookingId(null);
            setDeleteBookingType(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <div className="border-b pb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Booking Management</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <div className="flex items-center">
                <div className="text-center">
                  <div className="font-medium">
                    {activeCategory === 'all' ? 'Event Bookings' :
                     activeCategory === 'samuh-lagan' ? 'Samuh Lagan' :
                     activeCategory === 'student-award' ? 'Student Award' :
                     'Team Registration'}
                  </div>
                  <div className="text-purple-600">
                    {activeCategory === 'all' ? bookings.length :
                     activeCategory === 'samuh-lagan' ? samuhLaganRequests.length :
                     activeCategory === 'student-award' ? studentAwardRequests.length :
                     teamRegistrationRequests.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => generateSectionPDF('Event Bookings')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download Event Bookings"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Event
              </button>
              <button
                onClick={() => generateSectionPDF('Samuh Lagan')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download Samuh Lagan"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Samuh
              </button>
              <button
                onClick={() => generateSectionPDF('Student Award')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download Student Award"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Award
              </button>
              <button
                onClick={() => generateSectionPDF('Team Registration')}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download Team Registration"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Team
              </button>
              <button
                onClick={generatePDF}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download All Reports"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                All
              </button>
            </div>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Event Bookings
          </button>
          <button
            onClick={() => setActiveCategory('samuh-lagan')}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === 'samuh-lagan' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Samuh Lagan
          </button>
          <button
            onClick={() => setActiveCategory('student-award')}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === 'student-award' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Student Award
          </button>
          <button
            onClick={() => setActiveCategory('team-registration')}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === 'team-registration' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Team Registration
          </button>
        </div>
      </div>

      {activeCategory === 'student-award' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-4 px-2">Student Name</th>
                <th className="py-4 px-2">School</th>
                <th className="py-4 px-2">Percentage</th>
                <th className="py-4 px-2">Rank</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentAwardRequests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-2">{request.name}</td>
                  <td className="py-4 px-2">{request.schoolName}</td>
                  <td className="py-4 px-2">{request.totalPercentage}%</td>
                  <td className="py-4 px-2">{request.rank}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveStudentAward(request._id)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Approve Request"
                            disabled={loadingActions.approve[request._id]}
                          >
                            {loadingActions.approve[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <CheckIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleRejectStudentAward(request._id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Reject Request"
                            disabled={loadingActions.reject[request._id]}
                          >
                            {loadingActions.reject[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleViewBooking(request)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(request._id, 'studentAward')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Registration"
                        disabled={loadingActions.delete[request._id]}
                      >
                        {loadingActions.delete[request._id] ? (
                          <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <XMarkIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeCategory === 'samuh-lagan' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-4 px-2">Bride</th>
                <th className="py-4 px-2">Groom</th>
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {samuhLaganRequests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-2">{request.bride.name}</td>
                  <td className="py-4 px-2">{request.groom.name}</td>
                  <td className="py-4 px-2">
                    {new Date(request.ceremonyDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveSamuhLagan(request._id)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Approve Request"
                            disabled={loadingActions.approve[request._id]}
                          >
                            {loadingActions.approve[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <CheckIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleRejectSamuhLagan(request._id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Reject Request"
                            disabled={loadingActions.reject[request._id]}
                          >
                            {loadingActions.reject[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button 
                          onClick={() => handleConfirmSamuhLagan(request._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          disabled={loadingActions.confirm[request._id]}
                        >
                          {loadingActions.confirm[request._id] ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Confirming...
                            </div>
                          ) : (
                            'Confirm'
                          )}
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewBooking(request)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(request._id, 'samuhLagan')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Registration"
                        disabled={loadingActions.delete[request._id]}
                      >
                        {loadingActions.delete[request._id] ? (
                          <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <XMarkIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeCategory === 'team-registration' ? (
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-4 px-2">Game Name</th>
                  <th className="py-4 px-2">Team Name</th>
                  <th className="py-4 px-2">Captain Name</th>
                  <th className="py-4 px-2">Contact</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(teamRegistrationRequests) && teamRegistrationRequests.length > 0 ? (
                  teamRegistrationRequests.map((request) => (
                    <tr key={request._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-2">{request.gameName}</td>
                      <td className="py-4 px-2">{request.teamName}</td>
                      <td className="py-4 px-2">{request.captainName}</td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <p>{request.mobileNumber}</p>
                          <p className="text-gray-500">{request.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveTeamRegistration(request._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Approve Registration"
                                disabled={loadingActions.approve[request._id]}
                              >
                                {loadingActions.approve[request._id] ? (
                                  <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <CheckIcon className="h-5 w-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectTeamRegistration(request._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Reject Registration"
                                disabled={loadingActions.reject[request._id]}
                              >
                                {loadingActions.reject[request._id] ? (
                                  <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <XMarkIcon className="h-5 w-5" />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewBooking(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                            disabled={loadingActions.view[request._id]}
                          >
                            {loadingActions.view[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(request._id, 'teamRegistration')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Registration"
                            disabled={loadingActions.delete[request._id]}
                          >
                            {loadingActions.delete[request._id] ? (
                              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 px-2 text-center text-gray-500">
                      No team registration requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-4 px-2">Customer</th>
                  <th className="py-4 px-2">Service</th>
                  <th className="py-4 px-2">Date</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-2">{booking.firstName && booking.surname ? `${booking.firstName} ${booking.surname}` : 'N/A'}</td>
                    <td className="py-4 px-2">{booking.eventType}</td>
                    <td className="py-4 px-2">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        booking.status === 'Booked' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex space-x-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(booking._id)} 
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve Booking"
                              disabled={loadingActions.approve[booking._id]}
                            >
                              {loadingActions.approve[booking._id] ? (
                                <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <CheckIcon className="h-5 w-5" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleReject(booking._id)} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Reject Booking"
                              disabled={loadingActions.reject[booking._id]}
                            >
                              {loadingActions.reject[booking._id] ? (
                                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <XMarkIcon className="h-5 w-5" />
                              )}
                            </button>
                          </>
                        )}
                        {booking.status === 'Approved' && (
                          <button 
                            onClick={() => handleConfirmBooking(booking._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loadingActions.confirm[booking._id]}
                          >
                            {loadingActions.confirm[booking._id] ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Confirming...
                              </div>
                            ) : (
                              'Confirm Booking'
                            )}
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewBooking(booking)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                          disabled={loadingActions.view[booking._id]}
                        >
                          {loadingActions.view[booking._id] ? (
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id, 'booking')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Booking"
                          disabled={loadingActions.delete[booking._id]}
                        >
                          {loadingActions.delete[booking._id] ? (
                            <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <XMarkIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedBooking.eventType === 'Team Registration' ? 'Team Registration Details' : 
                 isEditing ? 'Edit Booking' : 'Booking Details'}
              </h2>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setIsEditing(false);
                  setEditedData(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedBooking.eventType === 'Team Registration' ? (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Team Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Game Name</label>
                        <p className="mt-1">{selectedBooking.gameName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Team Name</label>
                        <p className="mt-1">{selectedBooking.teamName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Captain Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Captain Name</label>
                        <p className="mt-1">{selectedBooking.captainName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <p className="mt-1">{selectedBooking.mobileNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1">{selectedBooking.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Team Members</h3>
                    <div className="space-y-2">
                      {selectedBooking.teamMembers && selectedBooking.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-gray-500 mr-2">{index + 1}.</span>
                          <p>{member}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      selectedBooking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                    {selectedBooking.rejectionReason && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                        <p className="mt-1 text-red-600">{selectedBooking.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {selectedBooking.eventType !== 'Samuh Lagan' && selectedBooking.eventType !== 'Student Award Registration' && (
                    <>
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.firstName}
                                onChange={(e) => setEditedData({ ...editedData, firstName: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Surname</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.surname}
                                onChange={(e) => setEditedData({ ...editedData, surname: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.surname}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editedData.email}
                                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editedData.phone}
                                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Event Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Event Type</label>
                            {isEditing ? (
                              <select
                                value={editedData.eventType}
                                onChange={(e) => setEditedData({ ...editedData, eventType: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              >
                                <option value="wedding">Wedding</option>
                                <option value="corporate">Corporate Event</option>
                                <option value="birthday">Birthday Party</option>
                                <option value="social">Social Gathering</option>
                              </select>
                            ) : (
                              <p className="mt-1">{selectedBooking.eventType}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Guest Count</label>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedData.guestCount}
                                onChange={(e) => setEditedData({ ...editedData, guestCount: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.guestCount}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={editedData.date.split('T')[0]}
                                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Time</label>
                            <div className="grid grid-cols-2 gap-2">
                              {isEditing ? (
                                <>
                                  <input
                                    type="time"
                                    value={editedData.startTime}
                                    onChange={(e) => setEditedData({ ...editedData, startTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                  />
                                  <input
                                    type="time"
                                    value={editedData.endTime}
                                    onChange={(e) => setEditedData({ ...editedData, endTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                  />
                                </>
                              ) : (
                                <p className="mt-1">{`${selectedBooking.startTime} - ${selectedBooking.endTime}`}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Event Document</h3>
                        {selectedBooking.eventDocument ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  const formattedUrl = selectedBooking.eventDocument.startsWith('http') 
                                    ? selectedBooking.eventDocument 
                                    : `http://localhost:3000${selectedBooking.eventDocument.startsWith('/') ? '' : '/'}${selectedBooking.eventDocument}`;
                                  
                                  // Create a link element and trigger a click
                                  const link = document.createElement('a');
                                  link.href = formattedUrl;
                                  link.target = '_blank';
                                  link.rel = 'noopener noreferrer';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <DocumentIcon className="h-5 w-5 mr-2" />
                                View Document
                              </button>
                              {isEditing && (
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const formData = new FormData();
                                      formData.append('document', file);
                                      axios.post('/api/bookings/upload-document', formData, {
                                        headers: {
                                          'Content-Type': 'multipart/form-data'
                                        }
                                      })
                                      .then(response => {
                                        setEditedData({
                                          ...editedData,
                                          eventDocument: response.data.documentUrl
                                        });
                                      })
                                      .catch(error => {
                                        console.error('Error uploading document:', error);
                                        showNotification('Failed to upload document', 'error');
                                      });
                                    }
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>Document Name: {selectedBooking.eventDocument.split('/').pop()}</p>
                              <p>Document Type: {selectedBooking.eventDocument.split('.').pop().toUpperCase()}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">No document uploaded</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                        {isEditing ? (
                          <textarea
                            value={editedData.additionalNotes}
                            onChange={(e) => setEditedData({ ...editedData, additionalNotes: e.target.value })}
                            rows="4"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                        ) : (
                          <p className="mt-1">{selectedBooking.additionalNotes}</p>
                        )}
                      </div>
                    </>
                  )}

                  {selectedBooking.eventType === 'Samuh Lagan' && selectedBooking.bride && selectedBooking.groom && (
                    <>
                      <CollapsibleSection title="Bride Information" defaultOpen={true}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.bride?.name || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, name: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Photo</label>
                            {selectedBooking.bride?.photo ? (
                              <img src={selectedBooking.bride.photo} alt="Bride" className="h-24 w-24 rounded-lg mt-1" />
                            ) : (
                              <p className="mt-1 text-gray-500">No photo uploaded</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.bride?.fatherName || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, fatherName: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.fatherName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.bride?.motherName || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, motherName: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.motherName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedData.bride?.age || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, age: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.age}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editedData.bride?.contactNumber || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, contactNumber: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.contactNumber}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editedData.bride?.email || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, email: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            {isEditing ? (
                              <textarea
                                value={editedData.bride?.address || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  bride: { ...editedData.bride, address: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                rows="3"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.bride?.address}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Documents</label>
                            {selectedBooking.bride?.documents && selectedBooking.bride.documents.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {selectedBooking.bride.documents.map((doc, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                                    <a 
                                      href={doc} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Document {index + 1}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-gray-500">No documents uploaded</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>
                      <CollapsibleSection title="Groom Information">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.groom?.name || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, name: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Photo</label>
                            {selectedBooking.groom?.photo ? (
                              <img src={selectedBooking.groom.photo} alt="Groom" className="h-24 w-24 rounded-lg mt-1" />
                            ) : (
                              <p className="mt-1 text-gray-500">No photo uploaded</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.groom?.fatherName || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, fatherName: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.fatherName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedData.groom?.motherName || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, motherName: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.motherName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedData.groom?.age || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, age: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.age}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editedData.groom?.contactNumber || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, contactNumber: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.contactNumber}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editedData.groom?.email || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, email: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            {isEditing ? (
                              <textarea
                                value={editedData.groom?.address || ''}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  groom: { ...editedData.groom, address: e.target.value }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                rows="3"
                              />
                            ) : (
                              <p className="mt-1">{selectedBooking.groom?.address}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Documents</label>
                            {selectedBooking.groom?.documents && selectedBooking.groom.documents.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {selectedBooking.groom.documents.map((doc, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                                    <a 
                                      href={doc} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Document {index + 1}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-gray-500">No documents uploaded</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>
                      <CollapsibleSection title="Ceremony Details">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ceremony Date</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={new Date(editedData.ceremonyDate).toISOString().split('T')[0]}
                                onChange={e => setEditedData({
                                  ...editedData,
                                  ceremonyDate: e.target.value
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                            ) : (
                              <p className="mt-1">{new Date(selectedBooking.ceremonyDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              selectedBooking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              selectedBooking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedBooking.status}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedBooking.paymentStatus}
                            </span>
                          </div>
                          {selectedBooking.rejectionReason && (
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                              <p className="mt-1 text-red-600">{selectedBooking.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleSection>
                    </>
                  )}

                  {selectedBooking.eventType === 'Student Award Registration' && (
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Student Award Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1">{selectedBooking.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">School Name</label>
                            <p className="mt-1">{selectedBooking.schoolName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Standard</label>
                            <p className="mt-1">{selectedBooking.standard}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Board Name</label>
                            <p className="mt-1">{selectedBooking.boardName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Exam Year</label>
                            <p className="mt-1">{selectedBooking.examYear}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Total Percentage</label>
                            <p className="mt-1">{selectedBooking.totalPercentage}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Rank</label>
                            <p className="mt-1">{selectedBooking.rank}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Marksheet</label>
                            <a href={selectedBooking.marksheet} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">View Marksheet</a>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              selectedBooking.status === 'approved' ? 'bg-green-100 text-green-800' :
                              selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              selectedBooking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedBooking.status}
                            </span>
                          </div>
                          {selectedBooking.rejectionReason && (
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                              <p className="mt-1 text-red-600">{selectedBooking.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedBooking.eventType === 'Team Registration' && (
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Team Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Game Name</label>
                            <p className="mt-1">{selectedBooking.gameName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Team Name</label>
                            <p className="mt-1">{selectedBooking.teamName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Captain Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Captain Name</label>
                            <p className="mt-1">{selectedBooking.captainName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <p className="mt-1">{selectedBooking.mobileNumber}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1">{selectedBooking.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="text-lg font-medium mb-4">Team Members</h3>
                        <div className="space-y-2">
                          {selectedBooking.teamMembers && selectedBooking.teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center">
                              <span className="text-gray-500 mr-2">{index + 1}.</span>
                              <p>{member}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          selectedBooking.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedBooking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBooking.status}
                        </span>
                        {selectedBooking.rejectionReason && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                            <p className="mt-1 text-red-600">{selectedBooking.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    {!isEditing && (
                      <button
                        onClick={handleStartEditing}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Edit Booking
                      </button>
                    )}
                    {isEditing && (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedData(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DeleteConfirmationModal = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this registration? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default BookingManagement;