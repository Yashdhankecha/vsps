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
import { Card, Input, Button } from '../../components';

const FormManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [forms, setForms] = useState({
    samuhLagan: { active: false, startTime: null, endTime: null, lastUpdated: null },
    studentAwards: { active: false, startTime: null, endTime: null, lastUpdated: null }
  });
  const [formData, setFormData] = useState({
    formName: 'samuhLagan',
    startTime: '',
    endTime: '',
    eventDate: ''
  });

  useEffect(() => {
    const adminRoles = ['admin', 'superadmin', 'formmanager'];
    if (user && adminRoles.includes(user.role)) {
      fetchFormStatus();
      const intervalId = setInterval(fetchFormStatus, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const fetchFormStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axiosInstance.get('/api/admin/forms/status');

      if (response.data) {
        const updatedForms = {
          samuhLagan: { active: false, startTime: null, endTime: null, lastUpdated: null },
          studentAwards: { active: false, startTime: null, endTime: null, lastUpdated: null },
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const eventDate = new Date(formData.eventDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }

      if (endDate <= startDate) throw new Error('End time must be after start time');
      if (eventDate < new Date()) throw new Error('Event date cannot be in the past');

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
        setForms(prev => ({
          ...prev,
          [formData.formName]: response.data[formData.formName]
        }));

        setSuccess(`Successfully set timer for ${formData.formName === 'samuhLagan' ? 'Samuh Lagan' : 'Student Awards'} Registration Form`);
        setFormData({
          formName: 'samuhLagan',
          startTime: '',
          endTime: '',
          eventDate: ''
        });
      }
    } catch (err) {
      console.error('Error setting form timer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to set form timer.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getFormStatus = (form) => {
    if (!form || !form.active) return { text: 'Inactive', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
    const now = new Date();
    const end = new Date(form.endTime);
    const start = new Date(form.startTime);

    if (now > end) return { text: 'Timer Expired', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    if (now >= start && now <= end) return { text: 'Active', color: 'text-neon-700', bg: 'bg-neon-50', border: 'border-neon-100' };
    if (start > now) return { text: 'Scheduled', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' };
    
    return { text: 'Active', color: 'text-neon-700', bg: 'bg-neon-50', border: 'border-neon-100' };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid p-4 sm:p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  const adminRoles = ['admin', 'superadmin', 'formmanager'];
  if (!user || !adminRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-electric rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <CogIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Form Management</h1>
              <p className="text-gray-500 font-medium">Configure registration form timers</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={fetchFormStatus}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center text-red-600 animate-fade-in-up">
            <ExclamationTriangleIconSolid className="w-5 h-5 mr-3 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-neon-500/10 border border-neon-500/20 flex items-center text-neon-600 animate-fade-in-up">
            <CheckCircleIconSolid className="w-5 h-5 mr-3 shrink-0" />
            <p className="font-bold">{success}</p>
          </div>
        )}

        {/* Form Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Object.entries({
            samuhLagan: 'Samuh Lagan Registration',
            studentAwards: 'Student Awards Registration'
          }).map(([key, label]) => {
            const status = getFormStatus(forms[key]);
            return (
              <Card key={key} className="p-8 relative overflow-hidden group border-gray-100">
                <div className={`absolute top-0 right-0 w-24 h-24 ${key === 'samuhLagan' ? 'bg-gradient-electric' : 'bg-gradient-secondary'} opacity-[0.03] rounded-bl-full`}></div>
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">{label}</h3>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: CalendarIcon, label: 'Event Date', value: formatDate(forms[key]?.eventDate), color: 'text-neon-600' },
                    { icon: ClockIcon, label: 'Opens At', value: formatDateTime(forms[key]?.startTime), color: 'text-electric-600' },
                    { icon: ClockIcon, label: 'Closes At', value: formatDateTime(forms[key]?.endTime), color: 'text-sunset-600' }
                  ].map((field, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                      <field.icon className={`w-5 h-5 mr-4 ${field.color}`} />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{field.label}</p>
                        <p className="text-sm font-bold text-gray-700">{field.value}</p>
                      </div>
                    </div>
                  ))}
                  {!forms[key]?.startTime && (
                    <div className="py-4 text-center italic text-gray-400 text-sm">
                      No schedule configuration set
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Timer Settings Card */}
        <Card className="p-0 overflow-hidden shadow-2xl border-gray-200">
          <div className="h-2 bg-gradient-to-r from-electric-500 via-neon-500 to-electric-500 opacity-80"></div>
          <div className="p-8 sm:p-10">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-gradient-electric rounded-2xl flex items-center justify-center shadow-lg transform -rotate-2">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Set Form Timer</h2>
                <p className="text-gray-500 font-medium">Configure availability for registrations</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Registration Type</label>
                  <select
                    name="formName"
                    value={formData.formName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-4 focus:ring-electric-500/10 focus:border-electric-500 block p-4 shadow-sm appearance-none font-bold"
                  >
                    <option value="samuhLagan">Samuh Lagan Registration</option>
                    <option value="studentAwards">Student Awards Registration</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Scheduled Event Date"
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                    variant="dark"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Registration Opens At"
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    variant="dark"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Registration Closes At"
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    variant="dark"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center text-sm text-gray-500 font-medium">
                  <ExclamationCircleIcon className="w-5 h-5 mr-3 text-electric-400" />
                  Updating the timer affects public form availability immediately.
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full sm:w-auto px-12 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-electric-500/20"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Initialize Timer</span>
                      <ClockIcon className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FormManagement;


