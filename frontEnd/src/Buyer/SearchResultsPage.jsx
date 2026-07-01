import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Heart, Star, Grid, List, SlidersHorizontal,
  X, Search, Loader, AlertCircle, Package,
  ChevronDown, Sparkles
} from 'lucide-react';
import BuyerSidebar    from './BuyerSidebar';
import BuyerHeader     from './BuyerHeader';
import { artworkAPI, wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES  = ['All','Landscape','Abstract','Traditional','Modern','Calligraphy','Portraits','Other'];
const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Most Relevant'     },
  { value: 'price-low',  label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated'     },
  { value: 'popular',    label: 'Most Popular'      },
];

export default function SearchResultsPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const query           = searchParams.get('q') || '';

  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [artworks,       setArtworks]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [total,          setTotal]          = useState(0);
  const [viewMode,       setViewMode]       = useState('grid');
  const [category,       setCategory]       = useState('All');
  const [sortBy,         setSortBy]         = useState('relevance');
  const [maxPrice,       setMaxPrice]       = useState(100000);
  const [showFilters,    setShowFilters]    = useState(false);
  const [favorites,      setFavorites]      = useState([]);
  const [togglingId,     setTogglingId]     = useState(null);

  // Load wishlist
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      wishlistAPI.get()
        .then(data => {
          const ids = (data.wishlist || []).map(a => (a._id || a).toString());
          setFavorites(ids);
        })
        .catch(() => {});
    }
  }, []);

  // Fetch real artworks from MongoDB
  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        search:   query,
        showSold: true,
        limit:    50,
      };
      if (category !== 'All') params.category = category;
      if (maxPrice < 100000)  params.maxPrice  = maxPrice;

      const validSorts = ['price-low', 'price-high', 'rating', 'popular'];
      if (validSorts.includes(sortBy)) params.sortBy = sortBy;

      const data = await artworkAPI.getAll(params);
      setArtworks(data.artworks || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, category, sortBy, maxPrice]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (togglingId === id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setTogglingId(id);
    try {
      const data = await wishlistAPI.toggle(id);
      const ids  = (data.wishlist || []).map(a => (a._id || a).toString());
      setFavorites(ids);
    } catch (err) {
      console.error('Wishlist error:', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const clearFilters = () => {
    setCategory('All');
    setSortBy('relevance');
    setMaxPrice(100000);
  };

  const hasFilters = category !== 'All' || sortBy !== 'relevance' || maxPrice < 100000;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Search Results"
          subtitle={query ? `"${query}"` : ''}
        />

        <main className="p-4 md:p-6 max-w-7xl mx-auto">

          {/* Hero Search Bar */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 mb-6 text-white">
            <p className="text-purple-100 text-sm mb-2 font-medium">Search Results</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  defaultValue={query}
                  placeholder="Search artworks, artists..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/buyer/search?q=${encodeURIComponent(e.target.value.trim())}`);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 transition"
                />
              </div>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Search artworks, artists..."]');
                  if (input?.value.trim()) {
                    navigate(`/buyer/search?q=${encodeURIComponent(input.value.trim())}`);
                  }
                }}
                className="px-5 py-2.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition text-sm flex-shrink-0"
              >
                Search
              </button>
            </div>
            {!loading && (
              <p className="text-purple-100 text-sm mt-2">
                {total > 0
                  ? `Found ${total} result${total !== 1 ? 's' : ''} for "${query}"`
                  : `No results for "${query}"`
                }
              </p>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  category === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-gray-400 text-sm">Searching...</span>
              ) : (
                <span className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{artworks.length}</span> artworks
                </span>
              )}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                  showFilters
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Max Price: <span className="text-purple-600">PKR {maxPrice.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>PKR 5,000</span>
                  <span>PKR 100,000</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Searching artworks...</p>
              </div>
            </div>

          /* Error */
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Search failed</h3>
              <p className="text-gray-500 text-sm mb-5">{error}</p>
              <button
                onClick={fetchResults}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>

          /* No results */
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm mb-2">
                No artworks found for "<span className="font-semibold text-gray-700">{query}</span>"
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Try different keywords or browse all artworks
              </p>
              <div className="flex gap-3 justify-center">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-50 transition"
                  >
                    Clear Filters
                  </button>
                )}
                <Link to="/buyer/browse">
                  <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition">
                    Browse All Artworks
                  </button>
                </Link>
              </div>
            </div>

          /* Grid View */
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {artworks.map(art => {
                const isSold = !art.isAvailable;
                const isFav  = favorites.includes(art._id?.toString());
                const card = (
                  <div className={`bg-white rounded-2xl shadow-sm overflow-hidden group border border-gray-100 cursor-pointer ${
                    isSold ? 'opacity-75' : 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
                  }`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isSold ? 'group-hover:scale-110' : ''}`}
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />

                      {isSold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <span className="px-4 py-2 bg-red-500 text-white text-sm font-black rounded-xl tracking-widest shadow-lg">
                            SOLD
                          </span>
                        </div>
                      )}

                      {art.isFeatured && !isSold && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 z-10">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}

                      {!isSold && (
                        <button
                          onClick={e => toggleFavorite(art._id, e)}
                          disabled={togglingId === art._id}
                          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 disabled:opacity-50"
                        >
                          {togglingId === art._id
                            ? <Loader className="w-4 h-4 text-purple-500 animate-spin" />
                            : <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          }
                        </button>
                      )}

                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-lg z-10">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{art.title}</h3>
                      <p className="text-gray-500 text-xs mb-1 truncate">by {art.artistName}</p>
                      {art.medium && (
                        <p className="text-gray-400 text-xs mb-2 truncate">{art.medium}{art.dimensions ? ` · ${art.dimensions}` : ''}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                          </span>
                          {art.numReviews > 0 && (
                            <span className="text-xs text-gray-400">({art.numReviews})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return isSold
                  ? <div key={art._id}>{card}</div>
                  : <Link to={`/buyer/artwork/${art._id}`} key={art._id}>{card}</Link>;
              })}
            </div>

          /* List View */
          ) : (
            <div className="space-y-3">
              {artworks.map(art => {
                const isSold = !art.isAvailable;
                const isFav  = favorites.includes(art._id?.toString());

                const card = (
                  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 group ${
                    isSold ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer'
                  }`}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-black">SOLD</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                        {isSold && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg">Sold</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mb-1 truncate">by {art.artistName}</p>
                      {art.medium && (
                        <p className="text-gray-400 text-xs mb-1">{art.medium}{art.dimensions ? ` · ${art.dimensions}` : ''}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`font-bold text-sm ${isSold ? 'text-gray-400 line-through' : 'text-purple-600'}`}>
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-lg font-medium">
                          {art.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-gray-700">
                            {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isSold && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={e => toggleFavorite(art._id, e)}
                          disabled={togglingId === art._id}
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {togglingId === art._id
                            ? <Loader className="w-4 h-4 text-purple-500 animate-spin" />
                            : <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          }
                        </button>
                      </div>
                    )}
                  </div>
                );

                return isSold
                  ? <div key={art._id}>{card}</div>
                  : <Link to={`/buyer/artwork/${art._id}`} key={art._id}>{card}</Link>;
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}