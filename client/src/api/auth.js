import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Registration failed' };
  }
};

// Verify Email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { 
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
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to send OTP' };
  }
};

// Reset Password with new password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to reset password' };
  }
};

// Verify Reset Password OTP
export const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-reset-otp`, { 
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
    const response = await axios.post(`${API_URL}/resend-otp`, { 
      email,
      type 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Failed to resend OTP' };
  }
};