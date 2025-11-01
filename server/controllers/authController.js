const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendOTPEmail = async (email, otp, type = 'registration') => {
  try {
    // Debug logging to check if env vars are loaded
    console.log('Email configuration check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4) : 'Not found');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    
    // Check if required env vars are present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is incomplete. Please check EMAIL_USER and EMAIL_PASS in .env file.');
    }

    // Alternative Gmail transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let subject, heading;
    if (type === 'registration') {
      subject = 'Email Verification OTP';
      heading = 'Verify Your Email';
    } else {
      subject = 'Password Reset OTP';
      heading = 'Reset Your Password';
    }

    // Use EMAIL_FROM if available, otherwise fallback to EMAIL_USER
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"VSPS Team" <${fromAddress}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B46C1; text-align: center;">${heading}</h2>
          <p style="text-align: center; color: #4B5563;">Your ${type === 'registration' ? 'verification' : 'reset'} OTP is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="letter-spacing: 8px; font-size: 32px; margin: 0; color: #4B5563;">${otp}</h1>
          </div>
          <p style="color: #4B5563; text-align: center;">This OTP will expire in 10 minutes.</p>
          ${type === 'registration' 
            ? '<p style="color: #6B7280; text-align: center; font-size: 14px;">Please use this OTP to verify your email address.</p>'
            : '<p style="color: #6B7280; text-align: center; font-size: 14px;">If you did not request this password reset, please ignore this email.</p>'
          }
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file.');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to email server. Please check your network connection.');
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

   
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    user = new User({
      username,
      email,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    await user.save();

    // Try to send email, but don't fail registration if email fails
    try {
      await sendOTPEmail(email, otp, 'registration');
    } catch (emailError) {
      console.error('Failed to send OTP email during registration:', emailError);
      // Still register the user but inform them about email issue
      return res.status(201).json({ 
        msg: 'Registration successful but failed to send verification email. Please contact support.',
        email: email,
        userId: user._id
      });
    }

    res.status(201).json({ 
      msg: 'Registration successful. Please verify your email with OTP',
      email: email
    });
  } catch (err) {
    console.error('Registration Error:', err);
    // Provide more specific error information
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', error: err.message });
    }
    if (err.message && err.message.includes('Email configuration')) {
      return res.status(500).json({ msg: 'Email service is currently unavailable. Please contact administrator.' });
    }
    if (err.message && err.message.includes('send email')) {
      return res.status(500).json({ msg: 'Failed to send verification email. Please try again later.' });
    }
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
};


exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    console.log('Verifying OTP:', { email, otp }); 

    const user = await User.findOne({
      email,
      'otp.code': otp,
      'otp.expiresAt': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

   
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ msg: 'Failed to verify OTP' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for email:', email); 

    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email); 
      return res.status(400).json({ msg: 'User not found' });
    }

    
    if (!user.isVerified) {
      console.log('User not verified:', email); 
      return res.status(400).json({ msg: 'Please verify your email to login' });
    }

    
    const isMatchManual = await bcrypt.compare(password, user.password);
    console.log('Manual password match:', isMatchManual); 

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for email:', email); 
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log('Login successful for email:', email); 
    res.status(200).json({ token, role: user.role });
  } catch (err) {
    console.error('Error during login:', err); 
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    
    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await user.save();

    // Try to send email, but don't fail the whole request if email fails
    try {
      await sendOTPEmail(email, otp, 'password');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Still return success to the client but log the email error
      // In production, you might want to use a queue system for emails
      return res.status(200).json({ 
        msg: 'OTP generated successfully. Note: Email delivery failed, but OTP is valid.',
        email: email,
        otp: otp // Only for development, remove in production
      });
    }

    res.status(200).json({ 
      msg: 'OTP sent successfully',
      email: email
    });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    // More detailed error message
    if (err.message) {
      console.error('Detailed error:', err.message);
    }
    res.status(500).json({ msg: 'Failed to send OTP', error: err.message || 'Unknown error' });
  }
};


exports.resendOTP = async (req, res) => {
  const { email, type = 'email' } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await user.save();

    // Try to send email, but don't fail the whole request if email fails
    try {
      await sendOTPEmail(email, otp, type);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Still return success to the client but log the email error
      return res.status(200).json({ 
        msg: 'OTP generated successfully. Note: Email delivery failed, but OTP is valid.',
        email: email
      });
    }

    res.status(200).json({ 
      msg: 'OTP resent successfully',
      email: email
    });
  } catch (err) {
    console.error('Resend OTP Error:', err);
    res.status(500).json({ msg: 'Failed to resend OTP' });
  }
};


exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      'otp.code': otp,
      'otp.expiresAt': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    
    user.otp = undefined;
    await user.save();

    res.status(200).json({ 
      msg: 'OTP verified successfully',
      token: resetToken 
    });
  } catch (err) {
    console.error('Reset OTP Verification Error:', err);
    res.status(500).json({ msg: 'Failed to verify OTP' });
  }
};


exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ msg: 'Invalid reset token' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('Password Reset Error:', err);
    res.status(500).json({ msg: 'Failed to reset password' });
  }
};