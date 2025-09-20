import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';



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

      const response = await axiosInstance.get('/api/admin/forms/status');

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

      const response = await axiosInstance.put(
        `/api/admin/forms/status/${formData.formName}`,
        {
          active: true,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          eventDate: eventDate.toISOString()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Loading Form Management</h3>
            <p className="text-neutral-300">Please wait while we load the form configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Form Management</h1>
              <p className="text-neutral-300 text-sm sm:text-base">Configure registration form timers</p>
            </div>
          </div>
          <button
            onClick={fetchFormStatus}
            className="btn-secondary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Status</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="glass-effect border border-red-500/30 bg-red-500/10 text-red-300 px-6 py-4 rounded-xl mb-6 animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIconSolid className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="glass-effect border border-neon-500/30 bg-neon-500/10 p-6 mb-8 rounded-xl animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircleIconSolid className="h-6 w-6 text-neon-400" />
            </div>
            <div>
              <p className="text-neon-300 font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        {/* Samuh Lagan Form */}
        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-neon opacity-20 rounded-bl-3xl"></div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Samuh Lagan</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-neutral-300 text-sm sm:text-base mb-1 sm:mb-0 sm:mr-2">Status:</span>
              <span className={`font-semibold text-sm sm:text-base ${
                getFormStatus(forms.samuhLagan).color === 'text-red-500' ? 'text-red-400' :
                getFormStatus(forms.samuhLagan).color === 'text-green-500' ? 'text-neon-400' :
                getFormStatus(forms.samuhLagan).color === 'text-orange-500' ? 'text-sunset-400' :
                'text-electric-400'
              }`}>
                {getFormStatus(forms.samuhLagan).text}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-neutral-300 text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-neon-400 flex-shrink-0" />
                <span className="truncate">Event: {formatDate(forms.samuhLagan?.eventDate)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-electric-400 flex-shrink-0" />
                <span className="truncate">Start: {formatDateTime(forms.samuhLagan?.startTime)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                <span className="truncate">End: {formatDateTime(forms.samuhLagan?.endTime)}</span>
              </div>
            </div>
            {forms.samuhLagan?.lastUpdated && (
              <div className="text-xs sm:text-sm text-neutral-400 border-t border-white/10 pt-2 sm:pt-3 mt-2 sm:mt-3">
                Updated: {formatDateTime(forms.samuhLagan.lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Student Awards Form */}
        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary opacity-20 rounded-bl-3xl"></div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Student Awards</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-neutral-300 text-sm sm:text-base mb-1 sm:mb-0 sm:mr-2">Status:</span>
              <span className={`font-semibold text-sm sm:text-base ${
                getFormStatus(forms.studentAwards).color === 'text-red-500' ? 'text-red-400' :
                getFormStatus(forms.studentAwards).color === 'text-green-500' ? 'text-neon-400' :
                getFormStatus(forms.studentAwards).color === 'text-orange-500' ? 'text-sunset-400' :
                'text-electric-400'
              }`}>
                {getFormStatus(forms.studentAwards).text}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-neutral-300 text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                <span className="truncate">Event: {formatDate(forms.studentAwards?.eventDate)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-electric-400 flex-shrink-0" />
                <span className="truncate">Start: {formatDateTime(forms.studentAwards?.startTime)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                <span className="truncate">End: {formatDateTime(forms.studentAwards?.endTime)}</span>
              </div>
            </div>
            {forms.studentAwards?.lastUpdated && (
              <div className="text-xs sm:text-sm text-neutral-400 border-t border-white/10 pt-2 sm:pt-3 mt-2 sm:mt-3">
                Updated: {formatDateTime(forms.studentAwards.lastUpdated)}
              </div>
            )}
          </div>
        </div>

        {/* Team Registration Form */}
        <div className="card-hover p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-electric opacity-20 rounded-bl-3xl"></div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Team Registration</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-neutral-300 text-sm sm:text-base mb-1 sm:mb-0 sm:mr-2">Status:</span>
              <span className={`font-semibold text-sm sm:text-base ${
                getFormStatus(forms.teamRegistration).color === 'text-red-500' ? 'text-red-400' :
                getFormStatus(forms.teamRegistration).color === 'text-green-500' ? 'text-neon-400' :
                getFormStatus(forms.teamRegistration).color === 'text-orange-500' ? 'text-sunset-400' :
                'text-electric-400'
              }`}>
                {getFormStatus(forms.teamRegistration).text}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-neutral-300 text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-electric-400 flex-shrink-0" />
                <span className="truncate">Event: {formatDate(forms.teamRegistration?.eventDate)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-electric-400 flex-shrink-0" />
                <span className="truncate">Start: {formatDateTime(forms.teamRegistration?.startTime)}</span>
              </div>
              <div className="flex items-center text-neutral-300 text-sm">
                <ClockIcon className="w-4 h-4 mr-2 text-secondary-400 flex-shrink-0" />
                <span className="truncate">End: {formatDateTime(forms.teamRegistration?.endTime)}</span>
              </div>
            </div>
            {forms.teamRegistration?.lastUpdated && (
              <div className="text-xs sm:text-sm text-neutral-400 border-t border-white/10 pt-2 sm:pt-3 mt-2 sm:mt-3">
                Updated: {formatDateTime(forms.teamRegistration.lastUpdated)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Timer Settings */}
      <div className="card-glass animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 sm:pb-6 mb-6">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <div className="w-8 h-8 bg-gradient-electric rounded-lg flex items-center justify-center neon-glow">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Set Form Timer</h2>
              <p className="text-neutral-300 text-sm">Configure form availability</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <label className="form-label">
                Form Type
              </label>
              <select
                name="formName"
                value={formData.formName}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="samuhLagan">Samuh Lagan Registration</option>
                <option value="studentAwards">Student Awards Registration</option>
                <option value="teamRegistration">Team Registration</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="form-label">
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="form-label">
                End Time
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center space-x-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Setting Timer...</span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-4 h-4" />
                  <span>Set Form Timer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormManagement; 