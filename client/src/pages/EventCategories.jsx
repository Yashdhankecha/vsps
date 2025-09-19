import { useState, useEffect } from 'react';
import { FaHeart, FaBriefcase, FaBirthdayCake, FaGlassCheers, FaGraduationCap, FaHandshake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EventInquiryForm from '../components/user/EventInquiryForm';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

function EventCategories() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Icon mapping
  const iconMap = {
    FaHeart: FaHeart,
    FaBriefcase: FaBriefcase,
    FaBirthdayCake: FaBirthdayCake,
    FaGlassCheers: FaGlassCheers,
    FaGraduationCap: FaGraduationCap,
    FaHandshake: FaHandshake
  };

  useEffect(() => {
    fetchCategories();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      checkForUpdates();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching categories from: /api/content/events/categories');
      
      const response = await axiosInstance.get('/api/content/events/categories');
      console.log('API Response:', response.data);
      
      // Check if response is HTML (indicates wrong endpoint)
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        throw new Error('Backend server not running - received HTML instead of JSON');
      }
      
      if (response.data.success) {
        setCategories(response.data.data);
        setLastUpdate(new Date().toISOString());
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch categories';
      
      if (typeof error.response?.data === 'string' && error.response.data.includes('<!doctype html>')) {
        errorMessage = 'Backend server not running - please start the server on port 3000';
      } else if (error.message.includes('Backend server not running')) {
        errorMessage = error.message;
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Network error - please check if the backend server is running on port 3000';
      } else if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error or server not responding
        errorMessage = 'Unable to connect to backend server - please check if it\'s running on port 3000';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      const response = await axiosInstance.get('/api/content/events/categories');
      if (response.data.success) {
        // Compare the new data with current data
        const newData = response.data.data;
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(categories);
        
        if (hasChanges) {
          console.log('Updates detected, refreshing categories...');
          setCategories(newData);
          setLastUpdate(new Date().toISOString());
          
          // If the currently selected category was updated, refresh it
          if (selectedCategory) {
            const updatedCategory = newData.find(cat => cat._id === selectedCategory._id);
            if (updatedCategory) {
              setSelectedCategory(updatedCategory);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      // Don't set error state here to avoid disrupting the UI during background updates
      // If there are repeated failures, consider stopping the polling
    }
  };

  const handleBookNow = (eventType) => {
    setSelectedEventType(eventType);
    setShowInquiryForm(true);
    navigate(`/booking?eventType=${encodeURIComponent(eventType)}`);
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-600 mb-2">Unable to Load Categories</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={fetchCategories}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <p className="text-sm text-gray-500">Check if backend server is running on port 3000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our versatile venue options for different types of events. 
            Select a category to learn more about our specialized services.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}</span>
            <button
              onClick={() => {
                fetchCategories();
                toast.success('Categories refreshed');
              }}
              className="ml-2 p-2 text-purple-600 hover:text-purple-700 focus:outline-none"
              title="Refresh categories"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Categories Available</h3>
                <p className="text-yellow-700 mb-4">There are currently no event categories configured.</p>
                <button
                  onClick={fetchCategories}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            categories.map((category) => {
              const IconComponent = iconMap[category.icon] || FaHeart;
              return (
                <div
                  key={category._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                    selectedCategory?._id === category._id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <IconComponent className="text-4xl text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-center mb-2">{category.description}</p>
                    <p className="text-sm text-gray-500 text-center">Capacity: {category.capacity}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedCategory && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">{selectedCategory.title}</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-center mb-4">Venue Pricing</h3>
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <h4 className="font-medium text-gray-800 mb-2">Samaj Member</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCategory.membershipPricing.samajMember}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <h4 className="font-medium text-gray-800 mb-2">Non-Samaj Member</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCategory.membershipPricing.nonSamajMember}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCategory.packages && selectedCategory.packages.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Available Packages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedCategory.packages.map((pkg, index) => (
                      <div 
                        key={index}
                        className={`bg-white rounded-lg p-6 border ${
                          pkg.isPopular ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                        }`}
                      >
                        {pkg.isPopular && (
                          <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                            Popular Choice
                          </div>
                        )}
                        <h4 className="text-lg font-semibold mb-2">{pkg.name}</h4>
                        <p className="text-2xl font-bold text-purple-600 mb-4">{pkg.price}</p>
                        <ul className="space-y-2">
                          {pkg.includes.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <button 
                  onClick={() => handleBookNow(selectedCategory.title)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Need a custom package or have specific requirements?
          </p>
          <button 
            onClick={handleContactClick}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Contact Our Team
          </button>
        </div>
      </div>

      {showInquiryForm && (
        <EventInquiryForm
          eventType={selectedEventType}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </div>
  );
}

export default EventCategories;