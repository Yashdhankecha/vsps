import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  CalendarDaysIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const BookVillageEvent = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    eventType: 'wedding',
    date: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    isSamajMember: false,
    additionalNotes: ''
  });

  useEffect(() => {
    fetchVillageMembers();
  }, []);

  const fetchVillageMembers = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch members from the backend
      // For now, we'll use mock data
      const mockMembers = [
        { _id: '1', username: 'Ramesh Kumar', email: 'ramesh@example.com', phone: '9876543210' },
        { _id: '2', username: 'Sita Devi', email: 'sita@example.com', phone: '9876543211' },
        { _id: '3', username: 'Krishna Patel', email: 'krishna@example.com', phone: '9876543212' }
      ];
      setMembers(mockMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load village members');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMemberChange = (e) => {
    const memberId = e.target.value;
    setFormData({
      ...formData,
      memberId
    });

    // Auto-fill member details
    if (memberId) {
      const member = members.find(m => m._id === memberId);
      if (member) {
        setFormData(prev => ({
          ...prev,
          firstName: member.username.split(' ')[0] || '',
          surname: member.username.split(' ').slice(1).join(' ') || '',
          email: member.email,
          phone: member.phone
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.memberId || !formData.eventType || !formData.date ||
        !formData.startTime || !formData.endTime || !formData.guestCount) {
        throw new Error('All required fields must be filled');
      }

      const requestData = {
        ...formData,
        guestCount: parseInt(formData.guestCount)
      };

      // In a real implementation, you would send this to the backend
      // const response = await axiosInstance.post('/api/committee/bookings', requestData);

      // Simulate successful booking
      setSuccess('Event booked successfully!');

      // Reset form
      setFormData({
        memberId: '',
        eventType: 'wedding',
        date: '',
        startTime: '',
        endTime: '',
        guestCount: '',
        firstName: '',
        surname: '',
        email: '',
        phone: '',
        isSamajMember: false,
        additionalNotes: ''
      });
    } catch (err) {
      console.error('Error booking event:', err);
      setError(err.response?.data?.message || err.message || 'Failed to book event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-4 sm:p-8">
      <div className="card-glass animate-fade-in-up max-w-7xl mx-auto p-6 sm:p-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg neon-glow">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Book Village Event</h1>
              <p className="text-neutral-300 text-sm sm:text-base">
                Schedule an event for a village member
              </p>
              {user?.village && (
                <p className="text-electric-300 text-sm font-medium mt-1">
                  Village: {user.village}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-effect border border-red-500/30 bg-red-500/10 text-red-300 px-6 py-4 rounded-xl mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="glass-effect border border-neon-500/30 bg-neon-500/10 text-neon-300 px-6 py-4 rounded-xl mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-neon-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Book Event Form */}
        <div className="card-glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Member */}
              <div className="md:col-span-2">
                <label className="form-label flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Select Member</span>
                </label>
                <select
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleMemberChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a village member</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.username} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>Event Type</span>
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="community">Community Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>Event Date</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>Start Time</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>End Time</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Guest Count</span>
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              {/* Samaj Member */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="isSamajMember"
                  checked={formData.isSamajMember}
                  onChange={handleChange}
                  className="w-4 h-4 text-electric-500 bg-neutral-700 border-neutral-600 rounded focus:ring-electric-500"
                />
                <label className="ml-2 text-sm font-medium text-neutral-300">
                  Is Samaj Member
                </label>
              </div>

              {/* First Name */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Surname */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Surname</span>
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter surname"
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="form-label flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter 10 digit phone number"
                  maxLength="10"
                  pattern="\d{10}"
                  title="Phone number must be exactly 10 digits"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  }}
                />
              </div>

              {/* Additional Notes */}
              <div className="md:col-span-2">
                <label className="form-label flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  <span>Additional Notes</span>
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Any additional information about the event..."
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Booking Event...</span>
                  </>
                ) : (
                  <>
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Book Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="card-glass mt-8 animate-fade-in-up p-6 sm:p-8" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>Select a village member from the dropdown to book an event for them</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>Member details will auto-fill once you select a member</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>You can only book events for members in your assigned village</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-electric-400 mt-1">•</span>
              <span>All required fields must be filled before submitting</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookVillageEvent;