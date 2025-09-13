import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckIcon, XMarkIcon, EnvelopeIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
axios.defaults.baseURL = 'http://localhost:3000';

const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in transition-all duration-300">
      <div className={`rounded-lg p-4 shadow-lg ${bgColor} border ${borderColor} flex items-center gap-2`}>
        {type === 'success' ? (
          <CheckIcon className="h-5 w-5 text-green-400" />
        ) : (
          <XMarkIcon className="h-5 w-5 text-red-400" />
        )}
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const color = status === 'replied' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${color}`}>{label}</span>
  );
};

const Avatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold mr-2 border border-purple-200">
      {initial}
    </span>
  );
};

const ReplyModal = ({ open, onClose, onSend, contact }) => {
  const [reply, setReply] = useState('');
  useEffect(() => { setReply(contact?.reply || ''); }, [contact]);
  if (!open || !contact) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <EnvelopeIcon className="h-6 w-6 mr-2 text-purple-500" />Reply to {contact.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-4">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="5"
            placeholder="Type your reply..."
          />
        </div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition">Cancel</button>
          <button
            onClick={() => onSend(reply)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center transition"
            disabled={!reply.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-1" /> Send
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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center"><EnvelopeIcon className="h-7 w-7 mr-2 text-purple-600" />Contact Management</h2>
          <p className="text-gray-500 mb-4">View, reply to, and manage user contact messages.</p>
          {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No contact messages found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white rounded-lg">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 border-b text-left">Name</th>
                    <th className="px-4 py-3 border-b text-left">Email</th>
                    <th className="px-4 py-3 border-b text-left">Message</th>
                    <th className="px-4 py-3 border-b text-left">Status</th>
                    <th className="px-4 py-3 border-b text-left">Reply</th>
                    <th className="px-4 py-3 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, idx) => (
                    <tr key={contact._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-purple-50 transition'}>
                      <td className="px-4 py-3 border-b flex items-center">
                        <Avatar name={contact.name} />
                        <span>{contact.name}</span>
                      </td>
                      <td className="px-4 py-3 border-b max-w-xs truncate">{contact.email}</td>
                      <td className="px-4 py-3 border-b max-w-xs truncate" title={contact.message}>{contact.message}</td>
                      <td className="px-4 py-3 border-b"><StatusBadge status={contact.status} /></td>
                      <td className="px-4 py-3 border-b max-w-xs truncate" title={contact.reply}>{contact.reply || '-'}</td>
                      <td className="px-4 py-3 border-b">
                        <button
                          className="text-purple-600 hover:underline mr-3 font-medium"
                          onClick={() => handleReply(contact)}
                        >Reply</button>
                        <button
                          className="text-red-600 hover:underline font-medium"
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                        >{deletingId === contact._id ? 'Deleting...' : 'Delete'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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