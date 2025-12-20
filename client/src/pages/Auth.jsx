import { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaUser, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from '../utils/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { verifyEmailOTP, resendOTP } from '../api/auth'; // Import the API function

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', // Only for client-side validation
  });
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if registration is successful
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to check if it's valid
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid, redirect based on role
          if (['admin', 'superadmin', 'manager', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager'].includes(decodedToken.role)) {
            navigate('/admin/dashboard');
          } else if (decodedToken.role === 'committeemember') {
            navigate('/committee/dashboard');
          } else {
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
              localStorage.removeItem('redirectAfterLogin');
              window.location.href = redirectPath;
            } else {
              const selectedBookingDate = localStorage.getItem('selectedBookingDate');
              if (selectedBookingDate) {
                localStorage.removeItem('selectedBookingDate');
                navigate('/booking');
              } else {
                window.location.href = '/';
              }
            }
          }
        } else {
          // Token is expired, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOTPChange = (index, value) => {
    if (value === '' || /^\d$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      // Auto-focus next input
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
  
    const data = isLogin
      ? { email: formData.email, password: formData.password }
      : { username: formData.name, email: formData.email, password: formData.password };
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await axios.post(endpoint, data);
  
      if (isLogin) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          try {
            const decodedToken = JSON.parse(atob(response.data.token.split('.')[1]));
            // Redirect based on role
            if (['admin', 'superadmin', 'manager', 'usermanager', 'contentmanager', 'formmanager', 'bookingmanager', 'contactmanager'].includes(decodedToken.role)) {
              navigate('/admin/dashboard');
            } else if (decodedToken.role === 'committeemember') {
              navigate('/committee/dashboard');
            } else {
              const redirectPath = localStorage.getItem('redirectAfterLogin');
              if (redirectPath) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectPath;
              } else {
                const selectedBookingDate = localStorage.getItem('selectedBookingDate');
                if (selectedBookingDate) {
                  localStorage.removeItem('selectedBookingDate');
                  navigate('/booking');
                } else {
                  window.location.href = '/';
                }
              }
            }
          } catch (error) {
            console.error('Error processing login response:', error);
            setError('An error occurred during login. Please try again.');
          }
        }
      } else {
        setShowOTPVerification(true);
        setOtpEmail(formData.email);
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    const combinedOTP = otpValues.join('');
    if (combinedOTP.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyEmailOTP(otpEmail, combinedOTP);
      setVerificationSuccess(true);
      setTimeout(() => {
        setShowOTPVerification(false);
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setIsLoading(true);
      setError('');
      
      await resendOTP(otpEmail, 'email');
      
      setResendTimer(60); 
      setError('');
    } catch (error) {
      console.error('Resend OTP Error:', error);
      setError(error.msg || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (showOTPVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass-effect p-8 rounded-xl shadow-lg border border-white/10">
          {verificationSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-bounce">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Email verified successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                  Verify your email
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-300">
                  Please enter the 6-digit OTP sent to<br/>
                  <span className="font-medium text-electric-400">{otpEmail}</span>
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-md p-3 text-sm text-center">
                  {error}
                </div>
              )}
              
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
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500 bg-neutral-800/50 border-white/20 text-white"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-electric hover:shadow-lg hover:shadow-electric-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div className="mt-4">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-neutral-400">
                        Resend OTP in {resendTimer} seconds
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-sm text-electric-400 hover:text-electric-300 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-effect p-8 rounded-xl shadow-lg border border-white/10">
        {isSubmitted ? (
          <div className="text-center py-8">
            {/* Success Animation */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-bounce">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-white">Check your email</h3>
            <p className="mt-2 text-sm text-neutral-300">
              We've sent a verification link to <span className="font-semibold text-electric-400">{formData.email}</span>.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsLogin(true)}
                className="text-electric-400 hover:text-electric-300 font-medium"
              >
                Return to login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-center text-sm text-neutral-300">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-electric-400 hover:text-electric-300"
                >
                  {isLogin ? 'Register here' : 'Sign in'}
                </button>
              </p>
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-md p-3 text-sm text-center">
                {error}
              </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500 focus:z-10 sm:text-sm"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500 focus:z-10 sm:text-sm"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500 focus:z-10 sm:text-sm"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <FaEye className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 bg-neutral-800/50 border border-white/20 placeholder-neutral-400 text-white focus:outline-none focus:ring-electric-500 focus:border-electric-500 focus:z-10 sm:text-sm"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-electric-500 focus:ring-electric-500 border-white/20 bg-neutral-800/50 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/ForgotPassword" className="font-medium text-electric-400 hover:text-electric-300">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-electric hover:shadow-lg hover:shadow-electric-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500 transition-all duration-200 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Processing...' : isLogin ? 'Sign in' : 'Register'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;