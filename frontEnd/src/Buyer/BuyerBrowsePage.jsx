import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Star, SlidersHorizontal,
  Grid, List, ChevronDown, X, Sparkles,
  ShoppingCart, Loader, AlertCircle, Shield
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { artworkAPI, wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All', 'Landscape', 'Abstract', 'Traditional', 'Modern', 'Calligraphy', 'Portraits', 'Other'];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const SkeletonCard = ({ viewMode }) => (
  <div className={`bg-white rounded-3xl border border-gray-100 overflow-hidden ${viewMode === 'list' ? 'flex h-56' : 'h-[380px]'} animate-pulse`}>
    <div className={`${viewMode === 'list' ? 'w-56 h-full flex-shrink-0' : 'h-56 w-full'} bg-gray-200`}></div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
      </div>
      <div className="mt-4 flex justify-between items-end">
        <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const BuyerBrowsePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { isApproved: true };
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;

      const [artRes, wishRes] = await Promise.all([
        artworkAPI.getAll(params),
        wishlistAPI.get().catch(() => ({ wishlist: [] }))
      ]);

      let results = artRes.artworks || [];
      if (sortBy === 'price-low') results.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-high') results.sort((a, b) => b.price - a.price);
      if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
      if (sortBy === 'popular') results.sort((a, b) => b.views - a.views);

      setArtworks(results);
      setVisibleCount(12);
      setFavorites((wishRes.wishlist || []).map(w => typeof w === 'object' ? w._id : w));
    } catch (err) {
      setError(err.message || 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId) return;
    setTogglingId(id);
    try {
      const res = await wishlistAPI.toggle(id);
      if (res.isWishlisted) setFavorites(prev => [...prev, id]);
      else setFavorites(prev => prev.filter(f => f !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const visibleArtworks = artworks.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Browse Artworks"
          searchPlaceholder="Search paintings, artists..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide hide-scroll">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200 hidden sm:flex">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6" : "flex flex-col gap-4"}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} viewMode={viewMode} />)}
            </div>
          ) : artworks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mt-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No artworks found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any approved artworks matching your current filters. Try adjusting your category or search term.
              </p>
              <button
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-6 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6" : "flex flex-col gap-4"}>
                {visibleArtworks.map(art => {
                  const isSold = !art.isAvailable;
                  const content = (
                    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-purple-200 transition-all ${viewMode === 'list' ? 'flex flex-row h-40' : 'flex flex-col'}`}>
                      <div className={`${viewMode === 'list' ? 'w-40 sm:w-48 h-full flex-shrink-0' : 'h-56 w-full'} bg-gray-100 relative overflow-hidden`}>
                        <img
                          src={getImageUrl(art.image)}
                          alt={art.title}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'opacity-50 grayscale' : ''}`}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {!isSold && viewMode === 'grid' && (
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

                      <div className={`flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'p-4 sm:p-5' : 'p-4 sm:p-5'}`}>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <h3 className="font-bold text-gray-900 text-base line-clamp-1">{art.title}</h3>
                            {art.isAuthenticated && <Shield className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" title="Verified Authentic" />}
                          </div>
                          <p className="text-xs text-gray-500 mb-3 truncate">by {art.artistName}</p>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <p className={`font-black text-lg ${isSold ? 'text-gray-400 line-through' : 'text-purple-700'}`}>
                              PKR {art.price?.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                              </div>
                              {art.sales > 0 && (
                                <span className="text-xs text-gray-400">{art.sales} sold</span>
                              )}
                            </div>
                          </div>
                          {!isSold && viewMode === 'list' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={e => toggleFavorite(art._id, e)}
                                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition"
                              >
                                <Heart className={`w-4 h-4 ${favorites.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                              </button>
                              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                                <ShoppingCart className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return isSold
                    ? <div key={art._id}>{content}</div>
                    : <Link to={`/buyer/artwork/${art._id}`} key={art._id}>{content}</Link>;
                })}
              </div>

              {/* Load More Button */}
              {visibleCount < artworks.length && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount(v => v + 12)}
                    className="px-8 py-3.5 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition shadow-sm"
                  >
                    Load More Artworks
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyerBrowsePage;