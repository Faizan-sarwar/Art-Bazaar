import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Palette, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [forgotEmail, setForgotEmail] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setMessage({ type: '', text: '' });

    if (!loginForm.email || !loginForm.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    if (!validateEmail(loginForm.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

      setTimeout(() => {
        if (response.user.role === 'artist') navigate('/seller/home');
        else if (response.user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/buyer/home');
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ type: '', text: '' });

    if (!forgotEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: forgotEmail });
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to send reset email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentPage === 'login') handleLogin();
      else handleForgotPassword();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <span className="text-2xl sm:text-3xl font-bold text-white">ArtBazaar</span>
          </div>
          <p className="text-sm sm:text-base text-white/80">Pakistan's Premier Art Marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8">

          {/* Message */}
          {message.text && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success'
                ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              }
              <span className="text-xs sm:text-sm">{message.text}</span>
            </div>
          )}

          {/* ── LOGIN ── */}
          {currentPage === 'login' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Sign in to continue your art journey</p>

              <div className="space-y-4 sm:space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-700">Remember me</span>
                  </label>
                  <button
                    onClick={() => { setCurrentPage('forgot'); setMessage({ type: '', text: '' }); }}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </div>

              <div className="my-5 sm:my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-3 sm:px-4 text-gray-500 text-xs sm:text-sm">OR</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              <p className="text-center text-sm sm:text-base text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">Sign Up</a>
              </p>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {currentPage === 'forgot' && (
            <div>
              <button
                onClick={() => { setCurrentPage('login'); setMessage({ type: '', text: '' }); }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Back to Login
              </button>

              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </div>

              <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  The reset link will be sent to your email and will expire in 1 hour.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/80 text-xs sm:text-sm mt-4 sm:mt-6">
          © 2026 ArtBazaar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;