import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Package, Download, Star, Home, 
  ShoppingBag, Palette, Share2, Twitter, Facebook, 
  MessageCircle, ArrowRight, Gift
} from 'lucide-react';

const SuccessPage = () => {
  const [countdown, setCountdown] = useState(10);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Sample order data (would come from URL params or state in real app)
  const orderData = {
    orderNumber: "ORD-2026-00123",
    artworkTitle: "Sunset Over Hunza",
    artistName: "Ayesha Khan",
    price: 25000,
    orderDate: "January 11, 2026",
    deliveryAddress: "123 Main Street, Islamabad, Pakistan",
    estimatedDelivery: "January 18, 2026",
    paymentMethod: "JazzCash",
    artworkImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=500&fit=crop"
  };

  const nextSteps = [
    {
      icon: Package,
      title: "Track Your Order",
      desc: "Monitor real-time delivery updates from your dashboard",
      action: "/orders"
    },
    {
      icon: Download,
      title: "Download Receipt",
      desc: "Get your order confirmation and invoice",
      action: "#"
    },
    {
      icon: Star,
      title: "Rate Your Experience",
      desc: "Help us improve by sharing your feedback",
      action: "#"
    }
  ];

  const relatedArtworks = [
    { 
      id: 1, 
      title: "Mountain Serenity", 
      artist: "Sara Ahmed", 
      price: 28000,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
    },
    { 
      id: 2, 
      title: "Urban Dreams", 
      artist: "Hassan Ali", 
      price: 18000,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop"
    },
    { 
      id: 3, 
      title: "Heritage Patterns", 
      artist: "Fatima Noor", 
      price: 32000,
      image: "https://images.unsplash.com/photo-1578926078640-e4f4a2e4b576?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">ArtBazaar</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-sm text-gray-700 hover:text-purple-600 transition">Home</a>
              <a href="/browse" className="text-sm text-gray-700 hover:text-purple-600 transition">Browse</a>
              <a href="/orders" className="text-sm text-gray-700 hover:text-purple-600 transition">My Orders</a>
            </div>

            <a 
              href="/dashboard"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
            >
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Success Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Success Animation */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block relative mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-800" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Order Successful! 🎉
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-2">
            Thank you for your purchase!
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Order #{orderData.orderNumber}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Order Summary
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
            <img 
              src={orderData.artworkImage} 
              alt={orderData.artworkTitle}
              className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {orderData.artworkTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                by <span className="font-semibold text-purple-600">{orderData.artistName}</span>
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xl sm:text-2xl font-bold text-purple-600">
                  PKR {orderData.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
            <div>
              <p className="text-gray-500 mb-1">Order Date</p>
              <p className="font-semibold text-gray-900">{orderData.orderDate}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900">{orderData.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">{orderData.estimatedDelivery}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Delivery Address</p>
              <p className="font-semibold text-gray-900">{orderData.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-gray-700 text-center">
            📧 A confirmation email has been sent to your registered email address with order details and tracking information.
          </p>
        </div>

        {/* Next Steps */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            What's Next?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {nextSteps.map((step, index) => (
              <a
                key={index}
                href={step.action}
                className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition text-center group"
              >
                <div className="inline-block p-3 sm:p-4 bg-purple-100 rounded-full mb-3 sm:mb-4 group-hover:bg-purple-200 transition">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">{step.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-8 mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Share Your Purchase
          </h3>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-700 transition">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              Facebook
            </button>
            <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-500 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-sky-600 transition">
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              Twitter
            </button>
            <button className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-green-700 transition">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Explore More Artworks
          </h2>
          <p className="text-sm sm:text-base text-white/90 mb-6 sm:mb-8">
            Discover similar pieces from talented Pakistani artists
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {relatedArtworks.map((artwork) => (
              <div key={artwork.id} className="bg-white rounded-lg overflow-hidden group cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    by {artwork.artist}
                  </p>
                  <p className="font-bold text-purple-600 text-sm sm:text-base">
                    PKR {artwork.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/browse"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              Continue Shopping
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-lg font-bold text-sm sm:text-base border-2 border-white hover:bg-white hover:text-purple-600 transition"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Go to Dashboard
            </a>
          </div>
        </div>

        {/* Auto Redirect Notice */}
        {countdown > 0 && (
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Redirecting to dashboard in <span className="font-bold text-purple-600">{countdown}</span> seconds...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <span className="text-lg sm:text-2xl font-bold">ArtBazaar</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Pakistan's premier online art marketplace
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              © 2026 ArtBazaar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuccessPage;