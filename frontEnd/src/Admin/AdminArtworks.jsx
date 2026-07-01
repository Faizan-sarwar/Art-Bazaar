import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Search, Trash2, Eye, Loader, AlertCircle, X,
  CheckCircle, XCircle, Clock, Package, ShieldCheck,
  ShieldAlert, ShieldX, Play, Image as ImageIcon, Filter
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES = ['all','Landscape','Abstract','Traditional','Modern','Calligraphy','Portraits','Other'];

const TABS = [
  { id: 'pending',    label: 'Pending Approval', icon: Clock,       color: 'amber'   },
  { id: 'approved',   label: 'Approved',          icon: CheckCircle, color: 'emerald' },
  { id: 'rejected',   label: 'Rejected',           icon: XCircle,     color: 'red'     },
  { id: 'auth',       label: 'Authenticate',       icon: ShieldCheck, color: 'blue'    },
  { id: 'all',        label: 'All',                icon: Package,     color: 'slate'   },
];

const tabCls = {
  amber:   { active: 'bg-amber-500 text-white',   inactive: 'text-amber-600 hover:bg-amber-50'   },
  emerald: { active: 'bg-emerald-500 text-white', inactive: 'text-emerald-600 hover:bg-emerald-50'},
  red:     { active: 'bg-red-500 text-white',     inactive: 'text-red-600 hover:bg-red-50'       },
  blue:    { active: 'bg-blue-600 text-white',    inactive: 'text-blue-600 hover:bg-blue-50'     },
  slate:   { active: 'bg-slate-700 text-white',   inactive: 'text-slate-600 hover:bg-slate-50'   },
};

