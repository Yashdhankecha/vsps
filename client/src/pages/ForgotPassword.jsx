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
      
      // Check if there's a note about email delivery failure
      if (response.msg.includes('Email delivery failed')) {
        setError('Note: Email delivery failed, but OTP was generated. Contact admin for assistance.');
        // In a real app, you'd have a better way to get the OTP to the user
        // For now, we'll proceed to the OTP step
      }
      
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
      const response = await resendOTP(email);
      setResendTimer(60);
      setError('');
      
      // Check if there's a note about email delivery failure
      if (response.msg && response.msg.includes('Email delivery failed')) {
        setError('Note: Email delivery failed, but OTP was generated. Contact admin for assistance.');
      }
    } catch (error) {
      console.error('Resend OTP Error:', error); // Debug log
      setError(error.msg || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-mesh py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-effect p-8 rounded-xl shadow-lg border border-white/10">
        {step === 'email' && (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Reset your password
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-300">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FaEnvelope className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-electric hover:shadow-lg hover:shadow-electric-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-electric-500 transition-all duration-300 transform hover:scale-105 shadow-lg ${
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
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Enter OTP
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-300">
                Please enter the 6-digit OTP sent to<br/>
                <span className="font-medium text-electric-400">{email}</span>
              </p>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
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
                    className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500 bg-neutral-800/50 border-white/20 text-white"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-electric hover:shadow-lg hover:shadow-electric-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-electric-500 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-neutral-400">
                    Resend OTP in {resendTimer} seconds
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-electric-400 hover:text-electric-300"
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
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Set New Password
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-300">
                Please enter your new password below.
              </p>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FaLock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500"
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
                    <FaLock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-lg block w-full pl-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-electric hover:shadow-lg hover:shadow-electric-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-electric-500 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-4">
          <Link to="/auth" className="text-sm text-electric-400 hover:text-electric-300 flex items-center justify-center">
            <FaArrowLeft className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;