const mongoose = require('mongoose');

const teamRegistrationSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: true,
    enum: ['Cricket', 'Football', 'Volleyball', 'Badminton', 'Kabaddi']
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  captainName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  teamMembers: [{
    type: String,
    required: true,
    trim: true
  }],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
teamRegistrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
teamRegistrationSchema.index({ user: 1 });
teamRegistrationSchema.index({ status: 1 });
teamRegistrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TeamRegistration', teamRegistrationSchema); 