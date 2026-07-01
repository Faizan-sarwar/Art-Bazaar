import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, MessageSquare,
  DollarSign, Ruler, Calendar, Tag,
  Package, TrendingUp, Loader, AlertCircle, User
} from 'lucide-react';
import SellerSidebar       from './SellerSidebar';
import SellerHeader        from './SellerHeader';
import { customRequestAPI } from '../services/api';
import { getImageUrl }      from '../hooks/useUser';

const STATUS_CONFIG = {
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock,       label: 'Pending'  },
  accepted: { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle, label: 'Accepted' },
  declined: { bg: 'bg-red-100',    text: 'text-red-600',    icon: XCircle,     label: 'Declined' },
};

const GRADIENTS = [
  'from-purple-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-cyan-500',
  'from-orange-500 to-amber-500',
  'from-green-500 to-teal-500',
  'from-cyan-500 to-blue-500',
];

export default function CustomOrderRequests() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [tab,          setTab]          = useState('all');
  const [expanding,    setExpanding]    = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customRequestAPI.getSellerRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleRespond = async (id, status) => {
    setRespondingId(id + status);
    try {
      await customRequestAPI.respond(id, status);
      setRequests(prev =>
        prev.map(r => r._id === id ? { ...r, status } : r)
      );
    } catch (err) {
      alert('Failed to respond: ' + err.message);
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const tabs = [
    { id: 'all',      label: 'All',      count: requests.length },
    { id: 'pending',  label: 'Pending',  count: requests.filter(r => r.status === 'pending').length  },
    { id: 'accepted', label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
    { id: 'declined', label: 'Declined', count: requests.filter(r => r.status === 'declined').length },
  ];

  const filtered = tab === 'all'
    ? requests
    : requests.filter(r => r.status === tab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Custom Requests"
          subtitle={`${requests.filter(r => r.status === 'pending').length} pending responses`}
        />

        <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">

          {/* Hero — FIXED: dark text on gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize:  '25px 25px',
              }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {/* FIXED: explicit white text */}
                <h2 className="font-black text-xl text-white mb-1">
                  Custom Order Requests
                </h2>
                <p className="text-indigo-100 text-sm font-medium">
                  Buyers want personalized artwork — respond to grow your business
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                {[
                  { label: 'Pending',  value: requests.filter(r => r.status === 'pending').length,  color: 'bg-amber-400' },
                  { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, color: 'bg-green-400' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="bg-white/20 border border-white/30 px-5 py-3 rounded-xl text-center"
                  >
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending',  value: requests.filter(r => r.status === 'pending').length,  color: 'text-amber-600', bg: 'bg-amber-50',  iconBg: 'bg-amber-500',  icon: Clock       },
              { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, color: 'text-green-600', bg: 'bg-green-50',  iconBg: 'bg-green-500',  icon: CheckCircle },
              { label: 'Declined', value: requests.filter(r => r.status === 'declined').length, color: 'text-red-600',   bg: 'bg-red-50',    iconBg: 'bg-red-500',    icon: XCircle     },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {t.label}
                <span className={`ml-1 text-xs ${tab === t.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                  ({t.count})
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Loading requests...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold mb-3">{error}</p>
              <button
                onClick={fetchRequests}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
              >
                Retry
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No requests found</h3>
              <p className="text-gray-500 text-sm">
                {tab !== 'all' ? `No ${tab} requests yet` : 'No custom requests yet'}
              </p>
            </div>

          ) : (
            <div className="space-y-4">
              {filtered.map((req, idx) => {
                const cfg      = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                const Icon     = cfg.icon;
                const isExpand = expanding === req._id;

                return (
                  <div
                    key={req._id}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                      req.status === 'pending' ? 'border-amber-100' : 'border-gray-100'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`px-5 py-3 border-b flex items-center justify-between ${
                      req.status === 'pending'
                        ? 'bg-amber-50 border-amber-100'
                        : req.status === 'accepted'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 font-mono">
                          {formatDate(req.createdAt)}
                        </span>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          {req.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">

                      {/* Buyer Info — FIXED: shows real avatar */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                          {req.buyerAvatar ? (
                            <img
                              src={getImageUrl(req.buyerAvatar)}
                              alt={req.buyerName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center text-white font-black text-xl ${req.buyerAvatar ? 'hidden' : 'flex'}`}
                          >
                            {req.buyerName?.charAt(0)?.toUpperCase() || 'B'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-gray-900 text-base">{req.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Requested by{' '}
                            <span className="font-semibold text-gray-700">{req.buyerName}</span>
                          </p>
                          {req.style && (
                            <p className="text-xs text-indigo-600 font-medium mt-0.5">
                              Style: {req.style}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {isExpand
                            ? req.description
                            : `${req.description.slice(0, 130)}${req.description.length > 130 ? '...' : ''}`
                          }
                        </p>
                        {req.description.length > 130 && (
                          <button
                            onClick={() => setExpanding(isExpand ? null : req._id)}
                            className="text-indigo-600 text-xs font-bold mt-1 hover:underline"
                          >
                            {isExpand ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {[
                          { icon: Ruler,      label: 'Size',     value: req.size     || '—' },
                          { icon: DollarSign, label: 'Budget',   value: req.budget   || '—' },
                          { icon: Calendar,   label: 'Deadline', value: req.deadline || '—' },
                          { icon: Tag,        label: 'Medium',   value: req.medium   || '—' },
                        ].map(s => (
                          <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <s.icon className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
                            </div>
                            <p className="font-bold text-gray-900 text-xs leading-tight">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Color Tags */}
                      {req.colors && req.colors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {req.colors.map(c => (
                            <span
                              key={c}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-100"
                            >
                              🎨 {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100">
                        <Link to="/seller/chat">
                          <button className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition">
                            <MessageSquare className="w-4 h-4" /> Message Buyer
                          </button>
                        </Link>

                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRespond(req._id, 'accepted')}
                              disabled={!!respondingId}
                              className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-md shadow-green-200 disabled:opacity-50"
                            >
                              {respondingId === req._id + 'accepted'
                                ? <Loader className="w-4 h-4 animate-spin" />
                                : <CheckCircle className="w-4 h-4" />
                              }
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(req._id, 'declined')}
                              disabled={!!respondingId}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-md shadow-red-200 disabled:opacity-50"
                            >
                              {respondingId === req._id + 'declined'
                                ? <Loader className="w-4 h-4 animate-spin" />
                                : <XCircle className="w-4 h-4" />
                              }
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'accepted' && (
                          <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-200">
                            <CheckCircle className="w-4 h-4" /> Accepted — Contact buyer to start
                          </span>
                        )}

                        {req.status === 'declined' && (
                          <button
                            onClick={() => handleRespond(req._id, 'accepted')}
                            disabled={!!respondingId}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            <TrendingUp className="w-4 h-4" /> Reconsider
                          </button>
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
    </div>
  );
}