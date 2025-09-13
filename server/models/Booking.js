const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  villageName: {
    type: String,
    required: true,
    trim: true
  },
  guestCount: {
    type: Number,
    required: true
  },
  additionalServices: [{ type: String }],

  additionalNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Booked', 'Rejected'],
    default: 'Pending'
  },
  isSamajMember: {
    type: Boolean,
    default: false
  },
  rejectionReason: { type: String },
  eventDocument: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['Aadhar Card', 'PAN Card', 'Passport', 'Event Invitation', 'Organization Letterhead', 'Birth Certificate', 'Marriage Certificate', 'Other'],
    default: 'Other'
  },
  documents: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Aadhar Card', 'PAN Card', 'Passport', 'Event Invitation', 'Organization Letterhead', 'Birth Certificate', 'Marriage Certificate', 'Other'],
      default: 'Other'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);