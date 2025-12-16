import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../../utils/axiosConfig';
import { Card } from '../../components';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'all'

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/reviews/admin?status=${filter}`);
      setReviews(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/api/reviews/approve/${id}`);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Error approving review:', error);
      setError('Failed to approve review. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.delete(`/api/reviews/reject/${id}`);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting review:', error);
      setError('Failed to reject review. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/reviews/${id}`);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      wedding: 'Wedding',
      corporate: 'Corporate',
      birthday: 'Birthday',
      social: 'Social',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4 sm:p-6">
        <div className="card-glass p-8 animate-fade-in-up">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-4 sm:p-6">
      {/* Main Content Container */}
      <div className="card-glass animate-fade-in-up p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Review Management</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pending ({reviews.filter(r => !r.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Approved ({reviews.filter(r => r.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center glass-effect border border-white/10">
            <p className="text-gray-400">No reviews found.</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card 
              key={review._id} 
              className="p-6 glass-effect border border-white/10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-bold text-white">{review.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.isApproved 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{review.email}</p>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-300">
                      {getEventTypeLabel(review.eventType)} - {formatDate(review.eventDate)}
                    </span>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-300">{review.rating}/5</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                  <p className="text-gray-300 text-sm line-clamp-2">{review.review}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  </div>
  );
};

export default Reviews;