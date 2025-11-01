import React, { useState, useEffect } from 'react';
import { FaUsers, FaUser, FaEnvelope, FaPhone, FaPlus, FaTrash, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

const TeamRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formExpired, setFormExpired] = useState(false);
  const [formNotStarted, setFormNotStarted] = useState(false);
  const [formEndTime, setFormEndTime] = useState(null);
  const [formStartTime, setFormStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canAccessForm, setCanAccessForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [eventDate, setEventDate] = useState(null);

  const [formData, setFormData] = useState({
    gameName: '',
    teamName: '',
    captainName: '',
    mobileNumber: '',
    email: '',
    teamMembers: ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const checkFormStatus = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setError('You need to be logged in to access this form. Please log in and try again.');
          navigate('/auth');
          return;
        }
        
        const visibilityResponse = await axios.get('/api/admin/forms/check-form-visibility/teamRegistrationForm');
        
        if (!visibilityResponse.data.visible) {
          setError('This form is not currently available. Please check back later.');
          return;
        }
        
        const accessResponse = await axios.get('/api/admin/forms/can-access-form/teamRegistrationForm');
        
        if (!accessResponse.data.canAccess) {
          const formStatus = accessResponse.data.formStatus;
          
          if (!formStatus.active) {
            setError('This form is currently disabled by the administrator.');
          } else if (formStatus.endTime && new Date(formStatus.endTime) < new Date()) {
            setFormExpired(true);
            setFormEndTime(new Date(formStatus.endTime));
            setError(`This form was available until ${new Date(formStatus.endTime).toLocaleString()}. The submission period has ended.`);
          } else if (formStatus.startTime && new Date(formStatus.startTime) > new Date()) {
            setFormNotStarted(true);
            setFormStartTime(new Date(formStatus.startTime));
            setError(`This form will be available starting from ${new Date(formStatus.startTime).toLocaleString()}. Please check back later.`);
          } else {
            setError('This form is currently not accessible.');
          }
          return;
        }

        // Get form timing details
        const publicStatusResponse = await axios.get('/api/admin/forms/public/status');
        const teamRegistrationForm = publicStatusResponse.data.teamRegistration;
        
        if (teamRegistrationForm.startTime) {
          setFormStartTime(new Date(teamRegistrationForm.startTime));
        }
        if (teamRegistrationForm.endTime) {
          setFormEndTime(new Date(teamRegistrationForm.endTime));
        }
        if (teamRegistrationForm.eventDate) {
          setEventDate(new Date(teamRegistrationForm.eventDate));
        }
        
        setError(null);
        setCanAccessForm(true);
      } catch (error) {
        console.error('Error checking form status:', error);
        setError('Unable to access the registration form at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkFormStatus();
  }, [navigate, user]);

  useEffect(() => {
    if (!formEndTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = formEndTime - now;
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [formEndTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index, value) => {
    const newTeamMembers = [...formData.teamMembers];
    newTeamMembers[index] = value;
    setFormData(prev => ({
      ...prev,
      teamMembers: newTeamMembers
    }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, '']
    }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        return;
      }

      // Validate form data before submission
      if (!formData.gameName || !formData.teamName || !formData.captainName || 
          !formData.mobileNumber || !formData.email || !formData.teamMembers.length) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate mobile number format
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobileNumber)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }

      const response = await axios.post(
        '/api/admin/forms/team-registrations',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate('/services');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token'); // Clear invalid token
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      } else if (error.response?.data?.details) {
        setError(error.response.data.details);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to submit form. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <FaExclamationCircle className="mx-auto text-red-500 text-5xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Form Access Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {(formNotStarted || formExpired) && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Form Availability:</h3>
                {formStartTime && (
                  <p className="text-sm text-gray-600">Start Time: {formStartTime.toLocaleString()}</p>
                )}
                {formEndTime && (
                  <p className="text-sm text-gray-600">End Time: {formEndTime.toLocaleString()}</p>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/services')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessForm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Team Registration Form</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register your team for upcoming sports tournaments
          </p>
          
          {/* Display form availability period and timer */}
          <div className="mt-6 space-y-4">
            {(formStartTime || formEndTime) && (
              <div className="p-4 bg-purple-50 rounded-lg inline-block">
                <p className="text-sm text-purple-700">
                  {formStartTime && formEndTime ? (
                    <>Available from <span className="font-semibold">{formStartTime.toLocaleDateString()}</span> to <span className="font-semibold">{formEndTime.toLocaleDateString()}</span></>
                  ) : formStartTime ? (
                    <>Available from <span className="font-semibold">{formStartTime.toLocaleDateString()}</span></>
                  ) : formEndTime ? (
                    <>Available until <span className="font-semibold">{formEndTime.toLocaleDateString()}</span></>
                  ) : null}
                </p>
              </div>
            )}

            {/* Timer Display */}
            {timeLeft && (
              <div className="p-4 bg-blue-50 rounded-lg inline-block">
                <div className="flex items-center justify-center space-x-4">
                  <FaClock className="text-blue-500 text-xl" />
                  <div className="text-center">
                    <p className="text-sm text-blue-700 mb-1">Time Remaining</p>
                    <div className="flex space-x-2">
                      {timeLeft.days > 0 && (
                        <div className="bg-blue-100 px-3 py-1 rounded">
                          <span className="font-bold text-blue-800">{timeLeft.days}</span>
                          <span className="text-xs text-blue-600 ml-1">days</span>
                        </div>
                      )}
                      <div className="bg-blue-100 px-3 py-1 rounded">
                        <span className="font-bold text-blue-800">{timeLeft.hours}</span>
                        <span className="text-xs text-blue-600 ml-1">hrs</span>
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded">
                        <span className="font-bold text-blue-800">{timeLeft.minutes}</span>
                        <span className="text-xs text-blue-600 ml-1">min</span>
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded">
                        <span className="font-bold text-blue-800">{timeLeft.seconds}</span>
                        <span className="text-xs text-blue-600 ml-1">sec</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Submitted Successfully!</h3>
                <p className="text-sm text-gray-500">
                  We will review your team registration and get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Team & Game Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team & Game Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Name *
                </label>
                <select
                  name="gameName"
                  value={formData.gameName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a game</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Kabaddi">Kabaddi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUsers className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Captain Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Captain Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Captain Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="captainName"
                    value={formData.captainName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
            <div className="space-y-4">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Member {index + 1} *
                    </label>
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="mt-6 p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
              >
                <FaPlus /> Add Team Member
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-center text-red-600">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TeamRegistration; 