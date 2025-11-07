import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EnvelopeIcon, 
  TrashIcon, 
  PaperAirplaneIcon,
  XMarkIcon,
  EyeIcon
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
    ? 'px-3 py-1 rounded-full text-xs font-semibold bg-neon-500/20 text-neon-300 border border-neon-500/30'
    : 'px-3 py-1 rounded-full text-xs font-semibold bg-sunset-500/20 text-sunset-300 border border-sunset-500/30';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={classes}>{label}</span>
  );
};

const Avatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-electric-500/20 text-electric-300 font-bold mr-3 border border-electric-500/30">
      {initial}
    </span>
  );
};

const ViewModal = ({ open, onClose, contact }) => {
  if (!open || !contact) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <EyeIcon className="h-6 w-6 mr-2 text-electric-400" />
            Contact Details
          </h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-400 text-sm">Name</label>
              <p className="text-white font-medium">{contact.name}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm">Email</label>
              <p className="text-white font-medium">{contact.email}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm">Phone</label>
              <p className="text-white font-medium">{contact.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-neutral-400 text-sm">Status</label>
              <StatusBadge status={contact.status} />
            </div>
          </div>
          
          <div>
            <label className="text-neutral-400 text-sm">Message</label>
            <div className="mt-1 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
              <p className="text-white">{contact.message}</p>
            </div>
          </div>
          
          {contact.reply && (
            <div>
              <label className="text-neutral-400 text-sm">Reply</label>
              <div className="mt-1 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
                <p className="text-white">{contact.reply}</p>
                <p className="text-neutral-400 text-xs mt-2">
                  Replied on: {new Date(contact.repliedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          <div className="text-neutral-400 text-sm">
            Received: {new Date(contact.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/10">
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

const ReplyModal = ({ open, onClose, onSend, contact }) => {
  const [reply, setReply] = useState('');
  useEffect(() => { 
    setReply(contact?.reply || ''); 
  }, [contact]);
  
  if (!open || !contact) return null;
  
  const handleSend = () => {
    console.log('Send button clicked with reply:', reply);
    onSend(reply);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <EnvelopeIcon className="h-6 w-6 mr-2 text-electric-400" />
            Reply to {contact.name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
            <p className="text-neutral-400 text-sm mb-1">Original Message:</p>
            <p className="text-white">{contact.message}</p>
          </div>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            className="input-field resize-none w-full"
            rows="6"
            placeholder="Type your reply..."
          />
        </div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-white/10">
          <button 
            onClick={onClose} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="btn-primary flex items-center space-x-2"
            disabled={!reply.trim()}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>Send Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/contacts');
      setContacts(res.data || []);
    } catch (err) {
      setNotification({ message: 'Failed to fetch contacts', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setViewModalOpen(true);
  };

  const handleReply = (contact) => {
    console.log('Handle reply clicked for contact:', contact);
    setSelectedContact(contact);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (reply) => {
    console.log('Handle send reply called with:', { reply, selectedContact });
    
    if (!selectedContact) {
      console.error('No selected contact');
      setNotification({ message: 'No contact selected', type: 'error' });
      return;
    }
    
    if (!reply || reply.trim() === '') {
      console.error('No reply content');
      setNotification({ message: 'Reply content is required', type: 'error' });
      return;
    }
    
    try {
      console.log('Sending reply:', reply);
      console.log('Contact ID:', selectedContact._id);
      
      // Send the reply request with a shorter timeout
      const response = await axiosInstance.post(
        `/api/contacts/${selectedContact._id}/reply`, 
        { reply },
        { timeout: 5000 } // 5 second timeout
      );
      
      console.log('Reply response:', response.data);
      
      setNotification({ message: response.data.message || 'Reply saved successfully', type: 'success' });
      setReplyModalOpen(false);
      fetchContacts();
    } catch (err) {
      console.error('Error sending reply:', err);
      console.error('Error response:', err.response);
      
      // Handle different types of errors
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        // Timeout likely means the server is processing but taking time
        // In our case, this should mean the reply was saved successfully
        setNotification({ 
          message: 'Reply request timed out but should be saved. Refreshing list...', 
          type: 'success' 
        });
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setNotification({ 
          message: 'Network error. The reply may still be saved. Refreshing list...', 
          type: 'warning' 
        });
      } else {
        let errorMessage = 'Failed to send reply';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        setNotification({ message: errorMessage, type: 'error' });
      }
      
      // Close the modal and refresh contacts regardless of error
      setReplyModalOpen(false);
      // Add a small delay before refreshing to allow server to process
      setTimeout(() => {
        fetchContacts();
      }, 1000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/api/contacts/${id}`);
      setNotification({ message: 'Contact deleted', type: 'success' });
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      setNotification({ message: 'Failed to delete contact', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-3 sm:p-6">
      {/* Main Content Container */}
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
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      
      {/* Main Content */}
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-white/10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        {loading ? (
          <div className="py-12 text-center">
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-600/30 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-electric-500 animate-spin"></div>
              </div>
            </div>
            <p className="text-neutral-300">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center">
            <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-neutral-500" />
            <p className="text-neutral-400 text-lg">No contact messages found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full">
              <thead className="bg-neutral-800/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, idx) => (
                  <tr key={contact._id} className={`transition-colors duration-200 ${
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-white/5'
                  } hover:bg-white/10`}>
                    <td className="px-6 py-4 border-b border-white/10">
                      <div className="flex items-center">
                        <Avatar name={contact.name} />
                        <span className="text-white font-medium">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-white/10">
                      <span className="text-neutral-300 max-w-xs truncate block">{contact.email}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-white/10">
                      <span className="text-neutral-300 max-w-xs truncate block" title={contact.message}>
                        {contact.message}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-white/10">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="px-6 py-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <button
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                          onClick={() => handleView(contact)}
                        >
                          View
                        </button>
                        <button
                          className="text-electric-400 hover:text-electric-300 font-medium transition-colors duration-200"
                          onClick={() => handleReply(contact)}
                        >
                          Reply
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                        >
                          {deletingId === contact._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      />
    </div>
  </div>
  );
};

export default ContactManagement; 