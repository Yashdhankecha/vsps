import { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyResetOTP, resetPassword, resendOTP } from '../api/auth';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // email, otp, newPassword
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await forgotPassword(email);
      console.log('OTP Send Response:', response); // Debug log
      setStep('otp');
      setResendTimer(60);
    } catch (error) {
      console.error('OTP Send Error:', error); // Debug log
      setError(error.msg || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value === '' || /^\d$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      if (value !== '' && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyResetOTP(email, otp);
      setResetToken(response.token);
      setStep('newPassword');
    } catch (error) {
      setError(error.msg || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(resetToken, newPassword);
      alert('Password reset successful! Please login with your new password.');
      navigate('/auth');
    } catch (error) {
      console.error('Password Reset Error:', error); // Debug log
      setError(error.msg || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email);
      setResendTimer(60);
      setError('');
    } catch (error) {
      console.error('Resend OTP Error:', error); // Debug log
      setError(error.msg || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {step === 'email' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Reset your password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Enter OTP
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please enter the 6-digit OTP sent to<br/>
                <span className="font-medium text-purple-600">{email}</span>
              </p>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form className="mt-8 space-y-6" onSubmit={handleOTPVerification}>
              <div className="flex justify-center space-x-2">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in {resendTimer} seconds
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-purple-600 hover:text-purple-500"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        {step === 'newPassword' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Set New Password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your new password
              </p>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="sr-only">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-4">
          <Link
            to="/auth"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;