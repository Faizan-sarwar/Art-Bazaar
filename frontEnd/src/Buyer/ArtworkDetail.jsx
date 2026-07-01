import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Star, Share2, ChevronLeft,
  CheckCircle, Package, Shield, Truck, Eye,
  MessageCircle, MapPin, Loader, AlertCircle
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { artworkAPI, messageAPI, reviewAPI, wishlistAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [related, setRelated] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await artworkAPI.getById(id);
        setArtwork(data.artwork);

        const [relatedData, reviewData, wishData] = await Promise.all([
          artworkAPI.getAll({ category: data.artwork.category, limit: 5, isApproved: true }), // STRICT FILTER
          reviewAPI.getArtworkReviews(id).catch(() => ({ reviews: [] })),
          wishlistAPI.get().catch(() => ({ wishlist: [] }))
        ]);

        const filteredRelated = (relatedData.artworks || []).filter(a => a._id !== id);
        setRelated(filteredRelated.slice(0, 4));
        setReviews(reviewData.reviews || []);

        const isFav = (wishData.wishlist || []).some(w =>
          (typeof w === 'object' ? w._id : w) === id
        );
        setIsFavorite(isFav);

      } catch (err) {
        setError(err.message || 'Artwork not found');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      const res = await wishlistAPI.toggle(id);
      setIsFavorite(res.isWishlisted);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async () => {
    if (!artwork) return;
    setChatLoading(true);
    try {
      const res = await messageAPI.getOrCreateConversation(artwork.artist._id);
      navigate('/buyer/messages', { state: { conversationId: res.conversation._id } });
    } catch (err) {
      alert('Failed to start chat: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!artwork || !artwork.isAvailable) return;
    navigate('/buyer/checkout', { state: { artworkId: artwork._id } });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <Loader className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    </div>
  );

  if (error || !artwork) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Artwork Not Found'}</h2>
        <button onClick={() => navigate('/buyer/browse')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold">
          Back to Browse
        </button>
      </div>
    </div>
  );

  const isSold = !artwork.isAvailable;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Artwork Details"
        />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 transition mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to gallery
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

            {/* Left: Image Container */}
            <div className="space-y-4">
              <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-md">
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                  <img
                    src={getImageUrl(artwork.image)}
                    alt={artwork.title}
                    className={`w-full h-full object-cover ${isSold ? 'opacity-80' : ''}`}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {isSold && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-red-500 text-white border-2 border-white/20 px-8 py-3 rounded-2xl shadow-2xl transform -rotate-12">
                        <span className="font-black text-3xl tracking-widest">SOLD OUT</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {!isSold && (
                      <button
                        onClick={handleToggleFavorite}
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                    )}
                    <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details Container */}
            <div className="flex flex-col">

              {/* Header section with Shield */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                    {artwork.category}
                  </span>
                  {artwork.isAuthenticated && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                      <Shield className="w-3.5 h-3.5 fill-blue-600" />
                      Verified Authentic
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                  {artwork.title}
                </h1>

                <p className="text-3xl font-black text-purple-600 mb-4">
                  PKR {artwork.price?.toLocaleString()}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {artwork.views || 0} views
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold">{artwork.rating > 0 ? artwork.rating.toFixed(1) : 'New'}</span>
                    <span className="text-yellow-600/70 text-xs">({artwork.numReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Purchase Box */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-8">
                {isSold ? (
                  <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">This artwork has been sold</p>
                    <p className="text-sm text-gray-500 mt-1">Browse related artworks below.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-lg hover:bg-purple-700 transition shadow-xl shadow-purple-200 flex items-center justify-center gap-2 mb-4"
                    >
                      <ShoppingCart className="w-5 h-5" /> Buy Now
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Buyer Protection
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Truck className="w-4 h-4 text-purple-500" />
                        Nationwide Delivery
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Specs & Info */}
              <div className="space-y-8 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About the Artwork</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {artwork.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Medium</p>
                    <p className="font-bold text-gray-900">{artwork.medium || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Dimensions</p>
                    <p className="font-bold text-gray-900">{artwork.dimensions || 'N/A'}</p>
                  </div>
                </div>

                {/* Artist Profile Snippet */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">The Artist</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link to={`/buyer/artist/${artwork.artist?._id}`}>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border border-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer">
                          {artwork.artist?.avatar ? (
                            <img src={getImageUrl(artwork.artist.avatar)} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition" />
                          ) : (
                            <span className="font-bold text-purple-600 text-lg">{artwork.artistName?.charAt(0)}</span>
                          )}
                        </div>
                      </Link>
                      <div>
                        <Link to={`/buyer/artist/${artwork.artist?._id}`}>
                          <h4 className="font-bold text-gray-900 hover:text-purple-600 transition">{artwork.artistName}</h4>
                        </Link>
                        {artwork.artist?.city && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin className="w-3 h-3" /> {artwork.artist.city}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={startChat}
                      disabled={chatLoading}
                      className="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition disabled:opacity-50"
                      title="Message Artist"
                    >
                      {chatLoading ? <Loader className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Related Artworks */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">More in {artwork.category}</h2>
                <Link to={`/buyer/browse?category=${artwork.category}`} className="text-purple-600 font-semibold text-sm hover:underline">
                  View Category
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {related.map(a => (
                  <Link to={`/buyer/artwork/${a._id}`} key={a._id}>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-purple-200 transition-all h-full flex flex-col">
                      <div className="h-40 sm:h-48 bg-gray-100 relative overflow-hidden">
                        <img
                          src={getImageUrl(a.image)}
                          alt={a.title}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!a.isAvailable ? 'opacity-50 grayscale' : ''}`}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {!a.isAvailable && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-lg">SOLD</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{a.title}</h3>
                          {a.isAuthenticated && <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-gray-500 text-xs mb-3 truncate">by {a.artistName}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className={`font-black text-sm ${a.isAvailable ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                            PKR {a.price.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700">
                              {a.rating > 0 ? a.rating.toFixed(1) : 'New'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ArtworkDetail;