require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Verified: ${user.isVerified}`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });