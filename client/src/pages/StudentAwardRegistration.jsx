import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaAward,
  FaSchool,
  FaFileUpload
} from 'react-icons/fa';

const StudentAwardRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form Status State
  const [formStatus, setFormStatus] = useState({
    active: false,
    startTime: null,
    endTime: null,
    message: ''
  });

  // Time remaining state
  const [timeLeft, setTimeLeft] = useState('');

  // Form Data State
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    surname: '',
    standard: '',
    percentile: '',
    village: '',
    mobileNumber: '',
    schoolName: '',
    schoolAddress: '',
    resultImage: null
  });

  useEffect(() => {
    checkFormAccess();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkFormAccess = async () => {
    try {
      // Check authentication
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check form visibility and status
      const statusRes = await axios.get('/api/admin/forms/public/status');
      const status = statusRes.data.studentAwards;

      if (!status || !status.active) {
        setError('Registration is currently closed.');
        setLoading(false);
        return;
      }

      setFormStatus(status);

      // Check if user has already submitted
      try {
        const accessRes = await axios.get('/api/admin/forms/can-access-form/studentAwardForm');
        if (!accessRes.data.canAccess) {
          setError('You have already submitted this form.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error checking form access:', err);
        // Don't block if just checking access fails, backend will block submission anyway.
      }

      // Pre-fill user data
      setFormData(prev => ({
        ...prev,
        studentName: user.username || '',
        mobileNumber: user.phone || '',
        village: user.village || ''
      }));

      setLoading(false);
    } catch (err) {
      console.error('Error in checkFormAccess:', err);
      setError('Failed to load form. Please try again later.');
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (!formStatus.endTime) return;

    const now = new Date().getTime();
    const end = new Date(formStatus.endTime).getTime();
    const distance = end - now;

    if (distance < 0) {
      setTimeLeft('EXPIRED');
      if (!error && !success) setError('Registration has closed.');
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resultImage') {
      setFormData(prev => ({ ...prev, resultImage: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (formData.mobileNumber.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.post('/api/bookings/student-awards/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-electric-500 text-4xl mx-auto mb-4" />
          <p className="text-neutral-300">Loading form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-mesh py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full glass-effect p-8 rounded-2xl border border-white/10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-electric"></div>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
            <FaCheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
          <p className="text-neutral-300 mb-8">
            Your application for the Student Saraswati Sanman has been successfully received. We will review your details and contact you shortly.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full btn-ghost"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/services')}
          className="flex items-center text-neutral-400 hover:text-white transition-colors mb-6 group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </button>

        {/* Header */}
        <div className="glass-effect rounded-2xl p-8 mb-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-electric opacity-10 rounded-bl-full pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <div>
              <div className="flex items-center mb-3">
                <div className="p-3 bg-gradient-electric rounded-lg shadow-lg shadow-electric-500/20 mr-4">
                  <FaAward className="text-2xl text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Student Saraswati Sanman</h1>
              </div>
              <p className="text-neutral-300 text-lg max-w-2xl">
                Celebrating academic excellence. Register now to be recognized for your outstanding achievements.
              </p>
            </div>

            {/* Timer & Date */}
            <div className="mt-6 md:mt-0 flex flex-col items-end space-y-3">
              {timeLeft && timeLeft !== 'EXPIRED' && (
                <div className="flex items-center space-x-2 bg-electric-500/10 px-4 py-2 rounded-full border border-electric-500/20">
                  <FaClock className="text-electric-400" />
                  <span className="text-electric-300 font-mono font-medium">{timeLeft} left</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-neutral-400 text-sm">
                <FaCalendarAlt />
                <span>Event Date: 12th Aug, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 glass-effect bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-200">
            <FaExclamationTriangle className="mr-3 text-xl flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="glass-effect rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-electric-500 via-purple-500 to-electric-500 opacity-50"></div>
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

            {/* Student Details Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-electric flex items-center justify-center mr-4 shadow-lg shadow-electric-500/20">
                  <FaUserGraduate className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">Student Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="form-label">Surname</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <label className="form-label">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Father's Full Name"
                  />
                </div>
                <div>
                  <label className="form-label">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Native Village"
                  />
                </div>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                    className="input-field"
                    placeholder="10-digit Mobile Number"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 my-8"></div>

            {/* Academic Details Section */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center mr-4 shadow-lg shadow-secondary-500/20">
                  <FaSchool className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">Academic Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Standard/Grade</label>
                  <select
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    required
                    className="input-field bg-neutral-800/50"
                  >
                    <option value="" className="bg-neutral-800 text-neutral-400">Select Standard</option>
                    <option value="10th" className="bg-neutral-800">10th SSC</option>
                    <option value="12th" className="bg-neutral-800">12th HSC</option>
                    <option value="Graduate" className="bg-neutral-800">Graduate</option>
                    <option value="Post-Graduate" className="bg-neutral-800">Post-Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Percentage/Percentile</label>
                  <input
                    type="number"
                    name="percentile"
                    value={formData.percentile}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className="input-field"
                    placeholder="e.g. 85.50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">School/College Name</label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Full Name of Institution"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Upload Result/Markhseet</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-xl hover:border-electric-500/50 transition-colors bg-neutral-800/30">
                    <div className="space-y-1 text-center">
                      <FaFileUpload className="mx-auto h-12 w-12 text-neutral-400" />
                      <div className="flex text-sm text-neutral-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-electric-400 hover:text-electric-300 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="resultImage" type="file" className="sr-only" onChange={handleChange} required accept="image/*,.pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-neutral-500">
                        PNG, JPG, PDF up to 5MB
                      </p>
                      {formData.resultImage && (
                        <p className="text-sm text-green-400 font-medium mt-2">
                          Selected: {formData.resultImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-white/5 p-6 rounded-xl mb-6 border border-white/10">
              <label className="flex items-start">
                <input type="checkbox" required className="mt-1 mr-3 h-4 w-4 rounded border-white/30 text-electric-500 focus:ring-electric-500 bg-neutral-700" />
                <span className="text-sm text-neutral-300 leading-relaxed">
                  I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that providing false information will result in disqualification.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || (formStatus.endTime && new Date(formStatus.endTime) < new Date())}
              className={`w-full btn-primary py-4 text-lg shadow-lg shadow-electric-500/25 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" /> Submitting...
                </span>
              ) : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentAwardRegistration;
