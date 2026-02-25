import React, { useState } from 'react';
import axios from '../utils/axiosConfig'; // Import Axios for API calls
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';

function Contact() {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/contacts',
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      );

      // Show success popup
      setShowSuccessPopup(true);

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

      // Hide success popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 page-decoration">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-fade-in-up border border-gray-200 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for your message. We will get back to you soon!
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-8 py-3 bg-gradient-electric text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-hero text-white py-20 overflow-hidden">
        <div className="absolute inset-0 texture-diagonal opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-3xl"></div>
        <div className="relative container mx-auto px-4 text-center">

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Get In Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Have questions about our services? We're here to help. Reach out to us through any of the following channels or fill out the contact form below.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Contact Cards */}
            <div className="group card-premium card-accent p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaPhone className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-electric-600 transition-colors">Phone</h3>
              <p className="text-lg font-semibold text-gray-600 mb-2">8799038003</p>
              <p className="text-gray-500">Mon-Fri 9am-6pm</p>
            </div>

            <div className="group card-premium card-accent p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-electric-600 transition-colors">Email</h3>
              <p className="text-lg font-semibold text-gray-600 break-all">developerstripod@gmail.com</p>
            </div>

            <div className="group card-premium card-accent p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-electric-600 transition-colors">Location</h3>
              <p className="text-lg font-semibold text-gray-600 mb-1">Vansol Patidar Samaj Sanskrutik Kendra</p>
              <p className="text-gray-500">bhalej road</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200/80 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
              <p className="text-lg text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium placeholder-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium placeholder-gray-400"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium placeholder-gray-400"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium resize-none placeholder-gray-400"
                  placeholder="Tell us about your event or any questions you have..."
                  required
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform ${isLoading
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-electric hover:shadow-lg hover:scale-105 shadow-lg text-white'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
                    Sending Message...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;