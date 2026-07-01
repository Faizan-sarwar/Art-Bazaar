import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader, AlertCircle, Send } from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { reviewAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const ReviewsRatings = () => {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filter,       setFilter]       = useState('all');
  const [replyingId,   setReplyingId]   = useState(null);
  const [replyText,    setReplyText]    = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await reviewAPI.getSellerReviews();
        setReviews(data.reviews || []);
      } catch (err) {
        setError('Failed to load reviews: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const data = await reviewAPI.reply(reviewId, replyText);
      setReviews(prev =>
        prev.map(r => r._id === reviewId ? data.review : r)
      );
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      alert('Failed to submit reply: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  const filtered = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Reviews & Ratings"
          subtitle={`${reviews.length} total reviews`}
        />

        <main className="p-4 md:p-6 space-y-5">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading reviews...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-bold">{error}</p>
            </div>
          ) : (
            <>
              {/* Overview */}
              <div className="grid md:grid-cols-3 gap-4">

                {/* Average Rating */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                  <p className="text-6xl font-black text-indigo-600 mb-1">{avgRating}</p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${
                        i <= Math.round(parseFloat(avgRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm">{reviews.length} reviews</p>
                </div>

                {/* Rating Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
                  <h3 className="font-bold text-gray-900 mb-4">Rating Breakdown</h3>
                  <div className="space-y-2">
                    {ratingCounts.map(({ n, count }) => (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3">{n}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Reviews' },
                  { id: '5',   label: '⭐ 5 Stars'  },
                  { id: '4',   label: '⭐ 4 Stars'  },
                  { id: '3',   label: '⭐ 3 Stars'  },
                  { id: '2',   label: '⭐ 2 Stars'  },
                  { id: '1',   label: '⭐ 1 Star'   },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      filter === f.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map(review => (
                    <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
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
                          <div>
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
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex-shrink-0 truncate max-w-[120px]">
                          {review.artworkTitle}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        {review.comment}
                      </p>

                      {/* Existing Reply */}
                      {review.reply && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-3 ml-4">
                          <p className="text-xs font-bold text-indigo-700 mb-1">Your reply:</p>
                          <p className="text-sm text-gray-700">{review.reply}</p>
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingId === review._id && (
                        <div className="ml-4 mb-3">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReply(review._id)}
                              disabled={submitting || !replyText.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {submitting ? 'Sending...' : 'Send Reply'}
                            </button>
                            <button
                              onClick={() => { setReplyingId(null); setReplyText(''); }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reply Button */}
                      {!review.reply && replyingId !== review._id && (
                        <button
                          onClick={() => { setReplyingId(review._id); setReplyText(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Reply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReviewsRatings;