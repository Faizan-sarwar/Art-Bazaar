import React from 'react';
import { 
  Home, Search, ArrowLeft, Palette, MessageCircle, Phone
} from 'lucide-react';

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full text-center">
          {/* Animated 404 */}
          <div className="mb-6 sm:mb-8 relative">
            <div className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 leading-none animate-pulse">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-purple-300 animate-bounce" />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6 sm:mb-8 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto">
              The artwork you're looking for seems to have wandered off the canvas. 
              Let's get you back on track!
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6 sm:mb-8">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Don't worry, our artists are still creating amazing work!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-xl font-semibold text-base sm:text-lg border-2 border-purple-600 hover:bg-purple-50 transition"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mx-4">
            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <a 
                href="/browse" 
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-purple-50 transition group"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Browse Art</span>
              </a>
              <a 
                href="/artists" 
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-purple-50 transition group"
              >
                <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Artists</span>
              </a>
              <a 
                href="/contact" 
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-purple-50 transition group"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Contact</span>
              </a>
              <a 
                href="/help" 
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-purple-50 transition group"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:scale-110 transition" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Help</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;