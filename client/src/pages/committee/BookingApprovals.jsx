import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const BookingApprovals = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, eventTypeFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings');
      const bookingsData = response.data || [];
      
      // Sort by creation date (newest first)
      const sortedBookings = bookingsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setBookings(sortedBookings);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        (booking.firstName && booking.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.surname && booking.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.name && booking.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.eventType && booking.eventType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.eventType === eventTypeFilter);
    }

    setFilteredBookings(filtered);
  };

  const getUniqueEventTypes = () => {
    const types = [...new Set(bookings.map(b => b.eventType).filter(Boolean))];
    return types;
  };

  const handleApproval = async (bookingId, action, reason = '') => {
    try {
      setActionLoading(true);
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      
      await axios.patch(`/api/bookings/${bookingId}`, {
        status: newStatus,
        rejectionReason: action === 'reject' ? reason : undefined,
        reviewedBy: 'Committee Member', // This should ideally come from the auth context
        reviewedAt: new Date()
      });

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus, rejectionReason: reason }
          : booking
      ));

      setShowModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Booked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'border-red-500';
    if (diffDays <= 30) return 'border-yellow-500';
    return 'border-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Approvals</h1>
        <p className="text-gray-600">Review and approve community booking requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Booked">Booked</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Event Types</option>
            {getUniqueEventTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {filteredBookings.length}</span>
            <span>Pending: {filteredBookings.filter(b => b.status === 'Pending').length}</span>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${getPriorityColor(booking.date)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.firstName && booking.surname 
                          ? `${booking.firstName} ${booking.surname}` 
                          : booking.name || 'Unknown Customer'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {booking.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(booking._id, 'approve')}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowModal(true);
                            }}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {booking.eventType || 'Not specified'}
                      </span>
                    </div>
                    
                    {booking.amount && (
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          ₹{booking.amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{booking.email}</span>
                    {booking.phone && <span>{booking.phone}</span>}
                  </div>

                  {/* Special Notes */}
                  {booking.specialRequirements && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Special Requirements:</strong> {booking.specialRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || eventTypeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No booking requests available for review.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal for booking details and rejection */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Booking Information */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="text-gray-900">
                      {selectedBooking.firstName && selectedBooking.surname 
                        ? `${selectedBooking.firstName} ${selectedBooking.surname}` 
                        : selectedBooking.name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <p className="text-gray-900">{selectedBooking.eventType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedBooking.phone || 'Not provided'}</p>
                  </div>
                </div>

                {selectedBooking.specialRequirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedBooking.specialRequirements}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'Pending' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleApproval(selectedBooking._id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Booking'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleApproval(selectedBooking._id, 'reject', reason);
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Reject Booking'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingApprovals;