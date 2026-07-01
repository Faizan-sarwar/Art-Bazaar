import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, Truck, CheckCircle,
  Clock, XCircle, Loader, AlertCircle, Star
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { orderAPI, reviewAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Confirmed' },
  'in-transit': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck, label: 'In Transit' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Delivered' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
};

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
};

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const MyOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewed, setReviewed] = useState({});

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setSuccessMsg(
        `Order ${location.state.orderNumber} placed for "${location.state.artworkTitle}"!`
      );
      setTimeout(() => setSuccessMsg(''), 6000);
      window.history.replaceState({}, document.title);
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderAPI.getMyOrders();
        const fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);

        // Check which delivered orders are already reviewed
        const deliveredOrders = fetchedOrders.filter(o => o.status === 'delivered');
        const reviewChecks = await Promise.all(
          deliveredOrders.map(o => reviewAPI.checkReviewed(o._id))
        );
        const reviewedMap = {};
        deliveredOrders.forEach((o, i) => {
          reviewedMap[o._id] = reviewChecks[i].hasReviewed;
        });
        setReviewed(reviewedMap);
      } catch (err) {
        setError('Failed to load orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReview = (order) => {
    setReviewModal(order);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    try {
      await reviewAPI.create(reviewModal._id, rating, comment);
      setReviewed(prev => ({ ...prev, [reviewModal._id]: true }));
      setReviewModal(null);
      setRating(5);
      setComment('');
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      (o.artworkTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.sellerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusFilters = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'in-transit', label: 'In Transit', count: orders.filter(o => o.status === 'in-transit').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="My Orders"
          subtitle="Track your purchases"
          searchPlaceholder="Search orders..."
          searchValue={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
        />

        {/* Global Layout Wrapper Updated */}
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-purple-600' },
              { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-600' },
              { label: 'In Transit', value: orders.filter(o => o.status === 'in-transit').length, color: 'text-blue-600' },
              { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto">
            {statusFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterStatus === f.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className={`ml-1 ${filterStatus === f.id ? 'text-white/70' : 'text-gray-400'}`}>
                    ({f.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading your orders...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-900 font-bold mb-2">Failed to load orders</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                {orders.length === 0
                  ? 'Browse artworks and place your first order'
                  : 'Try changing the filter or search'
                }
              </p>
              {orders.length === 0 && (
                <Link to="/buyer/browse">
                  <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition">
                    Browse Artworks
                  </button>
                </Link>
              )}
            </div>

          ) : (
            <div className="space-y-4">
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const isCancelled = order.status === 'cancelled';
                const isDelivered = order.status === 'delivered';
                const alreadyReviewed = reviewed[order._id];

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    {/* Order Header - Made Order Number Prominent! */}
                    <div className="flex items-center justify-between px-5 py-4 bg-purple-50/50 border-b border-purple-100">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order Number</span>
                          <span className="text-lg font-black text-purple-700">
                            {order.orderNumber || order._id.toString().slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-4 h-4" /> {cfg.label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-500 flex-shrink-0">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Order Body */}
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner">
                          <img
                            src={getImageUrl(order.artworkImage)}
                            alt={order.artworkTitle}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {order.artworkTitle}
                          </h3>
                          <p className="text-gray-500 text-sm mt-0.5">
                            by {order.sellerName}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-purple-600 font-black text-lg">
                              PKR {order.totalAmount.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              {PAYMENT_LABELS[order.paymentMethod] || 'Cash on Delivery'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 font-medium">
                            Deliver to: {order.fullName}, {order.city}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-5 flex-wrap border-t border-gray-50 pt-4">

                        {/* Track — non-cancelled only */}
                        {!isCancelled && (
                          <button
                            onClick={() => navigate(`/buyer/track/${order._id}`)}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-md shadow-purple-200"
                          >
                            <Truck className="w-4 h-4" />
                            Track Order
                          </button>
                        )}

                        {/* Review button — delivered only */}
                        {isDelivered && !alreadyReviewed && (
                          <button
                            onClick={() => handleOpenReview(order)}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-bold hover:bg-yellow-600 transition shadow-md shadow-yellow-200"
                          >
                            <Star className="w-4 h-4" />
                            Leave Review
                          </button>
                        )}

                        {/* Already reviewed */}
                        {isDelivered && alreadyReviewed && (
                          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            Reviewed ✓
                          </span>
                        )}

                        {/* Cancelled */}
                        {isCancelled && (
                          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">
                            <XCircle className="w-4 h-4" />
                            Order Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">

            {/* Header */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Leave a Review</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                {reviewModal.artworkTitle}
                <span className="text-gray-400"> · by {reviewModal.sellerName}</span>
              </p>
            </div>

            {/* Artwork thumbnail */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={getImageUrl(reviewModal.artworkImage)}
                  alt={reviewModal.artworkTitle}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{reviewModal.artworkTitle}</p>
                <p className="text-xs font-bold text-purple-600">PKR {reviewModal.totalAmount?.toLocaleString()}</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">Your Rating</p>
              <div className="flex gap-2 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className="transition hover:scale-125"
                  >
                    <Star className={`w-9 h-9 transition-colors ${s <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 hover:text-yellow-300'
                      }`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-purple-600 font-bold">
                {RATING_LABELS[rating]}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">Your Review</p>
              <textarea
                value={comment}
                onChange={e => { setComment(e.target.value); setReviewError(''); }}
                placeholder="Share your experience with this artwork and artist..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-300 resize-none transition shadow-sm"
              />
              {reviewError && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{reviewError}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 text-right font-medium">
                {comment.length} characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !comment.trim()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-purple-200"
              >
                {submitting
                  ? <><Loader className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <><Star className="w-4 h-4" /> Submit Review</>
                }
              </button>
              <button
                onClick={() => { setReviewModal(null); setRating(5); setComment(''); setReviewError(''); }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;