import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EnvelopeIcon, 
  TrashIcon, 
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
axios.defaults.baseURL = 'http://localhost:3000';

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

const ReplyModal = ({ open, onClose, onSend, contact }) => {
  const [reply, setReply] = useState('');
  useEffect(() => { setReply(contact?.reply || ''); }, [contact]);
  if (!open || !contact) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-effect border border-white/10 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-up">
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
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            className="input-field resize-none"
            rows="5"
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
            onClick={() => onSend(reply)}
            className="btn-primary flex items-center space-x-2"
            disabled={!reply.trim()}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>Send</span>
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
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data || []);
    } catch (err) {
      setNotification({ message: 'Failed to fetch contacts', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (contact) => {
    setSelectedContact(contact);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (reply) => {
    try {
      await axios.post(`/api/contacts/${selectedContact._id}/reply`, { reply });
      setNotification({ message: 'Reply sent successfully', type: 'success' });
      setReplyModalOpen(false);
      fetchContacts();
    } catch (err) {
      setNotification({ message: 'Failed to send reply', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/contacts/${id}`);
      setNotification({ message: 'Contact deleted', type: 'success' });
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      setNotification({ message: 'Failed to delete contact', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-6">
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 border-b border-white/10">Reply</th>
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
                      <span className="text-neutral-300 max-w-xs truncate block" title={contact.reply}>
                        {contact.reply || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
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
      
      <ReplyModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        onSend={handleSendReply}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactManagement; 