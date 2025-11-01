import { useState } from 'react';
import { FaStar, FaQuoteLeft, FaUser } from 'react-icons/fa';
import { Card, Button } from '../components';

function Testimonials() {
  const [filter, setFilter] = useState('all');

  const testimonials = [
    // Testimonial data would go here
  ];

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.type === filter);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

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

        {/* Filter Buttons */}
        <div className="flex justify-center space-x-2 mb-16">
          <div className="glass-effect rounded-2xl p-2 border border-white/10">
            {['all', 'wedding', 'corporate', 'birthday'].map((type) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {filteredTestimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="p-8 glass-effect border border-white/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              hoverEffect={true}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 bg-gradient-electric flex items-center justify-center">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-electric-400 transition-colors">{testimonial.name}</h3>
                  <p className="text-sm text-neutral-300 font-medium">{testimonial.event}</p>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1 mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-sm text-neutral-400">{testimonial.date}</p>
                </div>
              </div>
              <div className="mb-6">
                <FaQuoteLeft className="text-electric-200 text-4xl mb-4" />
                <p className="text-neutral-300 italic text-lg leading-relaxed">{testimonial.comment}</p>
              </div>
              <img
                src={testimonial.image}
                alt={testimonial.event}
                className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="text-center p-12 glass-effect border border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">
            Share Your Experience
          </h3>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Had an event at our venue? We'd love to hear about your experience! Your feedback helps us improve and helps other clients make informed decisions.
          </p>
          <Button variant="primary" size="lg">
            Share Your Experience
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Testimonials;