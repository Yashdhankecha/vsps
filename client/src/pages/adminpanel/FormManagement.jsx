import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaHourglassEnd } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Define API base URL with fallback and trailing slash handling
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const FormManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [forms, setForms] = useState({
    samuhLagan: { active: false, startTime: null, endTime: null, lastUpdated: null },
    studentAwards: { active: false, startTime: null, endTime: null, lastUpdated: null },
    teamRegistration: { active: false, startTime: null, endTime: null, lastUpdated: null }
  });
  const [formData, setFormData] = useState({
    formName: 'samuhLagan',
    startTime: '',
    endTime: '',
    eventDate: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchFormStatus();
      // Set up an interval to check form status every minute
      const intervalId = setInterval(fetchFormStatus, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const fetchFormStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/forms/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Ensure all form types exist in the response
        const updatedForms = {
          samuhLagan: { active: false, startTime: null, endTime: null, lastUpdated: null },
          studentAwards: { active: false, startTime: null, endTime: null, lastUpdated: null },
          teamRegistration: { active: false, startTime: null, endTime: null, lastUpdated: null },
          ...response.data
        };
        setForms(updatedForms);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching form status:', err);
      setError('Failed to fetch form status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');
      
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Format dates to ISO string
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const eventDate = new Date(formData.eventDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      if (endDate <= startDate) {
        throw new Error('End time must be after start time');
      }

      if (eventDate < new Date()) {
        throw new Error('Event date cannot be in the past');
      }

      // Log the request payload for debugging
      console.log('Request payload:', {
        formName: formData.formName,
        active: true,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        eventDate: eventDate.toISOString()
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/forms/status/${formData.formName}`,
        {
          active: true,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          eventDate: eventDate.toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update the forms state with the new data
        const updatedForm = response.data[formData.formName] || {
          active: true,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          eventDate: eventDate.toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        setForms(prev => ({
          ...prev,
          [formData.formName]: updatedForm
        }));
        
        setSuccess(`Successfully set timer for ${formData.formName === 'samuhLagan' ? 'Samuh Lagan' : formData.formName === 'studentAwards' ? 'Student Awards' : 'Team Registration'} Registration Form`);
        setFormData({
          formName: 'samuhLagan',
          startTime: '',
          endTime: '',
          eventDate: ''
        });
      }
    } catch (err) {
      console.error('Error setting form timer:', err);
      // Log the full error response for debugging
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError(
        err.response?.data?.message || 
        err.response?.data?.details || 
        err.message || 
        'Failed to set form timer. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTimerExpired = (form) => {
    if (!form?.endTime) return false;
    
    const endDate = new Date(form.endTime);
    const now = new Date();
    
    return now > endDate;
  };

  const isTimerActive = (form) => {
    if (!form?.startTime || !form?.endTime) return false;
    
    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    const now = new Date();
    
    return now >= startDate && now <= endDate;
  };

  const getFormStatus = (form) => {
    if (!form) return { text: 'Inactive', color: 'text-red-500' };
    if (!form.active) return { text: 'Inactive', color: 'text-red-500' };
    
    if (isTimerExpired(form)) {
      return { text: 'Timer Expired', color: 'text-orange-500' };
    }
    
    if (isTimerActive(form)) {
      return { text: 'Active', color: 'text-green-500' };
    }
    
    if (form.startTime && new Date(form.startTime) > new Date()) {
      return { text: 'Scheduled', color: 'text-blue-500' };
    }
    
    return { text: 'Active', color: 'text-green-500' };
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Form Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Samuh Lagan Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Samuh Lagan Registration Form</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <span className={getFormStatus(forms.samuhLagan).color}>
                {getFormStatus(forms.samuhLagan).text}
              </span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>Event Date: {formatDate(forms.samuhLagan?.eventDate)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>Start Time: {formatDateTime(forms.samuhLagan?.startTime)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>End Time: {formatDateTime(forms.samuhLagan?.endTime)}</span>
            </div>
            {forms.samuhLagan?.lastUpdated && (
              <div className="text-sm text-gray-500">
                Last Updated: {formatDateTime(forms.samuhLagan.lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Student Awards Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Student Awards Registration Form</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <span className={getFormStatus(forms.studentAwards).color}>
                {getFormStatus(forms.studentAwards).text}
              </span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>Event Date: {formatDate(forms.studentAwards?.eventDate)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>Start Time: {formatDateTime(forms.studentAwards?.startTime)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>End Time: {formatDateTime(forms.studentAwards?.endTime)}</span>
            </div>
            {forms.studentAwards?.lastUpdated && (
              <div className="text-sm text-gray-500">
                Last Updated: {formatDateTime(forms.studentAwards.lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Team Registration Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Team Registration Form</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <span className={getFormStatus(forms.teamRegistration).color}>
                {getFormStatus(forms.teamRegistration).text}
              </span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>Event Date: {formatDate(forms.teamRegistration?.eventDate)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>Start Time: {formatDateTime(forms.teamRegistration?.startTime)}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span>End Time: {formatDateTime(forms.teamRegistration?.endTime)}</span>
            </div>
            {forms.teamRegistration?.lastUpdated && (
              <div className="text-sm text-gray-500">
                Last Updated: {formatDateTime(forms.teamRegistration.lastUpdated)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Timer Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Set Form Timer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Type
            </label>
            <select
              name="formName"
              value={formData.formName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="samuhLagan">Samuh Lagan Registration</option>
              <option value="studentAwards">Student Awards Registration</option>
              <option value="teamRegistration">Team Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Setting Timer...' : 'Set Timer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormManagement; 