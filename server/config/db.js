const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  // Fix: System DNS is 127.0.0.1 which cannot resolve MongoDB Atlas SRV records.
  // Use Google Public DNS as fallback for reliable SRV resolution.
  try {
    const currentServers = dns.getServers();
    if (currentServers.length === 0 || (currentServers.length === 1 && currentServers[0] === '127.0.0.1')) {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      console.log('DNS servers set to Google/Cloudflare for MongoDB Atlas SRV resolution');
    }
  } catch (dnsErr) {
    console.warn('Could not set DNS servers:', dnsErr.message);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('The server will continue running but database operations will fail.');
    console.error('Please check:');
    console.error('  1. Your MONGO_URI in .env is correct');
    console.error('  2. Your IP is whitelisted in MongoDB Atlas (Network Access)');
    console.error('  3. Your internet connection is stable');
    // Don't exit - let the server start so we can at least see it's running
    // process.exit(1);
  }
};

module.exports = connectDB;