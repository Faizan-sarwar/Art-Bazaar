import React, { useState, useEffect } from 'react';
import { 
  Mail, RefreshCw, CheckCircle, XCircle, Palette
} from 'lucide-react';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [countdown, setCountdown] = useState(5);

  // Simulate email verification process
  useEffect(() => {
    if (verificationStatus === 'verifying') {
      const timer = setTimeout(() => {
        // Simulate random success/failure (in production, this would be based on API response)
        setVerificationStatus(Math.random() > 0.3 ? 'success' : 'failed');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  // Countdown for success redirect
  useEffect(() => {
    if (verificationStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success' && countdown === 0) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, [verificationStatus, countdown]);

  const handleResendVerification = () => {
    setVerificationStatus('verifying');
    setCountdown(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">ArtBazaar</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Verifying State */}
          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full mb-4 sm:mb-6 animate-pulse">
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 animate-spin" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Verifying Your Email
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Please wait while we verify your email address...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6 animate-bounce">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Email Verified! 🎉
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Your email has been successfully verified. You can now access all features of ArtBazaar.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-green-800">
                  Redirecting to your dashboard in <span className="font-bold text-green-600 text-base sm:text-lg">{countdown}</span> seconds...
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition"
              >
                Go to Dashboard Now
              </button>
            </div>
          )}

          {/* Failed State */}
          {verificationStatus === 'failed' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full mb-4 sm:mb-6">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Verification Failed
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                We couldn't verify your email. The link may have expired or is invalid.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-red-800 mb-2 sm:mb-3">
                  <strong>Possible reasons:</strong>
                </p>
                <ul className="text-xs sm:text-sm text-red-700 text-left space-y-1">
                  <li>• Verification link has expired</li>
                  <li>• Link was already used</li>
                  <li>• Invalid verification token</li>
                </ul>
              </div>
              <button 
                onClick={handleResendVerification}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition mb-2 sm:mb-3 inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Resend Verification Email
              </button>
              <button 
                onClick={() => window.location.href = '/support'}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-medium text-sm sm:text-base border-2 border-gray-300 hover:bg-gray-50 transition"
              >
                Contact Support
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-600">
            Having trouble? <a href="/support" className="text-purple-600 hover:text-purple-700 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;