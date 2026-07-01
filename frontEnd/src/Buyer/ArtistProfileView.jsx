import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../hooks/useUser';
import {
  ChevronLeft, MapPin, CheckCircle, Star, Heart,
  ShoppingCart, Users, Package, Award, TrendingUp,
  Grid, List, MessageCircle, Loader, AlertCircle,
  Palette, Calendar
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';
import { artworkAPI, messageAPI, reviewAPI } from '../services/api';

const COVER_GRADIENTS = [
  'from-purple-600 to-blue-600',
  'from-indigo-600 to-purple-600',
  'from-pink-600 to-purple-600',
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-pink-600',
];

const ArtistProfileView = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [activeTab,    setActiveTab]    = useState('artworks');
  const [viewMode,     setViewMode]     = useState('grid');
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [favorites,    setFavorites]    = useState([]);
  const [artworks,     setArtworks]     = useState([]);
  const [artistInfo,   setArtistInfo]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reviews,      setReviews]      = useState([]);
  const [loadingRevs,  setLoadingRevs]  = useState(false);
  const [chatLoading,  setChatLoading]  = useState(false);

  const buildAchievements = (artworkCount, totalSales) => {
    const badges = [];
    badges.push({ title: 'Verified Artist', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle });
    if (totalSales >= 100) badges.push({ title: '100+ Sales', color: 'text-purple-700', bg: 'bg-purple-100', icon: Package   });
    if (totalSales >= 50)  badges.push({ title: 'Top Seller', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Award     });
    if (artworkCount >= 10)badges.push({ title: 'Prolific',   color: 'text-green-700',  bg: 'bg-green-100',  icon: TrendingUp});
    if (badges.length < 2) badges.push({ title: 'Rising Star',color: 'text-pink-700',   bg: 'bg-pink-100',   icon: TrendingUp});
    return badges;
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      setError('');
      try {
        const data          = await artworkAPI.getAll({ artistId: id, limit: 50, showSold: true });
        const artistArtworks = data.artworks || [];

        if (artistArtworks.length === 0) {
          setError('This artist has no artworks yet.');
          setLoading(false);
          return;
        }

        setArtworks(artistArtworks);

        const firstArt   = artistArtworks[0];
        const artistUser = firstArt.artist;

        const totalSales = artistArtworks.reduce((s, a) => s + (a.sales || 0), 0);
        const totalViews = artistArtworks.reduce((s, a) => s + (a.views || 0), 0);
        const rated      = artistArtworks.filter(a => a.rating > 0);
        const avgRating  = rated.length > 0
          ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1)
          : 'New';

        const categoryCount = {};
        artistArtworks.forEach(a => {
          categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
        });
        const specialty = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Artist';

        setArtistInfo({
          id:          artistUser?._id || id,
          name:        firstArt.artistName,
          avatar:      artistUser?.avatar   || '',
          city:        artistUser?.city     || 'Pakistan',
          specialty:   artistUser?.specialty || specialty + ' Artist',
          memberSince: new Date(firstArt.createdAt).getFullYear(),
          stats: {
            totalArtworks: artistArtworks.length,
            totalSales,
            totalViews,
            avgRating,
          },
          achievements: buildAchievements(artistArtworks.length, totalSales),
        });

        // Fetch real reviews for all artworks by this artist
        setLoadingRevs(true);
        const reviewPromises = artistArtworks.map(a => reviewAPI.getArtworkReviews(a._id));
        const reviewResults  = await Promise.all(reviewPromises);
        const allReviews     = reviewResults.flatMap(r => r.reviews || []);
        // Sort by newest first
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(allReviews);
        setLoadingRevs(false);

      } catch (err) {
        setError('Failed to load artist profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArtistData();
  }, [id]);

  const handleChat = async () => {
    if (chatLoading) return;
    setChatLoading(true);
    try {
      const data = await messageAPI.getOrCreateConversation(id.toString());
      navigate('/buyer/messages', { state: { conversationId: data.conversation._id } });
    } catch (err) {
      navigate('/buyer/messages');
    } finally {
      setChatLoading(false);
    }
  };

  const toggleFavorite = (artId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(artId) ? prev.filter(f => f !== artId) : [...prev, artId]
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  const gradientIndex = artistInfo
    ? artistInfo.name.charCodeAt(0) % COVER_GRADIENTS.length
    : 0;

  // Real avg rating from reviews
  const realAvgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    n,
    count:   reviews.filter(r => r.rating === n).length,
    percent: reviews.length
      ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100)
      : 0,
  }));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading artist profile...</p>
        </div>
      </div>
    </div>
  );

  if (error || !artistInfo) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Artist not found</h3>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'artworks', label: 'Artworks', count: artworks.length  },
    { id: 'about',    label: 'About'                              },
    { id: 'reviews',  label: 'Reviews',  count: reviews.length   },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Artist Profile"
          subtitle={artistInfo.name}
        />

        <main className="pb-8">

          {/* Cover */}
          <div className={`relative h-40 md:h-56 bg-gradient-to-r ${COVER_GRADIENTS[gradientIndex]} overflow-hidden`}>
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl hover:bg-black/50 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <div className="px-4 md:px-6 w-full max-w-7xl mx-auto">

            {/* Artist Header */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 md:-mt-16 mb-5 relative z-10">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden">
                  {artistInfo.avatar ? (
                    <img
                      src={getImageUrl(artistInfo.avatar)}
                      alt={artistInfo.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br ${COVER_GRADIENTS[gradientIndex]} items-center justify-center text-white font-black text-4xl md:text-5xl ${artistInfo.avatar ? 'hidden' : 'flex'}`}>
                    {artistInfo.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-white">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Name + Actions */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900">{artistInfo.name}</h1>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4" /> {artistInfo.city}
                    </div>
                    <p className="text-xs text-gray-400">
                      {artistInfo.specialty} · Member since {artistInfo.memberSince}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={handleChat}
                      disabled={chatLoading}
                      className="px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold text-sm hover:bg-purple-50 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {chatLoading
                        ? <Loader className="w-4 h-4 animate-spin" />
                        : <MessageCircle className="w-4 h-4" />
                      }
                      Message
                    </button>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5 ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                          : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Artworks', value: artistInfo.stats.totalArtworks                                                       },
                { label: 'Sales',    value: artistInfo.stats.totalSales                                                           },
                { label: 'Views',    value: artistInfo.stats.totalViews.toLocaleString()                                          },
                { label: 'Rating',   value: realAvgRating ? `⭐ ${realAvgRating}` : '⭐ New'                                     },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:shadow-md transition">
                  <p className="text-xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="flex flex-wrap gap-2 mb-5">
              {artistInfo.achievements.map((a, i) => (
                <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${a.bg} ${a.color}`}>
                  <a.icon className="w-3.5 h-3.5" /> {a.title}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                      activeTab === t.id
                        ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
                  </button>
                ))}
              </div>

              <div className="p-4 md:p-5">

                {/* ── Artworks Tab ── */}
                {activeTab === 'artworks' && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-bold text-gray-900">{artworks.length}</span> artworks
                      </p>
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {artworks.length === 0 ? (
                      <div className="text-center py-12">
                        <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No artworks yet</p>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {artworks.map(art => (
                          <Link to={`/buyer/artwork/${art._id}`} key={art._id}>
                            <div className="bg-gray-50 rounded-2xl overflow-hidden group hover:shadow-lg transition border border-gray-100 cursor-pointer">
                              <div className="aspect-square overflow-hidden bg-gray-200 relative">
                                <img
                                  src={getImageUrl(art.image)}
                                  alt={art.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                                {!art.isAvailable && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">SOLD</span>
                                  </div>
                                )}
                                <button
                                  onClick={e => toggleFavorite(art._id, e)}
                                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                  <Heart className={`w-4 h-4 ${favorites.includes(art._id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                </button>
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-lg">
                                  {art.category}
                                </span>
                              </div>
                              <div className="p-3">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-purple-600 font-black text-sm">
                                    PKR {art.price.toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-semibold text-gray-700">
                                      {art.rating > 0 ? art.rating.toFixed(1) : 'New'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {artworks.map(art => (
                          <Link to={`/buyer/artwork/${art._id}`} key={art._id}>
                            <div className="flex gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-purple-50 transition cursor-pointer group">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src={getImageUrl(art.image)}
                                  alt={art.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-lg font-semibold">
                                  {art.category}
                                </span>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-purple-600 font-black text-sm">
                                    PKR {art.price.toLocaleString()}
                                  </span>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                                    art.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {art.isAvailable ? 'Available' : 'Sold'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── About Tab ── */}
                {activeTab === 'about' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${COVER_GRADIENTS[gradientIndex]} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-black text-2xl">
                          {artistInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">{artistInfo.name}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{artistInfo.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-blue-600 font-semibold">Verified Artist on ArtBazaar</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        ['Specialty',    artistInfo.specialty],
                        ['Location',     artistInfo.city],
                        ['Member Since', artistInfo.memberSince.toString()],
                        ['Total Works',  artistInfo.stats.totalArtworks.toString()],
                        ['Total Sales',  artistInfo.stats.totalSales.toString()],
                        ['Rating',       realAvgRating ? `${realAvgRating} / 5` : 'No ratings yet'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">{k}</p>
                          <p className="font-semibold text-gray-900 text-sm mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>

                    <Link to="/buyer/custom-request">
                      <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
                        <Palette className="w-5 h-5" /> Request Custom Artwork
                      </button>
                    </Link>
                  </div>
                )}

                {/* ── Reviews Tab — REAL DATA ── */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">

                    {loadingRevs ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-semibold">No reviews yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Reviews will appear here after buyers rate purchased artworks
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Rating Summary */}
                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                          <div className="text-center flex-shrink-0">
                            <p className="text-4xl font-black text-purple-600">
                              {realAvgRating || '—'}
                            </p>
                            <div className="flex justify-center gap-0.5 my-1">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-4 h-4 ${
                                  i <= Math.round(parseFloat(realAvgRating || 0))
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`} />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">{reviews.length} reviews</p>
                          </div>

                          {/* Bar Breakdown */}
                          <div className="flex-1">
                            {ratingCounts.map(({ n, count, percent }) => (
                              <div key={n} className="flex items-center gap-2 mb-1.5 text-xs">
                                <span className="text-gray-500 w-2 font-medium">{n}</span>
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-gray-400 w-8 text-right">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Review Cards */}
                        <div className="space-y-4">
                          {reviews.map(review => (
                            <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {review.buyerAvatar ? (
                                    <img
                                      src={getImageUrl(review.buyerAvatar)}
                                      alt={review.buyerName}
                                      className="w-full h-full object-cover"
                                      onError={e => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    review.buyerName?.charAt(0)?.toUpperCase()
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm">{review.buyerName}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex gap-0.5">
                                      {[1,2,3,4,5].map(s => (
                                        <Star key={s} className={`w-3.5 h-3.5 ${
                                          s <= review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-200'
                                        }`} />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 truncate max-w-[100px]">
                                  {review.artworkTitle}
                                </span>
                              </div>

                              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                {review.comment}
                              </p>

                              {review.reply && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 ml-4">
                                  <p className="text-xs font-bold text-indigo-700 mb-1">Artist's Reply:</p>
                                  <p className="text-sm text-gray-700">{review.reply}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistProfileView;