import { useState, useEffect } from 'react';
import { FaUtensils, FaChair, FaMusic, FaCamera, FaClipboardList, FaAward, FaUsers, FaCalendarAlt, FaStar, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';

function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formStatus, setFormStatus] = useState({
    samuhLagan: { active: false, isCurrentlyActive: false },
    studentAwards: { active: false, isCurrentlyActive: false }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormStatus = async () => {
      try {
        const response = await axios.get('/api/admin/forms/public/status');
        setFormStatus(response.data || {
          samuhLagan: { active: false, isCurrentlyActive: false },
          studentAwards: { active: false, isCurrentlyActive: false },

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

  const forms = [
    {
      title: 'Samuh Lagan Registration',
      icon: <FaClipboardList className="text-4xl text-white" />,
      description: 'Register for the prestigious Samuh Lagan ceremony, a traditional celebration of unity and community bonding.',
      features: [
        'Traditional ceremony with cultural significance',
        'Professional event coordination',
        'Catering and decoration services included',
        'Photography and documentation'
      ],
      route: '/samuh-lagan',
      isActive: formStatus.samuhLagan?.isCurrentlyActive || false
    },
    {
      title: 'Student Award Registration',
      icon: <FaAward className="text-4xl text-white" />,
      description: 'Nominate outstanding students for academic and extracurricular achievements in our annual recognition program.',
      features: [
        'Recognition for academic excellence',
        'Certificates and awards presentation',
        'Scholarship opportunities',
        'Networking with industry professionals'
      ],
      route: '/student-awards',
      isActive: formStatus.studentAwards?.isCurrentlyActive || false
    },

  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Registration Forms
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Event Registration Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Access our specialized registration forms for various community events, programs, and competitions. 
            Join us in celebrating tradition, recognizing excellence, and building community connections.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Forms Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Available Registration Forms</h2>
            <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
              Select the appropriate form below to register for our upcoming events and programs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.map((form, index) => (
              <div
                key={index}
                className="group glass-effect rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/10 h-full flex flex-col"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {form.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-electric-400 transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-neutral-300 mb-6 leading-relaxed">{form.description}</p>
                  
                  {/* Features List */}
                  <div className="text-left mb-6">
                    <ul className="space-y-2">
                      {form.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <FaCheckCircle className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="text-center mb-4">
                    {form.isActive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        Now Accepting Registrations
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        Registration Closed
                      </span>
                    )}
                  </div>
                  {form.isActive ? (
                    <button
                      onClick={() => navigate(form.route)}
                      className="w-full bg-gradient-electric text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-electric-500/30 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
                    >
                      Open Registration Form
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-neutral-700 text-neutral-400 px-6 py-3 rounded-xl cursor-not-allowed font-semibold"
                    >
                      Form Currently Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="glass-effect rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Need Assistance?</h2>
            <p className="text-lg text-neutral-300 mb-8">
              If you have questions about any of our registration forms or need help with the submission process, 
              our team is here to assist you every step of the way.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-3">Contact Support</h3>
                <p className="text-neutral-300 mb-4">Get help with technical issues or form questions</p>
                <button 
                  onClick={() => navigate('/contact')}
                  className="px-6 py-2 bg-gradient-electric text-white rounded-lg hover:shadow-lg hover:shadow-electric-500/30 transition-all duration-300 font-medium"
                >
                  Contact Us
                </button>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-3">View Guidelines</h3>
                <p className="text-neutral-300 mb-4">Access detailed information about each registration process</p>
                <button 
                  onClick={() => navigate('/resources')}
                  className="px-6 py-2 bg-gradient-secondary text-white rounded-lg hover:shadow-lg hover:shadow-secondary-500/30 transition-all duration-300 font-medium"
                >
                  View Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;