import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid';
import axiosInstance from '../../utils/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Button, Input } from '../../components';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in-right border ${type === 'success'
      ? 'bg-neon-500/10 border-neon-500/20 text-neon-600'
      : 'bg-red-500/10 border-red-500/20 text-red-600'
      }`}>
      {type === 'success' ? <CheckCircleIconSolid className="w-5 h-5" /> : <XCircleIconSolid className="w-5 h-5" />}
      <p className="font-bold">{message}</p>
    </div>
  );
};

const RejectionModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-8 shadow-2xl border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Booking</h3>
        <p className="text-gray-500 text-sm mb-6">Explain why this booking is being rejected.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection..."
          className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-gray-700 mb-6"
        />
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(reason)}
            className="flex-1 bg-red-600 hover:bg-red-700 shadow-red-500/20"
            disabled={!reason.trim()}
          >
            Confirm Reject
          </Button>
        </div>
      </Card>
    </div>
  );
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionBookingId, setRejectionBookingId] = useState(null);

  const [loadingActions, setLoadingActions] = useState({
    approve: {},
    reject: {},
    confirm: {},
    delete: {},
    view: {}
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/bookings');
      const data = Array.isArray(response.data) ? response.data :
        Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load event bookings');
    } finally {
      setLoading(false);
    }
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleApprove = async (id) => {
    try {
      setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: true } }));
      await axiosInstance.put(`/api/bookings/approve/${id}`);
      showNotify('Booking approved successfully');
      fetchBookings();
    } catch (err) {
      showNotify('Approval failed', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: false } }));
    }
  };

  const handleReject = async (id) => {
    setRejectionBookingId(id);
    setShowRejectionModal(true);
  };

  const handleRejectionSubmit = async (reason) => {
    try {
      setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [rejectionBookingId]: true } }));
      await axiosInstance.put(`/api/bookings/reject/${rejectionBookingId}`, {
        bookingId: rejectionBookingId,
        rejectionReason: reason
      });
      showNotify('Booking rejected');
      fetchBookings();
    } catch (err) {
      showNotify('Rejection failed', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [rejectionBookingId]: false } }));
      setShowRejectionModal(false);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: true } }));
      await axiosInstance.put(`/api/bookings/confirm-booking/${id}`);
      showNotify('Booking confirmed and finalized');
      fetchBookings();
    } catch (err) {
      showNotify('Confirmation failed', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: false } }));
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking permanentally?')) return;
    try {
      setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [id]: true } }));
      await axiosInstance.delete(`/api/bookings/${id}`);
      showNotify('Booking deleted');
      fetchBookings();
    } catch (err) {
      showNotify('Deletion failed', 'error');
    } finally {
      setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [id]: false } }));
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Event Bookings Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    const columns = ['Customer', 'Event Type', 'Date', 'Amount', 'Status'];
    const rows = bookings.map(b => [
      `${b.firstName} ${b.surname}`,
      b.eventType,
      new Date(b.date).toLocaleDateString(),
      `₹${b.amount || 0}`,
      b.status
    ]);

    autoTable(doc, {
      startY: 35,
      head: [columns],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`bookings-report-${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

        {showRejectionModal && (
          <RejectionModal
            onClose={() => setShowRejectionModal(false)}
            onSubmit={handleRejectionSubmit}
          />
        )}

        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-electric rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Booking Management</h1>
              <p className="text-gray-500 font-medium">Manage event hall and service bookings</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={fetchBookings} className="flex items-center space-x-2">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button variant="primary" onClick={generatePDF} className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Global Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-gray-900', icon: ClipboardDocumentCheckIcon },
            { label: 'Pending Approval', value: bookings.filter(b => b.status === 'Pending').length, color: 'text-orange-600', icon: CalendarIcon },
            { label: 'Confirmed Events', value: bookings.filter(b => b.status === 'Booked').length, color: 'text-neon-600', icon: CheckIcon }
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100`}>
                  <stat.icon className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-10">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Event & Date</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium">
                    No active bookings found in records
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                          {booking.firstName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{booking.firstName} {booking.surname}</p>
                          <p className="text-xs text-gray-500 font-medium">{booking.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-700">{booking.eventType}</p>
                      <p className="text-[10px] font-black text-electric-500 uppercase tracking-widest">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'Booked' ? 'bg-neon-50 text-neon-700 border-neon-100' :
                        booking.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          booking.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="p-2.5 rounded-xl bg-neon-500 text-white shadow-lg shadow-neon-500/20 hover:scale-110 transition-transform"
                              disabled={loadingActions.approve[booking._id]}
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(booking._id)}
                              className="p-2.5 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                              disabled={loadingActions.reject[booking._id]}
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'Approved' && (
                          <Button onClick={() => handleConfirmBooking(booking._id)} variant="primary" className="py-2 text-xs">
                            Confirm Final
                          </Button>
                        )}
                        <button onClick={() => handleDelete(booking._id)} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-300 hover:text-red-500 transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default BookingManagement;