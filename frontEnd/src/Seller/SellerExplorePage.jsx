import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, Heart, TrendingUp, Eye,
  BarChart2, Lightbulb, Award, Grid, List,
  SlidersHorizontal, X, ChevronDown, Repeat, Loader
} from 'lucide-react';
import SellerSidebar  from './SellerSidebar';
import SellerHeader   from './SellerHeader';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['All','Landscape','Abstract','Traditional','Modern','Calligraphy','Portraits'];

const INSIGHTS = [
  { category: 'Traditional', growth: '+34%', desc: 'Highest demand this month', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  { category: 'Abstract',    growth: '+28%', desc: 'Fast growing category',     color: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-700'   },
  { category: 'Calligraphy', growth: '+21%', desc: 'Trending among collectors', color: 'bg-amber-50 border-amber-200',   badge: 'bg-amber-100 text-amber-700' },
];

export default function SellerExplorePage() {
  const navigate = useNavigate();

  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [artworks,       setArtworks]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState('popular');
  const [viewMode,       setViewMode]       = useState('grid');
  const [savedInspo,     setSavedInspo]     = useState([]);
  const [showFilters,    setShowFilters]    = useState(false);
  const [maxPrice,       setMaxPrice]       = useState(50000);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const data = await artworkAPI.getAll({ limit: 50, showSold: true });
        setArtworks(data.artworks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  const toggleSave = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedInspo(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSwitchToBuyer = () => {
    localStorage.setItem('viewMode', 'buyer');
    navigate('/buyer/home');
  };

  const filtered = useMemo(() => {
    let list = [...artworks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q)      ||
        (a.artistName || '').toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') list = list.filter(a => a.category === activeCategory);
    list = list.filter(a => (a.price || 0) <= maxPrice);
    switch (sortBy) {
      case 'popular':    list.sort((a, b) => (b.sales  || 0) - (a.sales  || 0)); break;
      case 'trending':   list.sort((a, b) => (b.views  || 0) - (a.views  || 0)); break;
      case 'rating':     list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price-high': list.sort((a, b) => (b.price  || 0) - (a.price  || 0)); break;
      case 'price-low':  list.sort((a, b) => (a.price  || 0) - (b.price  || 0)); break;
      default: break;
    }
    return list;
  }, [artworks, searchQuery, activeCategory, maxPrice, sortBy]);

  const topSelling = [...artworks]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 3);

  const uniqueArtists = new Set(artworks.map(a => a.artistName)).size;
  const ratedArtworks = artworks.filter(a => a.rating > 0);
  const avgRating     = ratedArtworks.length > 0
    ? (ratedArtworks.reduce((s, a) => s + a.rating, 0) / ratedArtworks.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Explore Marketplace"
          subtitle="Get inspired, study trends"
        />

        <main className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '25px 25px' }}
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-1 text-white flex items-center gap-2">
                  <Lightbulb className="w-7 h-7 text-yellow-300" />
                  Explore & Get Inspired
                </h1>
                <p className="text-indigo-100 text-sm mb-4">
                  Study what sells, spot trends, and get inspired for your next masterpiece
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSwitchToBuyer}
                    className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition"
                  >
                    <Repeat className="w-4 h-4" /> Switch to Buyer Mode
                  </button>
                  <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-2.5 rounded-xl text-sm font-semibold text-white">
                    💡 {savedInspo.length} saved for inspiration
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 flex-shrink-0 w-full md:w-auto">
                {[
                  { num: loading ? '…' : `${uniqueArtists}`,   label: 'Artists'    },
                  { num: loading ? '…' : `${artworks.length}`, label: 'Artworks'   },
                  { num: loading ? '…' : `${avgRating}★`,      label: 'Avg Rating' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-3 text-center border border-white/20">
                    <p className="text-lg font-black text-white">{s.num}</p>
                    <p className="text-indigo-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" /> Market Insights
            </h2>
            <p className="text-gray-500 text-xs mb-4">Categories performing best this month — click to filter</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INSIGHTS.map((ins, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategory(ins.category)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    activeCategory === ins.category
                      ? `${ins.color} border-current`
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-900 text-sm">{ins.category}</p>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ins.badge}`}>
                      {ins.growth}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{ins.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Top Selling — real data */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Top Selling
              </h2>
              <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg font-medium">
                Study these for inspiration
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : topSelling.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No artworks yet</div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {topSelling.map((art, i) => (
                  <div key={art._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">{art.title}</p>
                      <p className="text-gray-500 text-xs truncate">by {art.artistName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-indigo-600 font-bold text-xs">
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs">{art.sales || 0} sold</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${
                      i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artworks, artists, styles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  showFilters
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="popular">Most Sold</option>
                  <option value="trending">Most Viewed</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="price-low">Price: Low → High</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Max Price: <span className="text-indigo-600">PKR {maxPrice.toLocaleString()}</span>
              </label>
              <input
                type="range" min="5000" max="50000" step="1000"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>PKR 5,000</span><span>PKR 50,000</span>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count + Clear */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{filtered.length}</span> artworks
              {activeCategory !== 'All' && (
                <span> in <span className="text-indigo-600 font-semibold">{activeCategory}</span></span>
              )}
            </p>
            {(searchQuery || activeCategory !== 'All' || maxPrice < 50000) && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); setMaxPrice(50000); }}
                className="text-xs text-red-500 font-semibold hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg transition"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading artworks...</p>
              </div>
            </div>

          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                Clear Search
              </button>
            </div>

          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(art => (
                <div key={art._id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(art.image)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-5 text-white">
                      <div className="text-center">
                        <p className="text-xl font-black">{art.sales || 0}</p>
                        <p className="text-xs text-white/80">Sold</p>
                      </div>
                      <div className="w-px h-8 bg-white/40" />
                      <div className="text-center">
                        <p className="text-xl font-black">{(art.views || 0).toLocaleString()}</p>
                        <p className="text-xs text-white/80">Views</p>
                      </div>
                    </div>
                    <button
                      onClick={e => toggleSave(art._id, e)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
                    >
                      <Heart className={`w-4 h-4 ${savedInspo.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-lg z-10">
                      {art.category}
                    </span>
                    {(art.sales || 0) > 5 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-lg z-10 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Hot
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{art.title}</h3>
                    <p className="text-gray-500 text-xs mb-2">by {art.artistName}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-indigo-600 font-bold text-sm">
                        PKR {art.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">
                          {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-lg">
                      <Eye className="w-3 h-3" />
                      <span>{(art.views || 0).toLocaleString()} views · {art.sales || 0} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div className="space-y-3">
              {filtered.map(art => (
                <div key={art._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 flex items-center gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={getImageUrl(art.image)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate mb-0.5">{art.title}</h3>
                    <p className="text-gray-500 text-xs mb-2">by {art.artistName}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-indigo-600 font-bold text-sm">
                        PKR {art.price?.toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">
                          {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />{(art.views || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">{art.sales || 0} sold</span>
                    </div>
                  </div>
                  <button
                    onClick={e => toggleSave(art._id, e)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition flex-shrink-0"
                  >
                    <Heart className={`w-4 h-4 ${savedInspo.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-xl shadow-purple-200/50 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <div className="relative">
              <h2 className="text-lg font-black mb-1 text-white">Want to purchase an artwork?</h2>
              <p className="text-indigo-200 text-sm mb-4">
                Switch to Buyer Mode to add to cart, checkout and track your order
              </p>
              <button
                onClick={handleSwitchToBuyer}
                className="bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition inline-flex items-center gap-2 shadow-lg"
              >
                <Repeat className="w-4 h-4" /> Switch to Buyer Mode
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}