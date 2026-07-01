import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Star, ChevronRight, Sparkles,
  Play, ArrowRight, ShoppingBag, Palette,
  Users, Award, Heart, Loader, Eye, Package, Shield, Wand2
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { artworkAPI, orderAPI, wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = [
  { name: 'Landscapes', icon: '🏔️', cat: 'Landscape' },
  { name: 'Abstract', icon: '🎨', cat: 'Abstract' },
  { name: 'Portraits', icon: '👤', cat: 'Portraits' },
  { name: 'Traditional', icon: '🕌', cat: 'Traditional' },
  { name: 'Modern', icon: '✨', cat: 'Modern' },
  { name: 'Calligraphy', icon: '✍️', cat: 'Calligraphy' },
];

export default function BuyerHomePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [artRes, ordRes, wishRes] = await Promise.all([
          artworkAPI.getAll({ limit: 8, isApproved: true }),
          orderAPI.getMyOrders(),
          wishlistAPI.get()
        ]);

        setArtworks(artRes.artworks || []);
        setOrders((ordRes.orders || []).slice(0, 3));

        const favs = (wishRes.wishlist || []);
        setFavorites(favs.map(w => typeof w === 'object' ? w._id : w));

        // --- ISSUE #24: Personalized Recommendations Logic ---
        if (favs.length > 0) {
          // Extract categories from wishlist items
          const categories = favs.filter(w => typeof w === 'object').map(w => w.category);
          // Find the most frequent category
          if (categories.length > 0) {
            const mostFrequentCat = categories.sort((a, b) =>
              categories.filter(v => v === a).length - categories.filter(v => v === b).length
            ).pop();

            // Fetch artworks matching their favorite category
            const recRes = await artworkAPI.getAll({ category: mostFrequentCat, limit: 4, isApproved: true });
            // Exclude artworks they already wishlisted
            const filteredRecs = (recRes.artworks || []).filter(a => !favs.some(f => (f._id || f) === a._id));
            setRecommended(filteredRecs);
          }
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId) return;
    setTogglingId(id);
    try {
      const res = await wishlistAPI.toggle(id);
      if (res.isWishlisted) setFavorites(prev => [...prev, id]);
      else setFavorites(prev => prev.filter(fId => fId !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <Loader className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    </div>
  );

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  // Helper to render an artwork card (Used for Featured & Recommended)
  const renderArtworkCard = (art) => {
    const isSold = !art.isAvailable;
    return (
      <Link to={isSold ? '#' : `/buyer/artwork/${art._id}`} key={art._id}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-purple-200 transition-all">
          <div className="h-48 sm:h-56 bg-gray-100 relative overflow-hidden">
            <img
              src={getImageUrl(art.image)}
              alt={art.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSold ? 'opacity-50 grayscale' : ''}`}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {!isSold && (
              <button
                onClick={e => toggleFavorite(art._id, e)}
                disabled={togglingId === art._id}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition disabled:opacity-50"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            )}
            {isSold && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-500 text-white font-black text-sm px-4 py-1.5 rounded-lg tracking-widest shadow-lg">SOLD</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
              {art.isAuthenticated && <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0" title="Verified Authentic" />}
            </div>
            <p className="text-xs text-gray-500 mb-3 truncate">by {art.artistName}</p>
            <div className="flex items-center justify-between">
              <span className={`font-black text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-700'}`}>
                PKR {art.price?.toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                </div>
                {art.sales > 0 && (
                  <span className="text-xs text-gray-400">({art.sales})</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Discover"
          subtitle="Find your next masterpiece"
        />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8">

          {/* Active Orders Banner */}
          {activeOrders.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">You have {activeOrders.length} active order(s)</h3>
                  <p className="text-blue-100 text-sm">Track your recent purchases in real-time.</p>
                </div>
              </div>
              <Link to="/buyer/orders">
                <button className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition w-full sm:w-auto shadow-sm">
                  Track Orders
                </button>
              </Link>
            </div>
          )}

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {CATEGORIES.map(c => (
                <Link to={`/buyer/browse?category=${c.cat}`} key={c.name}>
                  <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-purple-300 hover:shadow-md transition group cursor-pointer h-full flex flex-col justify-center">
                    <span className="text-2xl sm:text-3xl mb-2 block group-hover:scale-110 transition-transform">{c.icon}</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">{c.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ISSUE #24: Recommended For You Section */}
          {recommended.length > 0 && (
            <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" /> Recommended For You
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {recommended.map(renderArtworkCard)}
              </div>
            </div>
          )}

          {/* Featured Artworks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Featured Artworks
              </h2>
              <Link to="/buyer/browse" className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {artworks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No artworks available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {artworks.map(renderArtworkCard)}
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl p-6 text-white text-center shadow-xl shadow-pink-200/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <div className="relative">
              <h2 className="text-xl font-black mb-2 text-white">Support Pakistani Artists 🇵🇰</h2>
              <p className="text-pink-100 text-sm mb-4">
                Every purchase directly supports local artists and their families
              </p>
              <Link to="/buyer/browse">
                <button className="bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-50 transition inline-flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" /> Explore All Artworks
                </button>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}