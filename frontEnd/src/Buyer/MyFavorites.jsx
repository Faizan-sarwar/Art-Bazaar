import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, Star,
  Eye, Grid, List, Loader, AlertCircle, Sparkles
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

export default function MyFavorites() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await wishlistAPI.get();
        setWishlist(data.wishlist || []);
      } catch (err) {
        // Safe Token Handling: If unauthorized, clear list gracefully instead of crashing
        if (err.message.toLowerCase().includes('not authorized') || err.message.toLowerCase().includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load favorites: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [navigate]);

  const handleRemove = async (artworkId) => {
    setRemoving(artworkId);
    try {
      await wishlistAPI.toggle(artworkId);
      setWishlist(prev => prev.filter(a => a._id !== artworkId));
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="My Favorites"
          subtitle={loading ? 'Loading...' : `${wishlist.length} saved artworks`}
        />

        {/* Global Layout Wrapper Updated */}
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {/* Toolbar */}
          {!loading && wishlist.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm font-medium">
                <span className="font-black text-gray-900">{wishlist.length}</span> artworks saved
              </p>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-semibold">Loading your curated favorites...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <p className="text-gray-900 font-black text-lg mb-2">Oops! Something went wrong</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>

          ) : wishlist.length === 0 ? (
            /* Beautiful Empty State UI */
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-red-50 rounded-full w-full h-full flex items-center justify-center border-4 border-white shadow-md">
                  <Heart className="w-12 h-12 text-red-400 fill-red-200" />
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-2xl mb-2 tracking-tight">Your Wishlist is Empty</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                Build your personal gallery. Tap the ❤️ icon on any artwork to save it here for later.
              </p>
              <Link to="/buyer/browse">
                <button className="px-8 py-3.5 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700 transition shadow-xl shadow-purple-200 flex items-center justify-center gap-2 mx-auto">
                  <Sparkles className="w-4 h-4" /> Discover Masterpieces
                </button>
              </Link>
            </div>

          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {wishlist.map(item => (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <span className="px-4 py-1.5 bg-red-500 text-white text-xs font-black tracking-widest rounded-xl shadow-lg">SOLD</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-purple-700 text-xs font-bold rounded-lg shadow-sm">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={removing === item._id}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-xl shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {removing === item._id
                        ? <Loader className="w-4 h-4 text-red-500 animate-spin" />
                        : <Trash2 className="w-4 h-4 text-red-500" />
                      }
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{item.title}</h3>
                    <p className="text-gray-500 text-xs mb-3 font-medium">by {item.artistName}</p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold">
                          {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      {item.numReviews > 0 && (
                        <span className="text-gray-400 text-xs font-semibold">({item.numReviews})</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`font-black text-lg ${item.isAvailable ? 'text-purple-700' : 'text-gray-400 line-through'}`}>
                        PKR {item.price?.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/buyer/artwork/${item._id}`}>
                          <button className="p-2 border border-gray-200 rounded-xl hover:border-purple-300 hover:text-purple-600 transition bg-gray-50 hover:bg-purple-50">
                            <Eye className="w-4 h-4 text-gray-500 hover:text-purple-600" />
                          </button>
                        </Link>
                        {item.isAvailable && (
                          <Link to="/buyer/checkout" state={{ artworkId: item._id }}>
                            <button className="px-3.5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-purple-700 transition shadow-md shadow-purple-200">
                              <ShoppingCart className="w-3.5 h-3.5" /> Buy
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="space-y-4">
              {wishlist.map(item => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex hover:shadow-md transition">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-gray-100 relative">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white text-xs font-black tracking-widest">SOLD</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{item.title}</h3>
                        <p className="text-gray-500 text-sm mt-0.5 truncate">by {item.artistName} <span className="mx-1">·</span> {item.category}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-bold">
                              {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removing === item._id}
                        className="p-2 hover:bg-red-50 rounded-xl transition flex-shrink-0 border border-gray-100 hover:border-red-100 disabled:opacity-50"
                      >
                        {removing === item._id
                          ? <Loader className="w-4 h-4 text-red-400 animate-spin" />
                          : <Trash2 className="w-4 h-4 text-red-400" />
                        }
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`font-black text-xl ${item.isAvailable ? 'text-purple-700' : 'text-gray-400 line-through'}`}>
                        PKR {item.price?.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/buyer/artwork/${item._id}`}>
                          <button className="p-2 border border-gray-200 rounded-xl hover:border-purple-300 hover:text-purple-600 transition bg-gray-50 hover:bg-purple-50">
                            <Eye className="w-5 h-5 text-gray-500 hover:text-purple-600" />
                          </button>
                        </Link>
                        {item.isAvailable && (
                          <Link to="/buyer/checkout" state={{ artworkId: item._id }}>
                            <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition shadow-md shadow-purple-200">
                              <ShoppingCart className="w-4 h-4" /> Buy Now
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}