const mongoose = require('mongoose');

const samuhLaganSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  bride: {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    age: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    photo: { type: String },
    documents: [{ type: String }]
  },
  
  groom: {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    age: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    photo: { type: String },
    documents: [{ type: String }]
  },
  
  ceremonyDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'confirmed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


samuhLaganSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


samuhLaganSchema.index({ user: 1 });
samuhLaganSchema.index({ status: 1 });
samuhLaganSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SamuhLagan', samuhLaganSchema); 