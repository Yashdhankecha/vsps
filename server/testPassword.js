require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = 'harshvyas4567harsh@gmail.com';
    const password = 'testpassword'; // Replace with the password you're trying to use
    
    console.log(`Testing login for ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      mongoose.connection.close();
      return;
    }
    
    console.log('User found:', user.username);
    console.log('User verified:', user.isVerified);
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });