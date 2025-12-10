// User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: String,
  company: String,
  address: String,
  profileImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    lastUpdated: { type: Date },
    default: { type: String, default: '' }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordHistory: [{ type: String }],
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager'], 
    default: 'user' 
  },
  otp: {
    code: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashedPassword = await bcrypt.hash(this.password, 10);

   
    if (this.passwordHistory.length >= 5) {
      this.passwordHistory.shift(); 
    }
    this.passwordHistory.push(hashedPassword);

    this.password = hashedPassword;
  }
  next();
});


userSchema.methods.updateProfileImage = async function(imageUrl, publicId = '') {
  this.profileImage = {
    url: imageUrl,
    publicId: publicId,
    lastUpdated: new Date(),
    default: this.profileImage.default
  };
  return this.save();
};


userSchema.methods.getProfileImageUrl = function() {

  console.log('Profile image URL:', this.profileImage.url);
  return this.profileImage.url || this.profileImage.default || 'https://your-default-avatar-url.com/default.png';
};


userSchema.methods.removeProfileImage = async function() {
  this.profileImage = {
    url: '',
    publicId: '',
    lastUpdated: new Date(),
    default: this.profileImage.default
  };
  return this.save();
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);