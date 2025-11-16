import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EnvelopeIcon, 
  TrashIcon, 
  PaperAirplaneIcon,
  XMarkIcon,
  EyeIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

const Notification = ({ message, type, onClose }) => {
  const Icon = type === 'success' ? CheckCircleIconSolid : XCircleIconSolid;
  const colorClasses = type === 'success' 
    ? 'notification-success'
    : 'notification-error';
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-left">
      <div className={`notification max-w-sm p-4 ${colorClasses}`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-accent-100' : 'bg-red-100'
          }`}>
            <Icon className={`w-5 h-5 ${
              type === 'success' ? 'text-accent-600' : 'text-red-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const classes = status === 'replied' 
    ? 'px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30'
    : 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={classes}>{label}</span>
  );
};

const Avatar = ({ name, email }) => {
  const initial = name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : '?';
  const bgColor = email ? `hsl(${email.charCodeAt(0) % 360}, 70%, 80%)` : '#6B7280';
  
  return (
    <div className="flex items-center">
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
        style={{ backgroundColor: bgColor }}
      >
        {initial}
      </div>
      <div>
        <div className="font-medium text-white">{name || 'Unknown'}</div>
        <div className="text-xs text-neutral-400">{email}</div>
      </div>
    </div>
  );
};

const ContactCard = ({ contact, onView, onReply, onDelete, deletingId }) => {
  return (
    <div className="glass-effect border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex justify-between items-start">
        <Avatar name={contact.name} email={contact.email} />
        <StatusBadge status={contact.status} />
      </div>
      
      <div className="mt-3">
        <p className="text-neutral-300 text-sm line-clamp-2" title={contact.message}>
          {contact.message}
        </p>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-neutral-500">
          {new Date(contact.createdAt).toLocaleDateString()}
        </span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onView(contact)}
            className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-400/10 transition-colors"
            title="View details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onReply(contact)}
            className="p-2 text-green-400 hover:text-green-300 rounded-lg hover:bg-green-400/10 transition-colors"
            title="Reply"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(contact._id)}
            disabled={deletingId === contact._id}
            className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deletingId === contact._id ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {contact.reply && (
        <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
          <p className="text-xs text-neutral-400 mb-1">Reply:</p>
          <p className="text-sm text-white line-clamp-2" title={contact.reply}>
            {contact.reply}
          </p>
        </div>
      )}
    </div>
  );
};

