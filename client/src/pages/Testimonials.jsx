import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaUser } from 'react-icons/fa';
import { Card, Button } from '../components';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

function Testimonials() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      console.log('Fetching testimonials from /api/reviews');
      const response = await axios.get('/api/reviews');
      console.log('API Response:', response.data);
      setTestimonials(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('Failed to load testimonials. Please try again later.');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.eventType === filter);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Testimonials
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Client Testimonials
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Read what our clients have to say about their experiences at our venue. 
            Their stories and feedback help us maintain our high standards of service.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8">
            <p className="text-red-400 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex justify-center space-x-2 mb-16">
          <div className="glass-effect rounded-2xl p-2 border border-white/10">
            {['all', 'wedding', 'corporate', 'birthday', 'social'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === type
                    ? 'bg-gradient-electric text-white shadow-lg transform scale-105'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Grid */}
        {filteredTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {filteredTestimonials.map((testimonial) => (
              <Card 
                key={testimonial._id}
                className="p-8 glass-effect border border-white/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                hoverEffect={true}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 bg-gradient-electric flex items-center justify-center">
                    <FaUser className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-electric-400 transition-colors">{testimonial.name}</h3>
                    <p className="text-sm text-neutral-300 font-medium">
                      {testimonial.eventType.charAt(0).toUpperCase() + testimonial.eventType.slice(1)} Event
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-1 mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm text-neutral-400">{formatDate(testimonial.eventDate)}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">{testimonial.title}</h4>
                  <FaQuoteLeft className="text-electric-200 text-4xl mb-4" />
                  <p className="text-neutral-300 italic text-lg leading-relaxed">{testimonial.review}</p>
                </div>
                {testimonial.images && testimonial.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {testimonial.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Event ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-neutral-800/50 backdrop-blur-xl rounded-2xl p-12 glass-effect border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">No Testimonials Yet</h3>
              <p className="text-lg text-neutral-300 mb-8">
                Be the first to share your experience! Your feedback helps us improve and helps other clients make informed decisions.
              </p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/submit-review')}
              >
                Share Your Experience
              </Button>
            </div>
          </div>
        )}

        {/* Call to Action - Modified to go to home page */}
        <Card className="text-center p-12 glass-effect border border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">
            Return to Homepage
          </h3>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Explore more about our venue and services. Discover what makes us the perfect choice for your special events.
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Testimonials;