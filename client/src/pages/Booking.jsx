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
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:3000';

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
          const response = await axios.get('/api/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
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
    }
    
    // Check if there's a stored booking date from previous session
    const storedDate = localStorage.getItem('selectedBookingDate');
    if (storedDate && token) {
      setSelectedDate(new Date(storedDate));
      setShowForm(true);
      localStorage.removeItem('selectedBookingDate');
    }
    
    fetchBookings();
    setIsLoading(false);
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
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
      setError('Failed to load bookings. Please try again later.');
    }
  };

  const isDateBooked = (date) => {
    return bookedEvents.some(event => 
      format(date, 'yyyy-MM-dd') === format(event.start, 'yyyy-MM-dd') && 
      (event.status === 'Booked' || event.status === 'Pending')
    );
  };

  const handleDateSelect = (slotInfo) => {
    const selectedDate = new Date(slotInfo.start);
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
    if (!validateForm()) {
      setIsSubmitting(false); // Ensure isSubmitting is reset if validation fails
      return;
    }
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

      const response = await axios.post('/api/bookings/submit', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      if (error.response?.status === 401) {
        navigate('/auth');
      } else {
        alert(`Error submitting booking request: ${error.response?.data?.message || 'Please try again'}`);
      }
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

        const response = await axios.post('/api/bookings/upload-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Document upload response:', response.data);
        
        // Update state with the new document
        setFormData(prev => ({
          ...prev,
          eventDocuments: [...prev.eventDocuments, response.data.documentUrl],
          documentTypes: [...prev.documentTypes, response.data.documentType]
        }));
      } catch (error) {
        console.error('Error uploading documents:', error);
        if (error.response?.status === 401) {
          navigate('/auth');
        } else {
          alert('Failed to upload documents: ' + (error.response?.data?.message || error.message));
        }
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

    return {
      className: `transition-all duration-300 ${
        isHovered && !isBooked && !isPast ? 'bg-violet-200 cursor-pointer hover:bg-violet-300 hover:scale-105 hover:shadow-md' : ''
      } ${
        isSelected ? 'bg-violet-300 font-bold ring-2 ring-violet-600 ring-opacity-70 scale-105 shadow-md' : ''
      } ${
        isBooked ? 'bg-red-100 cursor-not-allowed' : ''
      } ${
        isToday ? 'font-bold text-violet-700 ring-1 ring-violet-400' : ''
      } ${
        isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
      }`,
      style: {
        borderRadius: '12px',
        margin: '3px',
        minHeight: '90px',
        position: 'relative',
        boxShadow: isSelected ? '0 4px 8px -2px rgba(124, 58, 237, 0.4)' : 'none',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your booking request has been submitted successfully. We'll review it and get back to you shortly.
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
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
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Your Date</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center bg-violet-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-violet-600 mr-2"></div>
                  <span className="font-medium text-violet-900">Available</span>
                </div>
                <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="font-medium text-red-900">Booked</span>
                </div>
                <div className="flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="font-medium text-amber-900">Pending</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                  <span className="font-medium text-gray-600">Past Date</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
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
              selectable
              views={['month']}
              defaultView="month"
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              onMouseEnter={handleDateHover}
              onMouseLeave={handleDateLeave}
              tooltipAccessor={event => `${event.title} - ${format(event.start, 'MMMM d, yyyy')}`}
              components={calendarComponents}
              formats={{
                dateFormat: 'd',
                dayFormat: 'd',
                monthHeaderFormat: 'MMMM',
                dayHeaderFormat: 'd',
                dayRangeHeaderFormat: ({ start, end }) => `${format(start, 'd')} - ${format(end, 'd')}`
              }}
              min={new Date()} // Set minimum date to today
            />
          </div>

          {/* Booking Form Section */}
          <div className="lg:col-span-1">
            {showForm ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Selected Date:
                  </h2>
                  <div className="text-3xl font-bold text-violet-700">
                    {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                  </div>
                  <div className="mt-2 text-sm text-violet-600">
                    {selectedDate && format(selectedDate, 'EEEE')}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Surname
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      {formErrors.surname && <p className="text-red-500 text-xs mt-1">{formErrors.surname}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village Name (for Samaj Verification)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400" />
                      </div>
                      <select
                        name="villageName"
                        value={formData.villageName}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                        required
                      >
                        {villageOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaChevronDown className="text-gray-400" />
                      </div>
                    </div>
                    {formErrors.villageName && <p className="text-red-500 text-xs mt-1">{formErrors.villageName}</p>}
                    <p className="mt-1 text-sm text-gray-500">
                      Select your village to verify Samaj membership and get appropriate pricing.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Event Type</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="social">Social Gathering</option>
                    </select>
                    {formErrors.eventType && <p className="text-red-500 text-xs mt-1">{formErrors.eventType}</p>}
                  </div>

                  <div className="relative mb-4">
                    <FaUserFriends className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      placeholder="Number of Guests (e.g., 150)"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${formErrors.guestCount || guestCountError ? 'border-red-500' : 'border-gray-300'}`}
                      required
                      min="0"
                      max="1000"
                    />
                    {(formErrors.guestCount || guestCountError) && <p className="text-red-500 text-sm mt-1">{formErrors.guestCount || guestCountError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Documents
                    </label>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Please upload one or more of the following documents:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc pl-5 mb-3">
                        <li>Government-issued ID (Aadhar Card, PAN Card, or Passport)</li>
                        <li>Event invitation or announcement</li>
                        <li>Organization letterhead (for corporate events)</li>
                        <li>Birth certificate (for birthday parties)</li>
                        <li>Marriage certificate (for weddings)</li>
                      </ul>
                      <p className="text-sm text-gray-600 mb-2">
                        Accepted formats: PDF, DOC, DOCX (Max size: 5MB per file)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      multiple
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={formData.eventDocuments.length === 0}
                    />
                    {formErrors.eventDocuments && <p className="text-red-500 text-xs mt-1">{formErrors.eventDocuments}</p>}
                    
                    {formData.eventDocuments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                        <ul className="space-y-2">
                          {formData.eventDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                              <span className="text-sm text-gray-700 truncate">
                                {doc.split('/').pop()} ({formData.documentTypes[index]})
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => viewDocument(doc, formData.documentTypes[index])}
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                  <FaEye className="mr-1" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-500 hover:text-red-700"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg text-white transition-colors ${
                      isSubmitting 
                        ? 'bg-purple-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <FaCalendarAlt className="text-6xl text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Select a Date
                  </h2>
                  <p className="text-gray-600">
                    Click on your preferred date in the calendar to start your booking
                  </p>
                  {!isAuthenticated && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 text-sm">
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