import React,{ useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaArrowRight, FaCalendar, FaUsers, FaGem, FaClock, FaDownload, FaSearch } from 'react-icons/fa';
import axios from '../utils/axiosConfig';
import NoticeModal from '../components/NoticeModal';
import useFormNotice from '../hooks/useFormNotice';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [homeContent, setHomeContent] = useState({
    heroSlider: [],
    introduction: {
      heading: '',
      description: '',
      highlights: [],
      download: {
        label: '',
        url: '',
        fileName: ''
      }
    },
    about: {
      heading: '',
      description: '',
      image: '',
      features: []
    },
    leadership: {
      heading: '',
      description: '',
      members: [],
      note: ''
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const { showNotice, activeForm, handleCloseNotice } = useFormNotice();

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('//')) return `https:${imagePath}`;
  
    return imagePath;
  };

  const getFallbackImage = (type) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error('Cloudinary cloud name not found in environment variables');
      return '/placeholder-image.jpg';
    }

    switch(type) {
      case 'slide':
        return `https://res.cloudinary.com/${cloudName}/image/upload/v1706030489/website-content/hero/default-slide_yaqx1j.jpg`;
      case 'member':
        return `https://res.cloudinary.com/${cloudName}/image/upload/v1706030489/website-content/leadership/default-member_vd6j2k.jpg`;
      case 'feature':
        return `https://res.cloudinary.com/${cloudName}/image/upload/v1706030489/website-content/features/default-feature_kt3n4p.jpg`;
      default:
        return `https://res.cloudinary.com/${cloudName}/image/upload/v1706030489/website-content/general/default-general_e5m9qw.jpg`;
    }
  };

  // Fetch home content
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await axios.get('/api/content/home');
        if (response.data.success) {
          setHomeContent(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch home content');
        }
      } catch (err) {
        console.error('Error fetching home content:', err);
        setError(err.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  useEffect(() => {
    if (homeContent.heroSlider.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % homeContent.heroSlider.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [homeContent.heroSlider.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % homeContent.heroSlider.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + homeContent.heroSlider.length) % homeContent.heroSlider.length);
  };

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const searchCommitteeMembers = async (village) => {
    if (!village.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const response = await axios.get(`/api/committee/members/search?village=${encodeURIComponent(village)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Error searching committee members:', err);
      setSearchError(err.response?.data?.message || 'Failed to search committee members');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Create debounced version of search function
  const debouncedSearch = useCallback(debounce(searchCommitteeMembers, 500), []);

  // Handle search term change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Trigger debounced search
    debouncedSearch(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-red-500/30">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
          <p className="text-lg text-neutral-300 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section with Slider */}
        <div className="relative">
          {/* Hero Slider */}
          <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] w-full overflow-hidden z-0">
            {homeContent.heroSlider && homeContent.heroSlider.length > 0 ? (
              <>
                {homeContent.heroSlider.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
                      currentSlide === index 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60">
                      <div className="container mx-auto h-full flex items-center justify-center px-4 sm:px-6">
                        <div className="text-center text-white max-w-5xl animate-fade-in-up">
                          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight">
                            {slide.title}
                          </h1>
                          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200 leading-relaxed max-w-4xl mx-auto px-2">
                            {slide.description}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                            <button 
                              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-electric text-white font-semibold rounded-full hover:shadow-lg hover:shadow-electric-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
                              onClick={() => window.location.href = '/events/categories'}
                            >
                              Explore Events
                            </button>
                            <button 
                              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-neutral-900 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                              onClick={() => window.location.href = '/services'}
                            >
                              Learn More
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Slider Controls - Only show if there's more than one slide */}
                {homeContent.heroSlider.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <FaArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <FaArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>

                    {/* Slider Indicators */}
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-4">
                      {homeContent.heroSlider.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                            currentSlide === index 
                              ? 'bg-white scale-125 shadow-lg' 
                              : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              
              <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white max-w-3xl px-4">
                  <h1 className="text-5xl font-bold mb-6">Welcome</h1>
                  <p className="text-xl">Please add slider content from the admin panel.</p>
                </div>
              </div>
            )}
          </div>

          {/* Introduction Section */}
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-mesh relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-purple-100 rounded-full -translate-y-32 sm:-translate-y-48 translate-x-32 sm:translate-x-48 opacity-5"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-indigo-100 rounded-full translate-y-20 sm:translate-y-40 -translate-x-20 sm:-translate-x-40 opacity-5"></div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center max-w-6xl mx-auto">
                <div className="inline-block mb-4 sm:mb-6">
                  <span className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/10">
                    Welcome to VSPS
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2">
                  {homeContent.introduction.heading}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-neutral-300 mb-12 sm:mb-16 leading-relaxed max-w-5xl mx-auto px-2">
                  {homeContent.introduction.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
                  {(homeContent.introduction.highlights || []).map((highlight, index) => (
                    <div 
                      key={index} 
                      className="group text-center glass-effect p-6 sm:p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/10 hover:border-electric-500/30"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-electric rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                        {getIconComponent(highlight.icon)}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-electric-400 transition-colors">
                        {highlight.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">{highlight.subtitle}</p>
                    </div>
                  ))}
                </div>
                {/* Download Button */}
                <div className="mt-8 sm:mt-12">
                  <a
                    href="/assets/wadi_instructions%20.pdf"
                    download="wadi_instructions.pdf"
                    className="group inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-electric text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-electric-500/30 transition-all duration-300 text-sm sm:text-base lg:text-lg shadow-lg hover:scale-105 transform"
                  >
                    <FaDownload className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:animate-bounce" />
                    <span className="hidden sm:inline">Download Instructions PDF</span>
                    <span className="sm:hidden">Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-mesh relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-electric rounded-full -translate-y-1/2 translate-x-16 sm:translate-x-24 lg:translate-x-32 opacity-10"></div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
                <div className="relative group order-2 lg:order-1">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <img
                      src={getImageUrl(homeContent.about.image)}
                      alt="Party Plot"
                      className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        if (!e.target.src.includes('cloudinary.com')) {
                          console.error('Error loading image:', homeContent.about.image);
                          e.target.src = getFallbackImage('about');
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-electric rounded-2xl sm:rounded-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-neon rounded-xl sm:rounded-2xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                </div>
                <div className="space-y-6 sm:space-y-8 lg:space-y-10 order-1 lg:order-2">
                  <div>
                    <div className="inline-block mb-3 sm:mb-4">
                      <span className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/10">
                        About Us
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 sm:mb-6">
                      {homeContent.about.heading}
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed">
                      {homeContent.about.description}
                    </p>
                  </div>
                  <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {homeContent.about.features.map((feature, index) => (
                      <div key={index} className="group flex items-start space-x-4 sm:space-x-6 glass-effect p-4 sm:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-white/10">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-electric flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-lg sm:text-xl font-bold">✓</span>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-electric-400 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Section */}
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-mesh relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-electric-500 rounded-full opacity-10"></div>
              <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-neon-500 rounded-full opacity-10"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-secondary-500 rounded-full opacity-5"></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                <div className="inline-block mb-4 sm:mb-6">
                  <span className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/10">
                    Our Leadership
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2">
                  {homeContent.leadership.heading}
                </h2>
                <p className="text-lg sm:text-xl text-neutral-300 max-w-5xl mx-auto leading-relaxed px-2">
                  {homeContent.leadership.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16 lg:mb-20 max-w-7xl mx-auto">
                {homeContent.leadership.members.map((member, index) => (
                  <div key={index} className="group glass-effect rounded-2xl sm:rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl border border-white/10">
                    <div className="relative overflow-hidden">
                      <div className="aspect-w-4 aspect-h-5">
                        <img 
                          src={getImageUrl(member.image)}
                          alt={member.name}
                          className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            if (!e.target.src.includes('cloudinary.com')) {
                              console.error('Error loading image:', member.image);
                              e.target.src = getFallbackImage('member');
                            }
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 group-hover:text-electric-400 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-electric-300 font-semibold text-sm sm:text-base lg:text-lg">
                          {member.title}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors border border-white/10">
                        <span className="text-white text-sm sm:text-base lg:text-xl">👑</span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8">
                      <p className="text-neutral-300 leading-relaxed text-sm sm:text-base lg:text-lg">
                        {member.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {homeContent.leadership.note && (
                <div className="max-w-5xl mx-auto text-center px-2">
                  <div className="glass-effect rounded-2xl p-6 sm:p-8 border border-white/10">
                    <p className="text-lg sm:text-xl text-neutral-300 italic leading-relaxed">
                      {homeContent.leadership.note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Village Committee Search Section */}
          <section className="py-16 sm:py-20 lg:py-24 bg-gradient-mesh relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-sunset-500 rounded-full opacity-10"></div>
              <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-neon-500 rounded-full opacity-10"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-electric-500 rounded-full opacity-5"></div>
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                <div className="inline-block mb-4 sm:mb-6">
                  <span className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/10">
                    Find Your Community Leaders
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight px-2">
                  Village Committee Members
                </h2>
                <p className="text-lg sm:text-xl text-neutral-300 max-w-5xl mx-auto leading-relaxed px-2">
                  Search for committee members in your village to get in touch with your local community leaders.
                </p>
              </div>
              
              {/* Search Form */}
              <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
                <div className="glass-effect rounded-2xl p-6 sm:p-8 border border-white/10">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label htmlFor="village-search" className="block text-lg font-medium text-white mb-2">
                        Enter your village name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          type="text"
                          id="village-search"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="input-field pl-10 w-full"
                          placeholder="e.g. Wadi, Nagpur, etc."
                        />
                      </div>
                      {searchLoading && (
                        <div className="flex items-center mt-2 text-electric-300">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-electric-500 rounded-full animate-spin mr-2"></div>
                          <span className="text-sm">Searching...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Search Results */}
              {searchError && (
                <div className="max-w-3xl mx-auto mb-8">
                  <div className="glass-effect rounded-2xl p-6 border border-red-500/30 bg-red-500/10 text-red-300">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{searchError}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                  {searchResults.map((member) => (
                    <div key={member._id} className="group glass-effect rounded-2xl sm:rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl border border-white/10">
                      <div className="relative overflow-hidden">
                        <div className="aspect-square">
                          <div className="w-full h-full bg-gradient-to-br from-electric-500/20 to-neon-500/20 flex items-center justify-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-electric-400 to-neon-400 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                          <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-electric-400 transition-colors">
                            {member.username}
                          </h3>
                          <p className="text-sunset-300 font-semibold text-sm sm:text-base">
                            {member.village}
                          </p>
                        </div>
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors border border-white/10">
                          <span className="text-white text-sm">👥</span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center text-neutral-300 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center mt-2 text-neutral-300 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm && !searchLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                    <svg className="w-12 h-12 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Committee Members Found</h3>
                  <p className="text-neutral-400">No committee members found for "{searchTerm}". Try searching with a different village name.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                    <FaSearch className="w-12 h-12 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Search for Committee Members</h3>
                  <p className="text-neutral-400">Enter your village name in the search box above to find your local committee members.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <NoticeModal
          open={showNotice}
          onClose={handleCloseNotice}
          formData={activeForm}
        />
      </div>

    </>
  );
}


const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'fa-calendar':
      return <FaCalendar className="text-2xl text-white" />;
    case 'fa-users':
      return <FaUsers className="text-2xl text-white" />;
    case 'fa-gem':
      return <FaGem className="text-2xl text-white" />;
    case 'fa-clock':
      return <FaClock className="text-2xl text-white" />;
    case 'fa-download':
      return <FaDownload className="text-2xl text-white" />;
    default:
      return null;
  }
};

export default Home;