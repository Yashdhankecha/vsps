import { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaSearch, FaHeart, FaTimes } from 'react-icons/fa';
import { getGalleryItems } from '../services/crudapi';
import { Button } from '../components';

function Gallery() {
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryItems, setGalleryItems] = useState({ photos: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = ['all', 'weddings', 'corporate', 'birthdays', 'social', 'graduation', 'private'];

  
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const items = await getGalleryItems(activeTab === 'photos' ? 'photo' : 'video');
        
        setGalleryItems(prev => ({
          ...prev,
          [activeTab]: items
        }));
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  const filteredItems = galleryItems[activeTab]?.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const handlePrevImage = () => {
    const currentIndex = filteredItems.findIndex(item => item._id === selectedImage._id);
    if (currentIndex > 0) {
      setSelectedImage(filteredItems[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    const currentIndex = filteredItems.findIndex(item => item._id === selectedImage._id);
    if (currentIndex < filteredItems.length - 1) {
      setSelectedImage(filteredItems[currentIndex + 1]);
    }
  };

  
  const handleImageClick = (item) => {
    setSelectedImage(item);
  };


  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  
  const ImageModal = () => {
    if (!selectedImage) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={handleCloseModal}
      >
        <div className="relative max-w-7xl w-full">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={handleCloseModal}
          >
            <FaTimes className="w-6 h-6" />
          </button>

          {/* Image */}
          <div 
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.type === 'photo' ? selectedImage.url : selectedImage.thumbnail}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[90vh] object-contain mx-auto"
            />
            
            {/* Image details */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium capitalize">
                  {selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-red-500/30">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
          <p className="text-lg text-neutral-300 mb-8 leading-relaxed">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="danger"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Our Gallery
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Event Gallery
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Explore our collection of memorable events and celebrations. Get inspired by our past events and imagine your perfect celebration.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Tabs and Filters */}
        <div className="mb-12">
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Media Type Tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'photos'
                      ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  <FaImage className="w-5 h-5" />
                  <span>Photos</span>
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'videos'
                      ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  <FaVideo className="w-5 h-5" />
                  <span>Videos</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-4">
                <span className="text-neutral-300 font-medium">Filter by category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-neutral-800 text-white">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="group glass-effect rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-white/10"
                onClick={() => handleImageClick(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.type === 'photo' ? item.url : item.thumbnail}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                      console.error('Failed to load image:', item.url || item.thumbnail);
                    }}
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FaVideo className="text-electric-600 text-2xl" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gradient-electric text-white px-3 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-electric-400 text-sm font-medium">Click to view →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <FaImage className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Gallery Items Found</h3>
            <p className="text-neutral-300 mb-6">No gallery items found for the selected category.</p>
            <Button
              onClick={() => setSelectedCategory('all')}
              variant="primary"
            >
              View All Items
            </Button>
          </div>
        )}

        {/* Image Modal */}
        <ImageModal />
      </div>
    </div>
  );
}

export default Gallery;