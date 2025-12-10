const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const path = require('path');
const contentRoutes = require('./routes/contentRoutes');
const formRoutes = require('./routes/formRoutes');
const homeContentRoutes = require('./routes/homeContentRoutes');
const eventCategoryRoutes = require('./routes/eventCategoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const samuhLaganRoutes = require('./routes/samuhLagan');
const studentAwardRoutes = require('./routes/studentAwardRoutes');
const youtubeRoutes = require('./routes/youtube');
const committeeRoutes = require('./routes/committeeRoutes');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

// Debug logging for email configuration
console.log('Environment variables check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4) : 'Not found');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

connectDB();

// Test email configuration on startup
const testEmailConfig = async () => {
  console.log('Testing email configuration...');
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration warning: EMAIL_USER or EMAIL_PASS not set in .env file');
      return;
    }
    
    // Clean the password by removing any spaces
    const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');
    console.log('Cleaned EMAIL_PASS for testing:', cleanPassword ? '****' + cleanPassword.substring(cleanPassword.length - 4) : 'Not found');
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword, // Use cleaned password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection configuration
    await transporter.verify();
    console.log('Email configuration: OK');
  } catch (error) {
    console.error('Email configuration error:', error.message);
    console.warn('Email service may not work properly. Please check your email configuration in .env file.');
    console.warn('For Gmail, you need to use an App Password, not your regular password.');
    console.warn('Visit: https://myaccount.google.com/apppasswords to generate an App Password');
    console.warn('Make sure 2-factor authentication is enabled on your Gmail account.');
  }
};

// Test email configuration after DB connection
setTimeout(() => {
  testEmailConfig();
}, 2000);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON' 
      });
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Separate storage for PDF files
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|webm|mov)$/)) {
      return cb(new Error('Only image and video files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Separate upload for PDF files
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.pdf$/)) {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const pdfUploadsDir = path.join(__dirname, 'public/uploads');

[uploadsDir, pdfUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created uploads directory:', dir);
  }
});

// Static file serving for both uploads and PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make upload and uploadPDF available globally
app.locals.upload = upload;
app.locals.uploadPDF = uploadPDF;

// Uploads route middleware
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Add content type header for PDF files
app.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
  }
  next();
});

app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.url);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'File not found' 
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings/samuh-lagan', samuhLaganRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content', homeContentRoutes);
app.use('/api/content', eventCategoryRoutes);
app.use('/api/admin/forms', formRoutes);
app.use('/api/student-awards', studentAwardRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/committee', committeeRoutes);

app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Resource not found'
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    // Only show error in development
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));