const AuthBadge = ({ status }) => {
  const cfg = {
    verified:   { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: ShieldCheck, label: 'Verified'   },
    unverified: { bg: 'bg-gray-100',    text: 'text-gray-600',    icon: ShieldAlert, label: 'Unverified' },
    suspicious: { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: ShieldAlert, label: 'Suspicious' },
    rejected:   { bg: 'bg-red-100',     text: 'text-red-700',     icon: ShieldX,     label: 'Failed'     },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: ShieldAlert, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

const ApprovalBadge = ({ status }) => {
  const cfg = {
    pending:  { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock,        label: 'Pending'  },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle,  label: 'Approved' },
    rejected: { bg: 'bg-red-100',     text: 'text-red-700',     icon: XCircle,      label: 'Rejected' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock, label: status };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

export default function AdminArtworks() {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [activeTab,      setActiveTab]      = useState('pending');
  const [artworks,       setArtworks]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [actionLoading,  setActionLoading]  = useState(null);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [category,       setCategory]       = useState('all');
  const [selected,       setSelected]       = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);
  const [rejectModal,    setRejectModal]    = useState(null);
  const [rejectReason,   setRejectReason]   = useState('');
  const [authModal,      setAuthModal]      = useState(null);
  const [authNote,       setAuthNote]       = useState('');
  const [counts,         setCounts]         = useState({ pending: 0, approved: 0, rejected: 0, unverified: 0, verified: 0 });

  const fetchArtworks = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search)             params.search   = search;
      if (category !== 'all') params.category = category;
      if (activeTab === 'auth') {
        params.approvalStatus       = 'approved';
        params.authenticationStatus = 'unverified';
      } else if (activeTab !== 'all') {
        params.approvalStatus = activeTab;
      }
      const data = await adminAPI.getArtworks(params);
      setArtworks(data.artworks || []);
      setCounts({
        pending:    data.pendingCount    || 0,
        approved:   data.approvedCount   || 0,
        rejected:   data.rejectedCount   || 0,
        unverified: data.unverifiedCount || 0,
        verified:   data.verifiedCount   || 0,
      });
    } catch (err) {
      setError('Failed to load: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const t = setTimeout(fetchArtworks, 300); return () => clearTimeout(t); }, [search, category, activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await adminAPI.approveArtwork(id, 'approve');
      setArtworks(prev => prev.filter(a => a._id !== id));
      setCounts(c => ({ ...c, pending: Math.max(0, c.pending - 1), approved: c.approved + 1 }));
      if (selected?._id === id) setSelected(null);
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModal + '_reject');
    try {
      await adminAPI.approveArtwork(rejectModal, 'reject', rejectReason);
      setArtworks(prev => prev.filter(a => a._id !== rejectModal));
      setCounts(c => ({ ...c, pending: Math.max(0, c.pending - 1), rejected: c.rejected + 1 }));
      if (selected?._id === rejectModal) setSelected(null);
      setRejectModal(null); setRejectReason('');
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleAuthenticate = async (action) => {
    setActionLoading(authModal + '_auth');
    try {
      await adminAPI.authenticateArtwork(authModal, action, authNote);
      setArtworks(prev => prev.filter(a => a._id !== authModal));
      setCounts(c => ({ ...c, unverified: Math.max(0, c.unverified - 1), verified: action === 'verified' ? c.verified + 1 : c.verified }));
      if (selected?._id === authModal) setSelected(null);
      setAuthModal(null); setAuthNote('');
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artwork permanently?')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteArtwork(id);
      setArtworks(prev => prev.filter(a => a._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) { alert(err.message); }
    finally { setDeletingId(null); }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  const tabCount = (id) => ({ pending: counts.pending, approved: counts.approved, rejected: counts.rejected, auth: counts.unverified })[id];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Manage Artworks" subtitle="Approve submissions & authenticate art" />

        <main className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Pending',    value: counts.pending,    bg: 'from-amber-500 to-orange-500'  },
              { label: 'Approved',   value: counts.approved,   bg: 'from-emerald-500 to-green-500' },
              { label: 'Rejected',   value: counts.rejected,   bg: 'from-red-500 to-rose-500'      },
              { label: 'Need Auth',  value: counts.unverified, bg: 'from-blue-500 to-indigo-500'   },
              { label: 'Verified',   value: counts.verified,   bg: 'from-purple-500 to-violet-500' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 text-white shadow-sm`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => {
              const Icon  = tab.icon;
              const style = tabCls[tab.color];
              const count = tabCount(tab.id);
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === tab.id ? style.active + ' border-transparent shadow-md' : 'bg-white border-gray-200 ' + style.inactive
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count !== undefined && count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-black ${activeTab === tab.id ? 'bg-white/20' : 'bg-red-500 text-white'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm focus-within:border-red-400 transition">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                placeholder="Search artworks or artists..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>}
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm focus:border-red-400 outline-none transition">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          {/* Context Banner */}
          {activeTab === 'pending' && counts.pending > 0 && !loading && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                <span className="font-black">{counts.pending}</span> artwork{counts.pending !== 1 ? 's' : ''} waiting for approval
              </p>
            </div>
          )}
          {activeTab === 'auth' && counts.unverified > 0 && !loading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                <span className="font-black">{counts.unverified}</span> artwork{counts.unverified !== 1 ? 's' : ''} need authentication — review proof videos & photos
              </p>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading artworks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ShieldCheck className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-700 text-lg">
                {activeTab === 'pending' ? 'All caught up! No pending artworks.' :
                 activeTab === 'auth'    ? 'No artworks need authentication.'    :
                 `No ${activeTab} artworks found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {artworks.map(art => (
                <div key={art._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all group ${
                  art.approvalStatus === 'rejected' ? 'border-red-200' : 'border-gray-100'
                }`}>
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img src={getImageUrl(art.image)} alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.style.display = 'none'; }} />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <ApprovalBadge status={art.approvalStatus} />
                      {art.approvalStatus === 'approved' && <AuthBadge status={art.authenticationStatus} />}
                    </div>
                    {art.proofVideo && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                        <Play className="w-3 h-3" /> Video
                      </div>
                    )}
                    {art.extraPhotos?.length > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> +{art.extraPhotos.length}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{art.title}</p>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex-shrink-0">{art.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 truncate">by {art.artistName}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900 text-sm">PKR {art.price?.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">{formatDate(art.createdAt)}</span>
                    </div>
                    {art.rejectionReason && (
                      <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600">Reason: {art.rejectionReason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setSelected(art)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition">
                        <Eye size={13} /> View
                      </button>

                      {art.approvalStatus !== 'approved' && (
                        <button onClick={() => handleApprove(art._id)}
                          disabled={actionLoading === art._id + '_approve'}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-60 shadow-sm shadow-emerald-200">
                          {actionLoading === art._id + '_approve' ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Approve
                        </button>
                      )}

                      {art.approvalStatus !== 'rejected' && (
                        <button onClick={() => { setRejectModal(art._id); setRejectReason(''); }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-red-200">
                          <XCircle size={12} /> Reject
                        </button>
                      )}

                      {art.approvalStatus === 'approved' && art.authenticationStatus === 'unverified' && (
                        <button onClick={() => { setAuthModal(art._id); setAuthNote(''); }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-200">
                          <ShieldCheck size={12} /> Authenticate
                        </button>
                      )}

                      <button onClick={() => handleDelete(art._id)} disabled={deletingId === art._id}
                        className="flex items-center justify-center p-2 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition">
                        {deletingId === art._id ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-56 bg-gray-100">
              <img src={getImageUrl(selected.image)} alt={selected.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center transition">
                <X size={16} className="text-white" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <ApprovalBadge status={selected.approvalStatus} />
                <AuthBadge status={selected.authenticationStatus} />
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-black text-gray-900 text-xl mb-0.5">{selected.title}</h3>
              <p className="text-sm text-gray-500 mb-1">by {selected.artistName}</p>
              <p className="text-red-600 font-bold text-lg mb-4">PKR {selected.price?.toLocaleString()}</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[['Category', selected.category], ['Medium', selected.medium || 'N/A'], ['Dimensions', selected.dimensions || 'N/A'],
                  ['Year', selected.yearCreated || 'N/A'], ['Type', selected.isPhysical ? 'Physical' : 'Digital'], ['Views', selected.views || 0],
                  ['Sales', selected.sales || 0], ['Rating', selected.rating > 0 ? selected.rating.toFixed(1) : 'N/A'], ['Date', formatDate(selected.createdAt)]
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-xs text-gray-400">{l}</p>
                    <p className="font-bold text-gray-800 text-sm">{v}</p>
                  </div>
                ))}
              </div>

              {selected.description && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4 line-clamp-3">{selected.description}</p>
              )}

              {/* Extra Photos */}
              {selected.extraPhotos?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Extra Photos ({selected.extraPhotos.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selected.extraPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={getImageUrl(photo)} alt={`Extra ${i+1}`} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Video */}
              {selected.proofVideo && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Proof Video</p>
                  <video controls className="w-full rounded-xl bg-black max-h-48" src={getImageUrl(selected.proofVideo)}>
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {selected.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-700 mb-0.5">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{selected.rejectionReason}</p>
                </div>
              )}
              {selected.authenticationNote && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-0.5">Authentication Note:</p>
                  <p className="text-sm text-blue-600">{selected.authenticationNote}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {selected.approvalStatus !== 'approved' && (
                  <button onClick={() => handleApprove(selected._id)} disabled={actionLoading === selected._id + '_approve'}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-60">
                    ✓ Approve
                  </button>
                )}
                {selected.approvalStatus !== 'rejected' && (
                  <button onClick={() => { setRejectModal(selected._id); setRejectReason(''); setSelected(null); }}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition">
                    ✕ Reject
                  </button>
                )}
                {selected.approvalStatus === 'approved' && selected.authenticationStatus === 'unverified' && (
                  <button onClick={() => { setAuthModal(selected._id); setAuthNote(''); setSelected(null); }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition">
                    🛡 Authenticate
                  </button>
                )}
                <button onClick={() => handleDelete(selected._id)} disabled={deletingId === selected._id}
                  className="px-4 py-2.5 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl text-sm font-semibold transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">Reject Artwork</h3>
                <p className="text-sm text-gray-500">Give the artist a reason</p>
              </div>
            </div>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Image quality too low, inappropriate content..."
              rows={3} autoFocus
              className="w-full border-2 border-gray-200 focus:border-red-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none resize-none transition mb-4" />
            <div className="flex gap-3">
              <button onClick={handleReject} disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
              </button>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">Authenticate Artwork</h3>
                <p className="text-sm text-gray-500">Review proof and mark authenticity</p>
              </div>
            </div>
            <textarea value={authNote} onChange={e => setAuthNote(e.target.value)}
              placeholder="Optional note for artist..." rows={2}
              className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none resize-none transition mb-4" />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button onClick={() => handleAuthenticate('verified')} disabled={!!actionLoading}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1">
                <ShieldCheck size={13} /> Verified
              </button>
              <button onClick={() => handleAuthenticate('suspicious')} disabled={!!actionLoading}
                className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1">
                <ShieldAlert size={13} /> Suspicious
              </button>
              <button onClick={() => handleAuthenticate('rejected')} disabled={!!actionLoading}
                className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1">
                <ShieldX size={13} /> Failed
              </button>
            </div>
            <button onClick={() => { setAuthModal(null); setAuthNote(''); }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}