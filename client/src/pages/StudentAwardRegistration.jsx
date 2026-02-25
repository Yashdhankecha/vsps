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
  FaFileUpload,
  FaGraduationCap,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUserAlt
} from 'react-icons/fa';
import { Card, Input, Button } from '../components';

const StudentAwardRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
        if (accessRes.data.hasSubmitted) {
          setHasSubmitted(true);
          setLoading(false);
          return;
        }
        if (!accessRes.data.canAccess) {
          setError('Registration is currently closed.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error checking form access:', err);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid flex items-center justify-center p-4">
        <div className="text-center p-12 glass-effect rounded-[2rem] border border-gray-100 shadow-xl">
          <FaSpinner className="animate-spin text-electric-500 text-5xl mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Application Form</h2>
          <p className="text-gray-600">Please wait while we load your secure session...</p>
        </div>
      </div>
    );
  }

  if (success || hasSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="max-w-xl w-full p-12 text-center relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-electric"></div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-500/20 border-2 border-green-500/30 mb-8 shadow-lg shadow-green-500/10">
            <FaCheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {success ? 'Application Submitted!' : 'Already Responded'}
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {success
              ? `Your application for the Student Saraswati Sanman has been successfully received. We will review your details and contact you shortly.`
              : `You have already submitted an application for the Student Saraswati Sanman. Our committee is currently reviewing its details.`}
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg"
            >
              Return to Home
            </Button>
            <Button
              onClick={() => navigate('/services')}
              variant="ghost"
              className="w-full py-4"
            >
              View More Services
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header Section */}
        <div className="mb-10 animate-fade-in-up">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center text-gray-500 hover:text-electric-500 transition-all mb-8 group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:border-electric-200"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-bold uppercase tracking-wider text-xs">Back to Registration Portal</span>
          </button>

          <header className="glass-effect rounded-[2.5rem] p-10 border border-gray-200 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-electric opacity-[0.05] rounded-bl-full pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-neon opacity-[0.03] rounded-tr-full pointer-events-none -ml-10 -mb-10"></div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center relative z-10 gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-5">
                  <div className="p-4 bg-gradient-electric rounded-2xl shadow-xl shadow-electric-500/20 mr-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <FaAward className="text-3xl text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    Student Saraswati <span className="text-electric-600">Sanman</span>
                  </h1>
                </div>
                <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
                  Honoring scholarly achievements and celebrating excellence in education. Submit your academic credentials for our annual recognition ceremony.
                </p>
              </div>

              {/* Status & Deadline Section */}
              <div className="flex flex-col items-end space-y-4 shrink-0">
                {timeLeft && timeLeft !== 'EXPIRED' && (
                  <div className="flex items-center space-x-3 bg-neon-500/10 px-6 py-3 rounded-2xl border border-neon-500/20 shadow-sm animate-pulse">
                    <FaClock className="text-neon-600 text-lg" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Registration Closes In</p>
                      <p className="text-neon-600 font-mono font-black text-lg">{timeLeft}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 bg-white/80 px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  <FaCalendarAlt className="text-electric-500 text-lg" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ceremony Date</p>
                    <p className="text-gray-900 font-bold">12th Aug, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>

        {error && (
          <div className="mb-10 animate-fade-in-up">
            <div className="glass-effect bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center text-red-600 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mr-5 shrink-0 border border-red-500/30">
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Attention Required</h4>
                <p className="font-medium text-red-500/80 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="animate-fade-in-up transition-all duration-700 delay-100">
          <Card className="rounded-[2.5rem] border-gray-200 shadow-2xl overflow-hidden p-0">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-electric-500 via-neon-500 to-electric-500 opacity-80"></div>

            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">

              {/* Section 1: Personality Check */}
              <section>
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-electric flex items-center justify-center mr-5 shadow-lg shadow-electric-500/10 transform rotate-3">
                    <FaUserAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Student Particulars</h3>
                    <p className="text-gray-400 text-sm font-medium">Personal identity and contact information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <Input
                    label="Student Name"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    placeholder="Candidate's First Name"
                    variant="dark"
                  />
                  <Input
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    placeholder="Legal Last Name"
                    variant="dark"
                  />
                  <Input
                    label="Father's Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    placeholder="Father's Full Name"
                    variant="dark"
                  />
                  <Input
                    label="Native Village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    placeholder="Place of Origin"
                    variant="dark"
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                    variant="dark"
                    placeholder="10-digit primary contact"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </div>
              </section>

              <div className="border-t border-gray-50"></div>

              {/* Section 2: Academic Achievements */}
              <section>
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-secondary flex items-center justify-center mr-5 shadow-lg shadow-secondary-500/20 transform -rotate-3">
                    <FaGraduationCap className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Milestone</h3>
                    <p className="text-gray-400 text-sm font-medium">Educational credentials and performance stats</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Standard</label>
                    <select
                      name="standard"
                      value={formData.standard}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 transition-all font-medium border border-gray-200 hover:border-gray-300"
                    >
                      <option value="">Select Category</option>
                      <option value="10th">10th SSC (Secondary)</option>
                      <option value="12th">12th HSC (Higher Secondary)</option>
                      <option value="Graduate">Bachelor's Degree (Graduate)</option>
                      <option value="Post-Graduate">Master's Degree (Post-Graduate)</option>
                    </select>
                  </div>
                  <Input
                    label="Percentage / Percentile"
                    type="number"
                    name="percentile"
                    value={formData.percentile}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 94.75"
                    variant="dark"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Institution / School Name"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                      placeholder="Full Name of School or University"
                      variant="dark"
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Credentials Verification (Markhseet/Result)</label>
                    <div className="relative group">
                      <input
                        id="markhseet-upload"
                        name="resultImage"
                        type="file"
                        className="sr-only"
                        onChange={handleChange}
                        required
                        accept="image/*,.pdf"
                      />
                      <label
                        htmlFor="markhseet-upload"
                        className="flex flex-col items-center justify-center px-10 py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-white hover:border-electric-500/50 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                          <FaFileUpload className="h-7 w-7 text-electric-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-1 group-hover:text-electric-600 transition-colors">
                          {formData.resultImage ? 'Change Selected File' : 'Choose Document'}
                        </p>
                        <p className="text-gray-400 text-sm font-medium mb-4">Click to browse or drag & drop</p>
                        <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                          PNG, JPG, PDF • MAX 5MB
                        </span>

                        {formData.resultImage && (
                          <div className="mt-8 flex items-center px-4 py-2 bg-green-50 rounded-xl border border-green-100 animate-fade-in-up">
                            <FaCheckCircle className="text-green-500 mr-3" />
                            <span className="text-green-700 font-bold text-sm truncate max-w-[200px]">
                              {formData.resultImage.name}
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Declaration Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 relative overflow-hidden group hover:border-electric-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-500/5 rounded-bl-full pointer-events-none group-hover:bg-electric-500/10 transition-colors"></div>
                <label className="flex items-start cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      required
                      className="peer h-6 w-6 rounded-lg border-gray-300 text-electric-500 focus:ring-electric-500 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="ml-5 text-sm sm:text-base text-gray-600 font-medium leading-relaxed select-none">
                    I verify that all information provided is accurate and authentic. I understand my application is subject to verification by the committee and any discrepancies may lead to withdrawal of the nomination.
                  </span>
                </label>
              </div>

              {/* Action Section */}
              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting || (formStatus.endTime && new Date(formStatus.endTime) < new Date())}
                  className={`w-full py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-electric-500/30 relative overflow-hidden group ${submitting ? 'opacity-70' : ''}`}
                >
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin text-2xl" />
                        <span>Processing Application...</span>
                      </>
                    ) : (
                      <>
                        <FaGraduationCap className="text-2xl group-hover:scale-125 transition-transform duration-300" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </div>
                  {/* Hover visual effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
                {timeLeft === 'EXPIRED' && (
                  <p className="text-center mt-4 text-red-500 font-bold text-sm">
                    Registration is currently closed as the timer has expired.
                  </p>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentAwardRegistration;

