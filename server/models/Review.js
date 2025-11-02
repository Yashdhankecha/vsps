const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['wedding', 'corporate', 'birthday', 'social', 'other']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    trim: true
  },
  images: [{
    url: String,
    publicId: String
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);