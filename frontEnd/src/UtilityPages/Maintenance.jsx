import React from 'react';
import { 
  Wrench, Clock, AlertTriangle, RefreshCw, Mail, Phone, Palette
} from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Illustration */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4 sm:mb-6 animate-pulse">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-600 animate-bounce" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 sm:mb-8 px-4">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">ArtBazaar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            We're Under Maintenance
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back shortly!
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 mx-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Estimated Downtime</h2>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
            2 Hours
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Expected completion: Today at 6:00 PM PKT</p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-1 mx-auto sm:mx-0" />
              <div className="text-left w-full">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base text-center sm:text-left">
                  What we're working on:
                </h3>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5 sm:space-y-2">
                  <li>✨ Improving platform performance</li>
                  <li>🔒 Enhancing security features</li>
                  <li>🎨 Adding new artwork categories</li>
                  <li>📱 Mobile app optimizations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600">
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm">This page will auto-refresh when we're back</span>
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 mx-4">
          <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Need Immediate Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <a 
              href="mailto:support@artbazaar.com"
              className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition group"
            >
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Email Us</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">support@artbazaar.com</div>
              </div>
            </a>
            <a 
              href="tel:+923001234567"
              className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition group"
            >
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Call Us</div>
                <div className="text-xs sm:text-sm text-gray-600">+92 300 1234567</div>
              </div>
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center px-4">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Stay updated on our social media</p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <a 
              href="#" 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition transform hover:scale-110"
            >
              <span className="text-purple-600 font-bold text-base sm:text-lg">f</span>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition transform hover:scale-110"
            >
              <span className="text-blue-600 font-bold text-base sm:text-lg">in</span>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition transform hover:scale-110"
            >
              <span className="text-pink-600 font-bold text-base sm:text-lg">ig</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;