const Review = require('../models/Review');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.submitReview = async (req, res) => {
  try {
    const { name, email, eventType, eventDate, rating, title, review } = req.body;
    
    // Validate required fields
    if (!name || !email || !eventType || !eventDate || !rating || !title || !review) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new review
    const newReview = new Review({
      name,
      email,
      eventType,
      eventDate: new Date(eventDate),
      rating: parseInt(rating),
      title,
      review
    });

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file) => {
        try {
          const result = await uploadToCloudinary(file, 'reviews');
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        } catch (error) {
          console.error('Error uploading image:', error);
          return null;
        }
      });

      const images = await Promise.all(imagePromises);
      newReview.images = images.filter(img => img !== null);
    }

    await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after approval.',
      data: newReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: error.message
    });
  }
};

exports.getApprovedReviews = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Build query for approved reviews
    const query = { isApproved: true };
    if (type && type !== 'all') {
      query.eventType = type;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .select('-email'); // Don't expose email in public API

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query; // 'approved', 'pending', 'all'
    
    let query = {};
    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving review',
      error: error.message
    });
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review rejected and deleted successfully'
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting review',
      error: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};