const ViewModal = ({ open, onClose, contact }) => {
  if (!open || !contact) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-400" />
            Contact Details
          </h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-neutral-400 text-sm block mb-1">Name</label>
              <p className="text-white font-medium">{contact.name}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm block mb-1">Email</label>
              <p className="text-white font-medium">{contact.email}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm block mb-1">Phone</label>
              <p className="text-white font-medium">{contact.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm block mb-1">Status</label>
              <StatusBadge status={contact.status} />
            </div>
          </div>
          
          <div>
            <label className="text-neutral-400 text-sm block mb-1">Received</label>
            <p className="text-white">
              {new Date(contact.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="text-neutral-400 text-sm block mb-1">Message</label>
            <div className="mt-1 p-4 bg-neutral-800/50 rounded-lg border border-white/10">
              <p className="text-white whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>
          
          {contact.reply && (
            <div>
              <label className="text-neutral-400 text-sm block mb-1">Reply</label>
              <div className="mt-1 p-4 bg-neutral-800/50 rounded-lg border border-white/10">
                <p className="text-white whitespace-pre-wrap">{contact.reply}</p>
                <p className="text-neutral-400 text-xs mt-2">
                  Replied on: {new Date(contact.repliedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/10 sticky bottom-0 bg-neutral-900/80 backdrop-blur-sm">
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ReplyModal = ({ open, onClose, onSend, contact, isSending }) => {
  const [reply, setReply] = useState('');
  
  useEffect(() => {
    if (contact) {
      setReply(contact.reply || '');
    }
  }, [contact, open]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (reply.trim() && !isSending) {
      onSend(reply);
    }
  };
  
  if (!open || !contact) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <PaperAirplaneIcon className="h-5 w-5 mr-2 text-green-400" />
            Reply to {contact.name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-6 p-4 bg-neutral-800/50 rounded-lg border border-white/10">
              <p className="text-neutral-400 text-sm mb-2">Original Message:</p>
              <p className="text-white whitespace-pre-wrap">{contact.message}</p>
            </div>
            
            <div>
              <label className="text-neutral-300 text-sm block mb-2">Your Reply</label>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="input-field resize-none w-full min-h-[150px]"
                placeholder="Type your reply here..."
                disabled={isSending}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/10 sticky bottom-0 bg-neutral-900/80 backdrop-blur-sm">
            <button 
              type="button"
              onClick={onClose} 
              className="btn-secondary"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={!reply.trim() || isSending}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span>Send Reply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { 
    fetchContacts(); 
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification({ message: '', type: '' });
  };

  const fetchContacts = async () => {
    try {
      const res = await axiosInstance.get('/api/contacts');
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]); // Set to empty array on error
      showNotification('Failed to fetch contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setViewModalOpen(true);
  };

  const handleReply = (contact) => {
    setSelectedContact(contact);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (reply) => {
    if (!selectedContact || !reply.trim()) return;
    
    setSendingReply(true);
    
    try {
      const response = await axiosInstance.post(
        `/api/contacts/${selectedContact._id}/reply`, 
        { reply }
      );
      
      showNotification(response.data.message || 'Reply sent successfully', 'success');
      setReplyModalOpen(false);
      fetchContacts();
    } catch (err) {
      console.error('Error sending reply:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send reply';
      showNotification(errorMessage, 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;
    
    setDeletingId(id);
    
    try {
      await axiosInstance.delete(`/api/contacts/${id}`);
      showNotification('Contact deleted successfully', 'success');
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete contact';
      showNotification(errorMessage, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredContacts = Array.isArray(contacts) ? contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
        <div className="card-glass animate-fade-in-up">
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Contact Management</h1>
            </div>
            <p className="text-neutral-300 text-lg">View, reply to, and manage user contact messages</p>
          </div>
          
          <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10 animate-fade-in-up">
            <div className="py-12 text-center">
              <div className="relative">
                <div className="w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
                </div>
              </div>
              <p className="text-neutral-300">Loading contacts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      <div className="card-glass animate-fade-in-up">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-electric rounded-xl flex items-center justify-center shadow-lg">
              <EnvelopeIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Contact Management</h1>
          </div>
          <p className="text-neutral-300 text-lg">View, reply to, and manage user contact messages</p>
        </div>
        
        {/* Notifications */}
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
        
        {/* Filters and Search */}
        <div className="glass-effect rounded-xl shadow-lg p-4 border border-white/10 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search contacts..."
                className="input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="input-field w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-effect border border-white/10 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-400">Total Messages</p>
                <p className="text-xl font-bold text-white">{Array.isArray(contacts) ? contacts.length : 0}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect border border-white/10 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <ArrowsRightLeftIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-400">Pending</p>
                <p className="text-xl font-bold text-white">
                  {Array.isArray(contacts) ? contacts.filter(c => c.status === 'pending').length : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect border border-white/10 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-400">Replied</p>
                <p className="text-xl font-bold text-white">
                  {Array.isArray(contacts) ? contacts.filter(c => c.status === 'replied').length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10">
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center">
              <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-neutral-500" />
              <h3 className="text-lg font-medium text-white mb-1">No contacts found</h3>
              <p className="text-neutral-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No contacts match your search criteria' 
                  : 'No contact messages found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact._id}
                  contact={contact}
                  onView={handleView}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        contact={selectedContact}
      />
      
      <ReplyModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        onSend={handleSendReply}
        contact={selectedContact}
        isSending={sendingReply}
      />
    </div>
  );
};

export default ContactManagement;