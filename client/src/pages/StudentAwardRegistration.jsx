import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaSchool, FaGraduationCap, FaTrophy, FaFileUpload, FaCheck, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';


const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const StudentAwardRegistration = () => {
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

  useEffect(() => {
    const checkFormStatus = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!user) {
          setError('You need to be logged in to access this form. Please log in and try again.');
          navigate('/auth');
          return;
        }
        
        // Get the authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          navigate('/auth');
          return;
        }
        
        
        const visibilityResponse = await axios.get(`${API_BASE_URL}/api/admin/forms/check-form-visibility/studentAwardForm`);
        
        
        if (!visibilityResponse.data.visible) {
          setError('This form is not currently available. Please check back later.');
          return;
        }
        
      
        try {
          const accessResponse = await axios.get(
            `${API_BASE_URL}/api/admin/forms/can-access-form/studentAwardForm`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
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
          
          
          setError(null);
          setCanAccessForm(true);
        } catch (accessError) {
          console.error('Error checking form access:', accessError);
          
          
          if (accessError.response && accessError.response.status === 401) {
            setError('Your session has expired. Please log in again.');
            navigate('/auth');
            return;
          }
          
          
          setError('Unable to verify form access. Please try again later.');
          return;
        }
        
        
        const publicStatusResponse = await axios.get(`${API_BASE_URL}/api/admin/forms/public/status`);
        const studentAwardForm = publicStatusResponse.data.studentAwards;
        
        
        if (studentAwardForm.startTime) {
          setFormStartTime(new Date(studentAwardForm.startTime));
        }
        if (studentAwardForm.endTime) {
          setFormEndTime(new Date(studentAwardForm.endTime));
        }
        if (studentAwardForm.eventDate) {
          setEventDate(new Date(studentAwardForm.eventDate));
        }
        
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

  const [formData, setFormData] = useState({
    // Section A: Student Information
    fullName: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
    
    // Section B: Academic Details
    schoolName: '',
    standard: '',
    boardName: '',
    examYear: '',
    totalPercentage: '',
    rank: 'none',
    marksheet: null,
    
    // Section C: Declaration
    declaration: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      
      formDataToSend.append('name', formData.fullName);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('schoolName', formData.schoolName);
      formDataToSend.append('standard', formData.standard);
      formDataToSend.append('boardName', formData.boardName);
      formDataToSend.append('examYear', formData.examYear);
      formDataToSend.append('totalPercentage', formData.totalPercentage);
      
    
      const rankValue = formData.rank === 'none' ? 'none' : 
        formData.rank === '1st' ? '1st' :
        formData.rank === '2nd' ? '2nd' :
        formData.rank === '3rd' ? '3rd' : 'none';
      formDataToSend.append('rank', rankValue);

      
      if (formData.marksheet) {
        formDataToSend.append('marksheet', formData.marksheet);
      }

      
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID not found. Please try logging in again.');
      }
      formDataToSend.append('user', userId);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to submit the form');
      }

      
      console.log('Submitting form data:', {
        name: formData.fullName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        schoolName: formData.schoolName,
        standard: formData.standard,
        boardName: formData.boardName,
        examYear: formData.examYear,
        totalPercentage: formData.totalPercentage,
        rank: rankValue,
        userId: userId
      });

      const response = await axios.post(`${API_BASE_URL}/api/bookings/student-awards/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setShowSuccessPopup(true);
        setFormData({
          fullName: '',
          dateOfBirth: '',
          contactNumber: '',
          email: '',
          address: '',
          schoolName: '',
          standard: '',
          boardName: '',
          examYear: '',
          totalPercentage: '',
          rank: 'none',
          marksheet: null,
          declaration: false
        });

        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/services');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Award Registration Form</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            For Students Scoring ≥85% or Securing Rank 1, 2, or 3
          </p>
          <p className="text-md text-gray-500 mt-2">
            Wadi (Samaj) proudly honors meritorious students for their academic excellence.
          </p>
          
          {/* Display form availability period and timer */}
          <div className="mt-4 space-y-2">
            {(formStartTime || formEndTime) && (
              <div className="p-3 bg-purple-50 rounded-lg inline-block">
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
              <div className="p-3 bg-blue-50 rounded-lg inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <FaClock className="text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Time remaining: <span className="font-semibold">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Event Date Display */}
            {eventDate && (
              <div className="p-3 bg-green-50 rounded-lg inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <FaCalendarAlt className="text-green-500" />
                  <p className="text-sm text-green-700">
                    Award Ceremony Date: <span className="font-semibold">{eventDate.toLocaleDateString()}</span>
                  </p>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted Successfully!</h3>
                <p className="text-sm text-gray-500">
                  We will review your application and get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Section A: Student Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section A: Student Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Academic Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section B: Academic Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School/College Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSchool className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard/Grade *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board/University Name *
                </label>
                <input
                  type="text"
                  name="boardName"
                  value={formData.boardName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Year *
                </label>
                <input
                  type="number"
                  name="examYear"
                  value={formData.examYear}
                  onChange={handleChange}
                  min="2000"
                  max="2100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Percentage *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTrophy className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="totalPercentage"
                    value={formData.totalPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank (if applicable)
                </label>
                <select
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Marksheet (PDF/Image) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFileUpload className="text-gray-400" />
                  </div>
                  <input
                    type="file"
                    name="marksheet"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Declaration */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section C: Declaration</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                I hereby declare that the information provided above is true and correct to the best of my knowledge. 
                I understand that the final verification will be done by the Wadi (Samaj) committee before the award is granted.
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
              />
              <label className="ml-2 block text-sm text-gray-700">
                I agree
              </label>
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
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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

export default StudentAwardRegistration; 