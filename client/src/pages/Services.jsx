import { useState, useEffect } from 'react';
import { FaUtensils, FaChair, FaMusic, FaCamera, FaClipboardList, FaAward, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ServiceInquiryForm from '../components/user/ServiceInquiryForm';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formStatus, setFormStatus] = useState({
    samuhLagan: { active: false, isCurrentlyActive: false },
    studentAwards: { active: false, isCurrentlyActive: false },
    teamRegistration: { active: false, isCurrentlyActive: false }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/forms/public/status`);
        setFormStatus(response.data || {
          samuhLagan: { active: false, isCurrentlyActive: false },
          studentAwards: { active: false, isCurrentlyActive: false },
          teamRegistration: { active: false, isCurrentlyActive: false }
        });
      } catch (error) {
        console.error('Error fetching form status:', error);
        // Keep the default formStatus values on error
      } finally {
        setLoading(false);
      }
    };

    fetchFormStatus();
  }, []);

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowInquiryForm(true);
  };

  const services = [
    {
      title: 'Catering Services',
      icon: <FaUtensils className="text-4xl text-purple-600" />,
      description: 'Professional catering services for all your events'
    },
    {
      title: 'Venue Setup',
      icon: <FaChair className="text-4xl text-purple-600" />,
      description: 'Custom venue setup and decoration services'
    },
    {
      title: 'Entertainment',
      icon: <FaMusic className="text-4xl text-purple-600" />,
      description: 'Live music and entertainment options'
    },
    {
      title: 'Photography',
      icon: <FaCamera className="text-4xl text-purple-600" />,
      description: 'Professional photography and videography services'
    }
  ];

  const forms = [
    {
      title: 'Samuh Lagan Registration',
      icon: <FaClipboardList className="text-4xl text-purple-600" />,
      description: 'Register for Samuh Lagan ceremony',
      route: '/samuh-lagan',
      isActive: formStatus.samuhLagan?.isCurrentlyActive || false
    },
    {
      title: 'Student Award Registration',
      icon: <FaAward className="text-4xl text-purple-600" />,
      description: 'Register for student awards',
      route: '/student-awards',
      isActive: formStatus.studentAwards?.isCurrentlyActive || false
    },
    {
      title: 'Team Registration',
      icon: <FaUsers className="text-4xl text-purple-600" />,
      description: 'Register your team for sports tournaments',
      route: '/team-registration',
      isActive: formStatus.teamRegistration?.isCurrentlyActive || false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="w-20 h-20 border-4 border-transparent border-r-indigo-600 rounded-full animate-spin absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700 animate-pulse">Loading services...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm">
              Our Services
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Professional Event Services
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Discover our comprehensive range of services designed to make your events memorable and successful.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Services Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional services tailored to make your event exceptional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100 hover:border-purple-200"
                onClick={() => handleBookService(service)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  {!user && (
                    <div className="mt-auto">
                      <span className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                        Login required to submit inquiry
                      </span>
                    </div>
                  )}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-purple-600 font-semibold text-sm">Click to inquire →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forms Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Registration Forms</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Access our specialized registration forms for various events and programs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.map((form, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {form.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{form.description}</p>
                </div>
                <div className="text-center">
                  {form.isActive ? (
                    <button
                      onClick={() => navigate(form.route)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Open Form
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 px-6 py-3 rounded-xl cursor-not-allowed font-semibold"
                    >
                      Form Closed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInquiryForm && selectedService && (
        <ServiceInquiryForm
          serviceName={selectedService.title}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </div>
  );
}

export default Services;