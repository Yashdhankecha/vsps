import axios from '../utils/axiosConfig';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Registration failed' };
  }
};

// Verify Email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await axios.post('/api/auth/verify-otp', { 
      email, 
      otp
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to verify OTP' };
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to send OTP' };
  }
};

// Reset Password with new password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post('/api/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to reset password' };
  }
};

// Verify Reset Password OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axios.post('/api/auth/verify-reset-otp', { 
      email, 
      otp 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to verify OTP' };
  }
};

// Resend OTP
export const resendOTP = async (email, type = 'email') => {
  try {
    const response = await axios.post('/api/auth/resend-otp', { 
      email,
      type 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to resend OTP' };
  }
};