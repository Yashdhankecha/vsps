import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { FaCalendarAlt, FaUserFriends, FaClock, FaEnvelope, FaPhone, FaUser, FaCheckCircle, FaEye, FaTimes, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Button, Input, TextArea } from '../components';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Booking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    eventType: '',
    guestCount: '',
    additionalNotes: '',
    eventDocuments: [],
    documentTypes: [],
    villageName: ''
  });
  const [bookedEvents, setBookedEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [guestCountError, setGuestCountError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Add village options
  const villageOptions = [
    { value: '', label: 'Select your village' },
    { value: 'none', label: 'None' },
    { value: 'Vadodara', label: 'Vadodara' },
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Surat', label: 'Surat' },
    { value: 'Rajkot', label: 'Rajkot' },
    { value: 'Gandhinagar', label: 'Gandhinagar' }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      // Fetch user profile to get email
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get('/api/users/profile');

          if (response.data && response.data.email) {
            setFormData(prev => ({
              ...prev,
              email: response.data.email
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };

      fetchUserProfile();

      // Fetch bookings only when authenticated
      fetchBookings();
    }

    // Check if there's a stored booking date from previous session
    const storedDate = localStorage.getItem('selectedBookingDate');
    if (storedDate && token) {
      setSelectedDate(new Date(storedDate));
      setShowForm(true);
      localStorage.removeItem('selectedBookingDate');
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/users/bookings');
      const bookingsData = Array.isArray(response.data) ? response.data : [];
      // Filter out rejected bookings and only show pending and booked events
      const filteredBookings = bookingsData.filter(booking => booking.status !== 'Rejected');
      setBookedEvents(filteredBookings.map(booking => ({
        title: booking.status,
        start: new Date(booking.date),
        end: new Date(booking.date),
        allDay: true,
        status: booking.status
      })));
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Handle 401/403 errors specifically
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Don't show error for unauthorized users, just don't show bookings
        setBookedEvents([]);
      } else {
        setError('Failed to load bookings. Please try again later.');
      }
    }
  };

  const isDateBooked = (date) => {
    return bookedEvents.some(event =>
      format(date, 'yyyy-MM-dd') === format(event.start, 'yyyy-MM-dd') &&
      (event.status === 'Booked' || event.status === 'Pending')
    );
  };

  const handleDateSelect = (slotInfo) => {
    // For mobile devices, slotInfo may be different, so we need to handle both cases
    let selectedDate;

    if (slotInfo.start) {
      selectedDate = new Date(slotInfo.start);
    } else if (slotInfo.slots && slotInfo.slots.length > 0) {
      // Handle mobile/touch selection
      selectedDate = new Date(slotInfo.slots[0]);
    } else {
      // Fallback
      selectedDate = new Date();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the selected date is in the past
    if (selectedDate < today) {
      alert('You cannot book dates in the past. Please select a future date.');
      return;
    }

    if (isDateBooked(selectedDate)) {
      alert('This date is already booked. Please select another date.');
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      // Store the selected date in localStorage to restore it after login
      localStorage.setItem('selectedBookingDate', selectedDate.toISOString());
      // Store the current URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/booking');
      // Redirect to login page
      navigate('/auth');
      return;
    }

    setSelectedDate(selectedDate);
    setShowForm(true);
  };

  const handleDateHover = (slotInfo) => {
    setHoveredDate(new Date(slotInfo.start));
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.surname.trim()) errors.surname = 'Surname is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Phone number must be 10 digits.';
    if (!formData.eventType) errors.eventType = 'Event type is required.';
    if (!formData.villageName) errors.villageName = 'Village name is required.';
    if (formData.guestCount === '' || formData.guestCount === null) errors.guestCount = 'Guest count is required.';
    else {
      const numGuestCount = parseInt(formData.guestCount, 10);
      if (isNaN(numGuestCount) || numGuestCount < 0) errors.guestCount = 'Guest count cannot be negative.';
      else if (numGuestCount > 1000) errors.guestCount = 'Guest count cannot exceed 1000.';
    }
    if (formData.eventDocuments.length === 0) errors.eventDocuments = 'At least one document is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form validation starting...');
    if (!validateForm()) {
      console.log('Form validation failed');
      setIsSubmitting(false); // Ensure isSubmitting is reset if validation fails
      return;
    }
    console.log('Form validation passed');

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if at least one document is uploaded
      if (formData.eventDocuments.length === 0) {
        alert('Please upload at least one document');
        setIsSubmitting(false);
        return;
      }

      const formattedDate = selectedDate.toISOString();

      // Ensure document URL is properly formatted
      let documentUrl = formData.eventDocuments[0];
      if (documentUrl.startsWith('http:/')) {
        documentUrl = documentUrl.replace('http:/', 'http://');
      }

      // Check if user is a Samaj member
      const isSamajMember = formData.surname.toLowerCase() === 'patel' &&
        ['Vadodara', 'Ahmedabad', 'Surat', 'Rajkot', 'Gandhinagar'].includes(formData.villageName);

      const bookingData = {
        firstName: formData.firstName,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        date: formattedDate,
        guestCount: parseInt(formData.guestCount),
        additionalNotes: formData.additionalNotes,
        villageName: formData.villageName,
        eventDocument: documentUrl,
        documentType: formData.documentTypes[0] || 'Other',
        status: 'Pending',
        isSamajMember: isSamajMember
      };

      console.log('Submitting booking data:', bookingData);

      // Log the axios instance configuration
      console.log('Axios instance baseURL:', axios.defaults?.baseURL || 'not set');
      console.log('Using axios instance from utils/axiosConfig');

      const response = await axios.post('/api/bookings/submit', bookingData);

      console.log('Booking submission response:', response);

      if (response.data) {
        setShowSuccessPopup(true);
        setShowForm(false);
        setFormData({
          firstName: '',
          surname: '',
          email: '',
          phone: '',
          eventType: '',
          guestCount: '',
          additionalNotes: '',
          eventDocuments: [],
          documentTypes: [],
          villageName: ''
        });
        fetchBookings();

        // Hide the success popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      console.error('Error response:', error.response);

      // More detailed error handling
      let errorMessage = 'Error submitting booking request. Please try again.';

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          if (error.response.data.missingFields) {
            errorMessage = `Missing required fields: ${error.response.data.missingFields.join(', ')}`;
          } else if (error.response.data.details) {
            errorMessage = `Validation error: ${error.response.data.details.map(d => `${d.field}: ${d.message}`).join(', ')}`;
          } else {
            errorMessage = error.response.data.message || 'Bad request';
          }
        } else if (error.response.status === 401) {
          navigate('/auth');
          return;
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data.message || `HTTP ${error.response.status} error`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Special handling for guestCount to use its dedicated error state and logic if preferred
    if (name === 'guestCount') {
      const numValue = parseInt(value, 10);
      if (value === '' || (numValue >= 0 && numValue <= 1000)) {
        setGuestCountError(''); // Clear guest count specific error
        if (formErrors.guestCount) setFormErrors(prev => ({ ...prev, guestCount: null })); // Also clear general form error for guestCount
      } else if (numValue < 0) {
        setGuestCountError('Guest count cannot be negative.');
      } else if (numValue > 1000) {
        setGuestCountError('Guest count cannot exceed 1000.');
      }
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const formData = new FormData();

      // Append each file to the FormData with the correct key 'document'
      files.forEach((file, index) => {
        formData.append(`document`, file);
      });

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Uploading document...');

        const response = await axios.post('/api/bookings/upload-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Document upload response:', response.data);

        // Check if the response contains the expected data
        if (response.data && response.data.documentUrl) {
          // Update state with the new document
          setFormData(prev => ({
            ...prev,
            eventDocuments: [...prev.eventDocuments, response.data.documentUrl],
            documentTypes: [...prev.documentTypes, response.data.documentType]
          }));
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error uploading documents:', error);
        console.error('Error response:', error.response);

        let errorMessage = 'Failed to upload documents. Please try again.';

        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.message || 'Bad request';
          } else if (error.response.status === 401) {
            navigate('/auth');
            return;
          } else if (error.response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = error.response.data.message || `HTTP ${error.response.status} error`;
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message || 'Unknown error occurred';
        }

        alert(errorMessage);
      }
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      eventDocuments: prev.eventDocuments.filter((_, i) => i !== index),
      documentTypes: prev.documentTypes.filter((_, i) => i !== index)
    }));
  };

  const viewDocument = (docUrl, docType) => {
    // Ensure the URL is properly formatted
    let formattedUrl = docUrl;

    // Fix common URL issues
    if (formattedUrl.startsWith('http:/')) {
      formattedUrl = formattedUrl.replace('http:/', 'http://');
    }

    // Determine file type from URL
    const fileExtension = formattedUrl.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

    // For non-image files, directly open in default application
    if (!isImage) {
      window.open(formattedUrl, '_blank');
      return;
    }

    // For images, show in modal
    setSelectedDocument(formattedUrl);
    setSelectedDocumentType(docType || 'Document');
    setShowDocumentViewer(true);
  };

  const closeDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
    setSelectedDocumentType('');
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#7c3aed',
      borderRadius: '8px',
      opacity: 0.95,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '4px 8px',
      fontSize: '0.75rem',
      fontWeight: '600',
      boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
      transition: 'all 0.3s ease-in-out',
      textTransform: 'capitalize',
      margin: '2px 0',
      textAlign: 'center'
    };

    if (event.status === 'Booked') {
      style.backgroundColor = '#dc2626';
    } else if (event.status === 'Pending') {
      style.backgroundColor = '#d97706';
    }

    return {
      style
    };
  };

  const dayPropGetter = (date) => {
    const isHovered = hoveredDate && format(date, 'yyyy-MM-dd') === format(hoveredDate, 'yyyy-MM-dd');
    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const isBooked = isDateBooked(date);
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    // Add a class for booked dates to improve styling
    let className = `transition-all duration-300 ${isHovered && !isBooked && !isPast ? 'bg-violet-200 cursor-pointer hover:bg-violet-300 hover:scale-105 hover:shadow-md' : ''
      } ${isSelected ? 'bg-violet-300 font-bold ring-2 ring-violet-600 ring-opacity-70 scale-105 shadow-md' : ''
      } ${isBooked ? 'bg-red-100 cursor-not-allowed booked' : ''
      } ${isToday ? 'font-bold text-violet-700 ring-1 ring-violet-400' : ''
      } ${isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
      }`;

    // For mobile, ensure we have proper touch targets
    if (window.innerWidth <= 768) {
      className += ' touch-target';
    }

    return {
      className,
      style: {
        borderRadius: '12px',
        margin: '3px',
        minHeight: window.innerWidth <= 480 ? '50px' : window.innerWidth <= 768 ? '60px' : '90px',
        position: 'relative',
        boxShadow: isSelected ? '0 4px 8px -2px rgba(124, 58, 237, 0.4)' : 'none',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isBooked || isPast ? 'not-allowed' : 'pointer'
      }
    };
  };

  const calendarCustomStyles = {
    className: 'custom-calendar',
    style: {
      height: '650px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.1)',
      padding: '20px'
    }
  };

  const calendarComponents = {
    toolbar: (props) => (
      <div className="flex justify-between items-center mb-6 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
        <button
          onClick={() => props.onNavigate('PREV')}
          className="p-2 hover:bg-white rounded-lg transition-all duration-300 text-violet-700 font-medium hover:shadow-sm"
        >
          ←
        </button>
        <span className="text-xl font-bold text-violet-900">
          {format(props.date, 'yyyy')}
        </span>
        <button
          onClick={() => props.onNavigate('NEXT')}
          className="p-2 hover:bg-white rounded-lg transition-all duration-300 text-violet-700 font-medium hover:shadow-sm"
        >
          →
        </button>
      </div>
    ),
    month: {
      header: ({ date }) => (
        <div className="text-center font-bold text-violet-900 py-3 text-lg">
          {format(date, 'MMMM')}
        </div>
      ),
      dateHeader: ({ date }) => (
        <div className="text-center font-medium text-gray-600 py-2">
          {format(date, 'd')}
        </div>
      )
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedDocumentType} Viewer</h3>
              <button
                onClick={closeDocumentViewer}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
              <img
                src={selectedDocument}
                alt={selectedDocumentType}
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="text-center p-4">
                      <p class="text-red-500 mb-2">Error loading image</p>
                      <a href="${selectedDocument}" target="_blank" class="text-indigo-600 hover:underline">Open in new tab</a>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-fade-in-up border border-white/10 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <FaCheckCircle className="text-green-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Booking Request Submitted!</h3>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                Your booking request has been submitted successfully. We'll review it and get back to you shortly.
              </p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                variant="primary"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3"
          alt="Venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Event</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Select your preferred date and let us help you create an unforgettable event
            </p>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Select Your Date</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center bg-violet-500/20 px-3 py-2 rounded-lg border border-violet-500/30">
                  <div className="w-3 h-3 rounded-full bg-violet-500 mr-2"></div>
                  <span className="font-medium text-violet-300">Available</span>
                </div>
                <div className="flex items-center bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="font-medium text-red-300">Booked</span>
                </div>
                <div className="flex items-center bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="font-medium text-amber-300">Pending</span>
                </div>
                <div className="flex items-center bg-gray-500/20 px-3 py-2 rounded-lg border border-gray-500/30">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span className="font-medium text-gray-300">Past Date</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> You cannot book dates in the past. Please select a future date.
                </p>
              </div>
            </div>
            <Calendar
              localizer={localizer}
              events={bookedEvents}
              startAccessor="start"
              endAccessor="end"
              {...calendarCustomStyles}
              onSelectSlot={handleDateSelect}
              onSelectEvent={(event) => {
                // Handle event click if needed
                console.log('Event clicked:', event);
              }}
              selectable
              views={['month']}
              defaultView="month"
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              onMouseEnter={handleDateHover}
              onMouseLeave={handleDateLeave}
              onTouchStart={(e) => {
                // Handle touch events for mobile
                console.log('Touch start:', e);
              }}
              tooltipAccessor={event => `${event.title} - ${format(event.start, 'MMMM d, yyyy')}`}
              components={calendarComponents}
              formats={{
                dateFormat: 'd',
                dayFormat: 'd',
                monthHeaderFormat: 'MMMM yyyy',
                dayHeaderFormat: 'EEE d',
                dayRangeHeaderFormat: ({ start, end }) => `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
              }}
              min={new Date()} // Set minimum date to today
              // Improve mobile responsiveness
              style={{
                height: 'auto',
                minHeight: '500px'
              }}
            />
          </div>

          {/* Booking Form Section - Improved mobile design */}
          <div className="lg:col-span-1">
            {showForm ? (
              <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <div className="mb-6 p-4 bg-gradient-electric rounded-xl border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Selected Date:
                      </h2>
                      <div className="text-3xl font-bold text-white">
                        {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                      </div>
                      <div className="mt-2 text-lg text-white">
                        {selectedDate && format(selectedDate, 'EEEE')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setSelectedDate(null);
                      }}
                      className="text-white hover:text-gray-200 transition-colors"
                      aria-label="Close form"
                    >
                      <FaTimes className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        error={formErrors.firstName}
                      />
                    </div>

                    <div>
                      <Input
                        label="Surname"
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                        error={formErrors.surname}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-neutral-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="pl-10 w-full px-4 py-3 bg-neutral-900/70 backdrop-blur-sm border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      error={formErrors.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Village Name (for Samaj Verification)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-neutral-400" />
                      </div>
                      <select
                        name="villageName"
                        value={formData.villageName}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium"
                        required
                      >
                        {villageOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-neutral-800 text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaChevronDown className="text-neutral-400" />
                      </div>
                    </div>
                    {formErrors.villageName && <p className="text-sm text-red-400 mt-1">{formErrors.villageName}</p>}
                    <p className="mt-1 text-sm text-neutral-400">
                      Select your village to verify Samaj membership and get appropriate pricing.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium"
                      required
                    >
                      <option value="" className="bg-neutral-800 text-white">Select Event Type</option>
                      <option value="wedding" className="bg-neutral-800 text-white">Wedding</option>
                      <option value="corporate" className="bg-neutral-800 text-white">Corporate Event</option>
                      <option value="birthday" className="bg-neutral-800 text-white">Birthday Party</option>
                      <option value="social" className="bg-neutral-800 text-white">Social Gathering</option>
                    </select>
                    {formErrors.eventType && <p className="text-sm text-red-400 mt-1">{formErrors.eventType}</p>}
                  </div>

                  <div>
                    <Input
                      label="Number of Guests"
                      type="number"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      placeholder="e.g., 150"
                      required
                      min="0"
                      max="1000"
                      error={formErrors.guestCount || guestCountError}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-200 mb-2">
                      Event Documents
                    </label>
                    <div className="mb-2">
                      <p className="text-sm text-neutral-400 mb-2">
                        Please upload one or more of the following documents:
                      </p>
                      <ul className="text-sm text-neutral-400 list-disc pl-5 mb-3">
                        <li>Government-issued ID (Aadhar Card, PAN Card, or Passport)</li>
                        <li>Event invitation or announcement</li>
                        <li>Organization letterhead (for corporate events)</li>
                        <li>Birth certificate (for birthday parties)</li>
                        <li>Marriage certificate (for weddings)</li>
                      </ul>
                      <p className="text-sm text-neutral-400 mb-2">
                        Accepted formats: PDF, DOC, DOCX (Max size: 5MB per file)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      multiple
                      className="w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-electric file:text-white hover:file:opacity-90 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300"
                      required={formData.eventDocuments.length === 0}
                    />
                    {formErrors.eventDocuments && <p className="text-sm text-red-400 mt-1">{formErrors.eventDocuments}</p>}

                    {formData.eventDocuments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-neutral-200 mb-2">Uploaded Documents:</h4>
                        <ul className="space-y-2">
                          {formData.eventDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between glass-effect p-2 rounded-lg border border-white/10">
                              <span className="text-sm text-neutral-300 truncate">
                                {doc.split('/').pop()} ({formData.documentTypes[index]})
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => viewDocument(doc, formData.documentTypes[index])}
                                  className="text-electric-400 hover:text-electric-300 flex items-center"
                                >
                                  <FaEye className="mr-1" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <TextArea
                      label="Additional Notes"
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <div className="text-center">
                  <FaCalendarAlt className="text-6xl text-electric-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Select a Date
                  </h2>
                  <p className="text-neutral-300">
                    Click on your preferred date in the calendar to start your booking
                  </p>
                  {!isAuthenticated && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        You need to login to book an event. Click on a date to be redirected to the login page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;