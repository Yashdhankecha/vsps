import { useState } from 'react';
import { FaStar, FaCamera, FaTimes, FaCheck } from 'react-icons/fa';
import { Card, Input, TextArea, Button } from '../components';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

function SubmitReview() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 5 images
    if (formData.images.length + files.length > 5) {
      setError('You can upload maximum 5 images');
      return;
    }

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);

    // Add files to form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    // Remove preview
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    // Remove file
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.eventType ||
      !formData.eventDate || !formData.rating || !formData.title || !formData.review) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('eventType', formData.eventType);
      formDataToSend.append('eventDate', formData.eventDate);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('review', formData.review);

      // Append images
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('/api/reviews', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          eventType: '',
          eventDate: '',
          rating: 0,
          title: '',
          review: '',
          images: []
        });
        setImagePreviews([]);

        // Redirect to testimonials page after 3 seconds
        setTimeout(() => {
          navigate('/testimonials');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-12 glass-effect border border-white/10 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <FaCheck className="text-green-400 text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
            <p className="text-lg text-neutral-300 mb-8">
              Your review has been submitted successfully. It will be visible on our testimonials page after approval.
            </p>
            <p className="text-neutral-400">
              Redirecting to testimonials page...
            </p>
          </Card>
        </div>
      </div>
    );
  }

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
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

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
                  <option value="other">Other</option>
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
                      className={`text-3xl ${star <= (hoverRating || formData.rating)
                          ? 'text-yellow-400'
                          : 'text-neutral-500'
                        }`}
                    />
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-neutral-400 text-sm mt-2">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </p>
              )}
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
                Add Photos (Optional - Max 5 images)
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-neutral-800/20 backdrop-blur-xl">
                <FaCamera className="text-4xl text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-300 mb-2">Drag and drop your photos here</p>
                <p className="text-sm text-neutral-400 mb-4">or</p>
                <label className="cursor-pointer">
                  <Button variant="ghost" type="button">
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  Supported formats: JPG, PNG, GIF (Max 5 images)
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-white text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default SubmitReview;