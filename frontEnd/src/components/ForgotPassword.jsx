import React, { useState } from 'react';
import { Mail, ArrowLeft, Palette, CheckCircle, AlertCircle, Loader, Lock } from 'lucide-react';
import { authAPI } from '../services/api';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle Send Reset Link
  const handleSendResetLink = () => {
    setMessage({ type: '', text: '' });

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      setMessage({ type: 'success', text: 'Password reset link sent successfully!' });
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // if (response.ok) {
      //   setEmailSent(true);
      //   setMessage({ type: 'success', text: 'Password reset link sent!' });
      // } else {
      //   setMessage({ type: 'error', text: 'Email not found in our system' });
      // }
    }, 1500);
  };

  // Handle Resend Email
  const handleResendEmail = () => {
    setEmailSent(false);
    setMessage({ type: '', text: '' });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendResetLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <span className="text-2xl sm:text-3xl font-bold text-white">ArtBazaar</span>
          </div>
          <p className="text-sm sm:text-base text-white/80">Pakistan's Premier Art Marketplace</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Back to Login */}
          <a
            href="/login"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to Login
          </a>

          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Message Alert */}
              {message.text && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm">{message.text}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSendResetLink}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">💡</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• You'll receive an email with reset instructions</li>
                      <li>• The link will expire in 1 hour</li>
                      <li>• Check your spam folder if you don't see it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
                  We've sent password reset instructions to
                </p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base mb-6 sm:mb-8">{email}</p>

                {/* Info Card */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-100">
                  <div className="space-y-3 sm:space-y-4 text-left">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">1</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Check your inbox</p>
                        <p className="text-xs sm:text-sm text-gray-600">Look for an email from ArtBazaar</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">2</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Click the reset link</p>
                        <p className="text-xs sm:text-sm text-gray-600">This link expires in 1 hour</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-bold">3</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Create new password</p>
                        <p className="text-xs sm:text-sm text-gray-600">Choose a strong, unique password</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Didn't receive email? */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600">Didn't receive the email?</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleResendEmail}
                      className="flex-1 px-4 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-700 transition"
                    >
                      Resend Email
                    </button>
                    <button
                      onClick={() => setEmail('')}
                      className="flex-1 px-4 py-2.5 sm:py-3 bg-white text-gray-700 rounded-lg font-medium text-sm sm:text-base border-2 border-gray-300 hover:bg-gray-50 transition"
                    >
                      Try Different Email
                    </button>
                  </div>
                </div>

                {/* Spam notice */}
                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <span className="font-medium">📬 Can't find it?</span> Check your spam or junk folder. Sometimes our emails end up there.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="my-5 sm:my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 sm:px-4 text-gray-500 text-xs sm:text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign In
              </a>
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign Up
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-xs sm:text-sm mt-4 sm:mt-6">
          © 2026 ArtBazaar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// ... existing code ...

// Handle Send Reset Link
const handleSendResetLink = async () => {
  setMessage({ type: '', text: '' });

  if (!email) {
    setMessage({ type: 'error', text: 'Please enter your email address' });
    return;
  }

  if (!validateEmail(email)) {
    setMessage({ type: 'error', text: 'Please enter a valid email address' });
    return;
  }

  setLoading(true);

  try {
    const response = await authAPI.forgotPassword(email);
    setLoading(false);
    setEmailSent(true);
    setMessage({ type: 'success', text: response.message });
  } catch (error) {
    setLoading(false);
    setMessage({
      type: 'error',
      text: error.response?.data?.message || 'Failed to send reset link'
    });
  }
};
export default ForgotPassword;