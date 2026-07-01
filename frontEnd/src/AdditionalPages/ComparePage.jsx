import React, { useState } from 'react';
import { 
  Palette, X, Plus, Check, Star, Heart, ShoppingCart, 
  Share2, Ruler, Droplet, Frame, Package, User, DollarSign
} from 'lucide-react';

const ComparePage = () => {
  // Sample artworks (in real app, these would come from URL params or state)
  const [compareItems, setCompareItems] = useState([
    {
      id: 1,
      title: "Sunset Over Hunza",
      artist: "Ayesha Khan",
      price: 25000,
      originalPrice: 30000,
      rating: 4.9,
      reviews: 23,
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=500&fit=crop",
      medium: "Oil on Canvas",
      size: "24x36 inches",
      frame: "Included",
      delivery: "5-7 days",
      inStock: true,
      verified: true,
      featured: true
    },
    {
      id: 2,
      title: "Urban Dreams",
      artist: "Hassan Ali",
      price: 18000,
      originalPrice: null,
      rating: 4.8,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop",
      medium: "Acrylic",
      size: "20x30 inches",
      frame: "Not Included",
      delivery: "3-5 days",
      inStock: true,
      verified: true,
      featured: false
    },
    {
      id: 3,
      title: "Heritage Patterns",
      artist: "Fatima Noor",
      price: 32000,
      originalPrice: null,
      rating: 5.0,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1578926078640-e4f4a2e4b576?w=500&h=500&fit=crop",
      medium: "Watercolor",
      size: "18x24 inches",
      frame: "Included",
      delivery: "7-10 days",
      inStock: true,
      verified: true,
      featured: true
    }
  ]);

  const removeItem = (id) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  const comparisonFeatures = [
    { label: "Price", icon: DollarSign, key: "price" },
    { label: "Artist", icon: User, key: "artist" },
    { label: "Medium", icon: Droplet, key: "medium" },
    { label: "Size", icon: Ruler, key: "size" },
    { label: "Frame", icon: Frame, key: "frame" },
    { label: "Delivery Time", icon: Package, key: "delivery" },
    { label: "Rating", icon: Star, key: "rating" },
    { label: "Reviews", icon: Star, key: "reviews" },
    { label: "Availability", icon: Check, key: "inStock" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <a href="/compare" className="text-sm text-purple-600 font-semibold">Compare</a>
            </div>

            <a 
              href="/login"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Compare Artworks
          </h1>
          <p className="text-sm sm:text-base text-white/90">
            Compare features, prices, and details to make the best choice
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {compareItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                No Artworks to Compare
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                Start browsing artworks and add them to comparison to see side-by-side details
              </p>
              <a
                href="/browse"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Browse Artworks
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Add More Button */}
            <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm sm:text-base text-gray-600">
                Comparing <span className="font-bold text-purple-600">{compareItems.length}</span> artworks
              </p>
              {compareItems.length < 4 && (
                <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" />
                  Add More
                </button>
              )}
            </div>

            {/* Comparison Table - Mobile View (Stacked Cards) */}
            <div className="lg:hidden space-y-4 sm:space-y-6">
              {compareItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative">
                    <img src={item.image} alt={item.title} className="w-full aspect-square object-cover" />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {item.featured && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">by {item.artist}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Price</span>
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-purple-600">
                            PKR {item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through ml-2">
                              PKR {item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Medium</span>
                        <span className="text-sm font-semibold text-gray-900">{item.medium}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Size</span>
                        <span className="text-sm font-semibold text-gray-900">{item.size}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Frame</span>
                        <span className="text-sm font-semibold text-gray-900">{item.frame}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Delivery</span>
                        <span className="text-sm font-semibold text-gray-900">{item.delivery}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
                          <span className="text-xs text-gray-500">({item.reviews})</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          In Stock
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-5">
                      <button className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </button>
                      <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span className="sm:hidden">Save</span>
                      </button>
                      <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        <span className="sm:hidden">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table - Desktop View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 xl:px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40 xl:w-48">
                        Feature
                      </th>
                      {compareItems.map((item) => (
                        <th key={item.id} className="px-4 xl:px-6 py-4 text-center">
                          <div className="relative">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Images Row */}
                    <tr className="border-b border-gray-200">
                      <td className="px-4 xl:px-6 py-4 text-sm font-medium text-gray-900">
                        Artwork
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="px-4 xl:px-6 py-4">
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            {item.featured && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded">
                                Featured
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 mt-3 mb-1 text-sm xl:text-base">{item.title}</h3>
                          <p className="text-xs xl:text-sm text-gray-600">by {item.artist}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Price Row */}
                    <tr className="border-b border-gray-200 bg-purple-50">
                      <td className="px-4 xl:px-6 py-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Price</span>
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="px-4 xl:px-6 py-4 text-center">
                          <div className="text-lg xl:text-xl font-bold text-purple-600">
                            PKR {item.price.toLocaleString()}
                          </div>
                          {item.originalPrice && (
                            <div className="text-xs xl:text-sm text-gray-400 line-through">
                              PKR {item.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Other Features */}
                    {comparisonFeatures.slice(1).map((feature, index) => (
                      <tr key={feature.key} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                        <td className="px-4 xl:px-6 py-4 flex items-center gap-2">
                          <feature.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                        </td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 xl:px-6 py-4 text-center">
                            {feature.key === 'rating' ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-sm">{item[feature.key]}</span>
                              </div>
                            ) : feature.key === 'reviews' ? (
                              <span className="text-sm text-gray-600">{item[feature.key]} reviews</span>
                            ) : feature.key === 'inStock' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                <Check className="w-3 h-3" />
                                In Stock
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">{item[feature.key]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Actions Row */}
                    <tr className="bg-gray-50">
                      <td className="px-4 xl:px-6 py-4 text-sm font-medium text-gray-900">
                        Actions
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="px-4 xl:px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <button className="w-full px-3 xl:px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Buy Now
                            </button>
                            <div className="flex gap-2">
                              <button className="flex-1 px-3 xl:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
                                <Heart className="w-4 h-4" />
                                <span className="hidden xl:inline">Save</span>
                              </button>
                              <button className="flex-1 px-3 xl:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden xl:inline">Share</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">💡 Comparison Tips:</h3>
              <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                <li>• Consider the medium and size that best fits your space</li>
                <li>• Check if framing is included to compare true costs</li>
                <li>• Review artist ratings and number of reviews for quality assurance</li>
                <li>• Factor in delivery time if you need the artwork by a specific date</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <span className="text-lg sm:text-2xl font-bold">ArtBazaar</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              © 2026 ArtBazaar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComparePage;