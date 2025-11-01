import { useState } from 'react';
import { FaStar, FaCamera } from 'react-icons/fa';
import { Card, Input, TextArea, Button } from '../components';

function SubmitReview() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventType: '',
    eventDate: '',
    rating: 0,
    title: '',
    review: '',
    images: []
  });

  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10">
              Share Your Experience
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Share Your Experience</h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Your feedback helps us improve and helps others make informed decisions. 
            Tell us about your experience at our venue.
          </p>
        </div>

        {/* Review Form */}
        <Card className="max-w-2xl mx-auto p-8 glass-effect border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                variant="dark"
                required
              />
              <Input
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                variant="dark"
                required
              />
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventType" className="block text-sm font-semibold text-neutral-200 mb-2">
                  Event Type
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium"
                  required
                >
                  <option value="">Select Event Type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="social">Social Gathering</option>
                </select>
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-semibold text-neutral-200 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-all duration-300 font-medium"
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-neutral-200 mb-3">
                Overall Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRatingClick(star)}
                    className="focus:outline-none transition-transform duration-200 hover:scale-110"
                  >
                    <FaStar
                      className={`text-3xl ${
                        star <= (hoverRating || formData.rating)
                          ? 'text-yellow-400'
                          : 'text-neutral-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <Input
              label="Review Title"
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Sum up your experience in a short title"
              variant="dark"
              required
            />

            {/* Review Content */}
            <TextArea
              label="Your Review"
              id="review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              rows="6"
              placeholder="Tell us about your experience..."
              variant="dark"
              required
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-neutral-200 mb-3">
                Add Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-neutral-800/20 backdrop-blur-xl">
                <FaCamera className="text-4xl text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-300 mb-2">Drag and drop your photos here</p>
                <p className="text-sm text-neutral-400 mb-4">or</p>
                <Button variant="ghost">
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                className="w-full sm:w-auto"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default SubmitReview;