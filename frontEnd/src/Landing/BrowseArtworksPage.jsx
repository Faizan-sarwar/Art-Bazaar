import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, Eye, Star, SlidersHorizontal,
  Grid, List, X, Loader, AlertCircle, Sparkles, Shield
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All', 'Abstract', 'Landscape', 'Portrait', 'Traditional', 'Modern', 'Calligraphy', 'Portraits'];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const popUp = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } }
};

export default function BrowseArtworksPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(1000000);
  const [search, setSearch] = useState('');

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { isApproved: true }; // STRICT APPROVAL FILTER
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const data = await artworkAPI.getAll(params);
      let results = data.artworks || [];
      results = results.filter(a => a.price <= priceRange);

      setArtworks(results);
    } catch (err) {
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [category, search, priceRange]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-purple-900 pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
        <div className="w-full max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">The Gallery</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Explore thousands of breathtaking artworks from emerging and established artists.
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="font-bold text-gray-900">Filters & Search</span>
          <button onClick={() => setShowFilters(true)} className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Filters */}
        <AnimatePresence>
          {(showFilters || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className={`fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-72 bg-white lg:bg-transparent shadow-2xl lg:shadow-none border-r lg:border-r-0 border-gray-100 h-full lg:h-auto flex flex-col`}
            >
              <div className="p-6 border-b border-gray-100 lg:hidden flex justify-between items-center bg-white">
                <h3 className="font-black text-xl">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm">

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest">Search</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Title or artist..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest flex justify-between">
                    Price Limit
                    <span className="text-purple-600 font-black">PKR {priceRange.toLocaleString()}</span>
                  </h4>
                  <input
                    type="range"
                    min="1000"
                    max="1000000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-semibold">
                    <span>PKR 1K</span>
                    <span>PKR {priceRange.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest">Categories</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(c => (
                      <label key={c} className={`flex items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all ${category === c ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-gray-100 hover:border-purple-200 text-gray-600 font-medium'}`}>
                        <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} className="hidden" />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white lg:hidden">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="font-bold text-gray-600">Showing <span className="text-purple-600">{artworks.length}</span> artworks</p>
            <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm hidden sm:flex">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-32 flex justify-center"><Loader className="w-12 h-12 text-purple-600 animate-spin" /></div>
          ) : artworks.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm mt-8">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">No artworks found</h3>
              <p className="text-gray-500">Try expanding your search or increasing the price limit.</p>
              <button onClick={() => { setCategory('All'); setSearch(''); setPriceRange(1000000); }} className="mt-6 px-6 py-3 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition">
                Reset All Filters
              </button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer} initial="hidden" animate="show"
              className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}
            >
              {artworks.map((art) => (
                <motion.div variants={popUp} key={art._id} className={`bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-2xl hover:border-purple-200 transition-all duration-300 ${viewMode === 'list' ? 'flex h-56' : ''}`}>
                  <Link to="/login" className={viewMode === 'list' ? 'flex flex-row w-full' : 'block'}>
                    <div className={`${viewMode === 'list' ? 'w-56 h-full flex-shrink-0' : 'h-64'} bg-gray-100 relative overflow-hidden`}>
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                        <Eye className="w-3.5 h-3.5" /> {art.views}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition truncate">{art.title}</h3>
                        {art.isAuthenticated && <Shield className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" title="Verified Authentic" />}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">by {art.artistName}</p>

                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="font-black text-xl text-gray-900">PKR {art.price?.toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-700">{art.rating > 0 ? art.rating.toFixed(1) : 'New'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}