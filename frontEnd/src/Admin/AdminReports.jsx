import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import {
  Flag, AlertTriangle, CheckCircle, Clock,
  X, Loader, Star, Package, XCircle,
  ShoppingBag, Trash2
} from 'lucide-react';
import { adminAPI, reviewAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('low-rated');
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Real data
  const [lowRatedArtworks, setLowRatedArtworks] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [artworksData, ordersData, reviewsData] = await Promise.all([
          adminAPI.getArtworks({ limit: 500 }),
          adminAPI.getOrders({ status: 'cancelled', limit: 200 }),
          reviewAPI.getAll(),
        ]);

        // Filter artworks with rating > 0 and rating < 3.5
        const artworks = artworksData.artworks || [];
        setLowRatedArtworks(
          artworks
            .filter(a => a.rating > 0 && a.rating < 3.5)
            .sort((a, b) => a.rating - b.rating)
        );

        setCancelledOrders(ordersData.orders || []);
        setAllReviews((reviewsData.reviews || []).sort((a, b) => a.rating - b.rating));
      } catch (err) {
        setError('Failed to load report data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDeleteArtwork = async (artworkId) => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
    setDeletingId(artworkId);
    try {
      await adminAPI.deleteArtwork(artworkId);
      setLowRatedArtworks(prev => prev.filter(a => a._id !== artworkId));
      if (selected?._id === artworkId) setSelected(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const tabs = [
    {
      id: 'low-rated',
      label: 'Low Rated Artworks',
      count: lowRatedArtworks.length,
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      id: 'cancelled',
      label: 'Cancelled Orders',
      count: cancelledOrders.length,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      id: 'reviews',
      label: 'All Reviews',
      count: allReviews.length,
      icon: Flag,
      color: 'text-blue-500',
    },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading reports...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Reports"
          subtitle="Real platform data — issues & insights"
        />
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Low Rated',
                value: lowRatedArtworks.length,
                icon: Star,
                cls: 'text-yellow-500',
                bg: 'bg-yellow-50',
              },
              {
                label: 'Cancelled Orders',
                value: cancelledOrders.length,
                icon: XCircle,
                cls: 'text-red-500',
                bg: 'bg-red-50',
              },
              {
                label: 'Total Reviews',
                value: allReviews.length,
                icon: Flag,
                cls: 'text-blue-500',
                bg: 'bg-blue-50',
              },
              {
                label: '1-2 Star Reviews',
                value: allReviews.filter(r => r.rating <= 2).length,
                icon: AlertTriangle,
                cls: 'text-orange-500',
                bg: 'bg-orange-50',
              },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <s.icon size={18} className={s.cls} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === t.id
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <t.icon size={14} />
                {t.label}
                {t.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-lg text-xs font-bold ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Low Rated Artworks ── */}
          {activeTab === 'low-rated' && (
            lowRatedArtworks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-700 font-bold">No low-rated artworks</p>
                <p className="text-gray-400 text-sm mt-1">All artworks have ratings above 3.5</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {lowRatedArtworks.map(art => (
                  <div key={art._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-36 bg-gray-100 overflow-hidden relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        <Star size={11} fill="currentColor" />
                        {art.rating.toFixed(1)}
                      </div>
                      {!art.isAvailable && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          SOLD
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-900 text-sm truncate">{art.title}</p>
                      <p className="text-xs text-gray-500 truncate mb-1">by {art.artistName}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-900">
                          PKR {art.price?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {art.numReviews || 0} reviews
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected({ type: 'artwork', data: art })}
                          className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteArtwork(art._id)}
                          disabled={deletingId === art._id}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                        >
                          {deletingId === art._id
                            ? <Loader size={12} className="animate-spin" />
                            : <Trash2 size={12} />
                          }
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Cancelled Orders ── */}
          {activeTab === 'cancelled' && (
            cancelledOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-700 font-bold">No cancelled orders</p>
                <p className="text-gray-400 text-sm mt-1">All orders are active</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cancelledOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getImageUrl(order.artworkImage)}
                        alt={order.artworkTitle}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{order.artworkTitle}</p>
                      <p className="text-xs text-gray-500">
                        Buyer: <span className="font-semibold text-gray-700">{order.buyerName}</span>
                        {' · '}
                        Seller: <span className="font-semibold text-gray-700">{order.sellerName}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        PKR {order.totalAmount?.toLocaleString()}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold bg-red-100 text-red-700">
                        Cancelled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── All Reviews ── */}
          {activeTab === 'reviews' && (
            allReviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-bold">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">Reviews will appear here after buyers rate artworks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allReviews.map(review => (
                  <div
                    key={review._id}
                    className={`bg-white rounded-xl border shadow-sm p-4 ${review.rating <= 2 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {review.buyerName?.charAt(0)?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{review.buyerName}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 mx-3">
                        <p className="text-xs font-semibold text-gray-600 truncate">
                          {review.artworkTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-lg font-bold ${review.rating >= 4
                          ? 'bg-green-100 text-green-700'
                          : review.rating === 3
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {review.rating}★
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {review.rating <= 2 && (
                      <div className="mt-2 px-3 py-1.5 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                          <AlertTriangle size={11} /> Low rating — may need attention
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Artwork Detail Modal ── */}
          {selected?.type === 'artwork' && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Artwork Details</h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="h-44 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={getImageUrl(selected.data.image)}
                    alt={selected.data.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>

                <p className="font-bold text-gray-900 text-lg mb-1">{selected.data.title}</p>
                <p className="text-sm text-gray-500 mb-1">by {selected.data.artistName}</p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(selected.data.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {selected.data.rating.toFixed(1)} / 5
                  </span>
                  <span className="text-xs text-gray-400">
                    ({selected.data.numReviews || 0} reviews)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['Category', selected.data.category],
                    ['Price', `PKR ${selected.data.price?.toLocaleString()}`],
                    ['Status', selected.data.isAvailable ? 'Available' : 'Sold'],
                    ['Views', selected.data.views || 0],
                    ['Sales', selected.data.sales || 0],
                    ['Listed', formatDate(selected.data.createdAt)],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">{l}</p>
                      <p className="font-semibold text-gray-800 text-sm">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteArtwork(selected.data._id)}
                    disabled={deletingId === selected.data._id}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingId === selected.data._id
                      ? <><Loader size={14} className="animate-spin" /> Deleting...</>
                      : <><Trash2 size={14} /> Delete Artwork</>
                    }
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}