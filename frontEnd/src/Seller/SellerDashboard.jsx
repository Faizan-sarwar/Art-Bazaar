import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Edit2, Trash2, Eye, EyeOff, Star, Package,
  Grid, List, CheckCircle, XCircle, Clock, Loader,
  AlertCircle
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Active' },
  sold: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'Sold' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock, label: 'Draft' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', icon: XCircle, label: 'Paused' },
};

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);
  const fetchMyArtworks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await artworkAPI.getMine();
      setArtworks(data.artworks || []);
    } catch (err) {
      setError('Failed to load artworks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArtworks();
  }, []);

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm');
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');

    try {
      await artworkAPI.delete(deleteConfirmId);
      setArtworks(prev => prev.filter(a => a._id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setDeletePassword('');
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete artwork');
    } finally {
      setDeletingAccount(false);
    }
  };

  const filtered = artworks.filter(a => {
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'active' && a.isAvailable) ||
      (filterStatus === 'sold' && !a.isAvailable && a.sales > 0) ||
      (filterStatus === 'draft' && !a.isAvailable && a.sales === 0);
    const searchMatch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatus = (art) => {
    if (!art.isAvailable && art.sales > 0) return 'sold';
    if (!art.isAvailable) return 'draft';
    return 'active';
  };

  const filters = [
    { id: 'all', label: 'All', count: artworks.length },
    { id: 'active', label: 'Active', count: artworks.filter(a => a.isAvailable).length },
    { id: 'sold', label: 'Sold', count: artworks.filter(a => !a.isAvailable && a.sales > 0).length },
    { id: 'draft', label: 'Draft', count: artworks.filter(a => !a.isAvailable && a.sales === 0).length },
  ];

  const summaryStats = [
    { label: 'Total Artworks', value: artworks.length },
    { label: 'Active Listings', value: artworks.filter(a => a.isAvailable).length },
    { label: 'Total Sales', value: artworks.reduce((s, a) => s + a.sales, 0) },
    { label: 'Total Views', value: artworks.reduce((s, a) => s + a.views, 0).toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="My Artworks"
          subtitle={`${artworks.length} total artworks`}
          searchPlaceholder="Search artworks..."
          searchValue={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
          action={{ label: 'Upload', to: '/seller/upload' }}
        />

        <main className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summaryStats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-black text-indigo-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters + View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${filterStatus === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {f.label} <span className="opacity-70 text-xs">({f.count})</span>
                </button>
              ))}
            </div>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading your artworks...</p>
              </div>
            </div>

            /* Error */
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load</h3>
              <p className="text-gray-500 text-sm mb-5">{error}</p>
              <button
                onClick={fetchMyArtworks}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>

            /* Grid */
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(art => {
                const status = getStatus(art);
                const cfg = statusConfig[status];
                const Icon = cfg.icon;
                return (
                  <div key={art._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <Link to={`/seller/edit/${art._id}`}>
                          <button className="w-8 h-8 bg-white rounded-xl shadow flex items-center justify-center hover:bg-indigo-50 transition">
                            <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                          </button>
                        </Link>
                        <button
                          onClick={() => { setDeleteConfirmId(art._id); setDeletePassword(''); setDeleteError(''); }}
                          className="w-8 h-8 bg-white rounded-xl shadow flex items-center justify-center hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{art.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {art.category} · {new Date(art.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {art.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Package className="w-3 h-3" /> {art.sales} sold
                        </span>
                        {art.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {art.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-600">PKR {art.price.toLocaleString()}</span>
                        <Link to={`/seller/edit/${art._id}`}>
                          <button className="px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white transition">
                            Edit
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            /* List */
          ) : (
            <div className="space-y-3">
              {filtered.map(art => {
                const status = getStatus(art);
                const cfg = statusConfig[status];
                const Icon = cfg.icon;
                return (
                  <div key={art._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden hover:shadow-md transition">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
                      <img
                        src={getImageUrl(art.image)}
                        alt={art.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                          <p className="text-xs text-gray-400">
                            {art.category} · {new Date(art.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" /> {art.views}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Package className="w-3 h-3" /> {art.sales} sold
                            </span>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-indigo-600">PKR {art.price.toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Link to={`/seller/edit/${art._id}`}>
                            <button className="px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => { setDeleteConfirmId(art._id); setDeletePassword(''); setDeleteError(''); }}
                            className="p-1.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                {artworks.length === 0 ? 'No artworks yet' : 'No artworks match your filter'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {artworks.length === 0 ? 'Upload your first artwork to get started' : 'Try changing the filter'}
              </p>
              {artworks.length === 0 && (
                <Link to="/seller/upload">
                  <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
                    Upload Artwork
                  </button>
                </Link>
              )}
            </div>
          )}
          {/* ── Delete Confirmation Panel ── */}
{deleteConfirmId && (() => {
  const art = artworks.find(a => a._id === deleteConfirmId);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">Delete Artwork</h3>
            <p className="text-red-100 text-xs">This action cannot be undone</p>
          </div>
        </div>

        {/* Artwork Preview */}
        {art && (
          <div className="px-6 pt-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={getImageUrl(art.image)}
                  alt={art.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{art.title}</p>
                <p className="text-xs text-gray-500">{art.category}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                  PKR {art.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="px-6 pt-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <ul className="text-xs text-red-700 space-y-0.5">
              <li>The artwork image will be permanently deleted</li>
              <li>It will be removed from all buyer wishlists</li>
              <li>Any active listings will be taken down immediately</li>
            </ul>
          </div>
        </div>

        {/* Password Input */}
        <div className="px-6 pt-4">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Enter your password to confirm
          </label>
          <div className="relative">
            <input
              type={showDeletePass ? 'text' : 'password'}
              value={deletePassword}
              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
              placeholder="Your account password"
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none transition pr-10 ${
                deleteError
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-red-400'
              }`}
              onKeyDown={e => { if (e.key === 'Enter') handleDelete(); }}
              autoFocus
            />
            <button
              onClick={() => setShowDeletePass(!showDeletePass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {deleteError && (
            <div className="flex items-center gap-1.5 mt-2 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="text-xs font-medium">{deleteError}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-5 flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deletingAccount || !deletePassword.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
          >
            {deletingAccount
              ? <><Loader className="w-4 h-4 animate-spin" /> Deleting...</>
              : <><Trash2 className="w-4 h-4" /> Delete Artwork</>
            }
          </button>
          <button
            onClick={() => {
              setDeleteConfirmId(null);
              setDeletePassword('');
              setDeleteError('');
              setShowDeletePass(false);
            }}
            disabled={deletingAccount}
            className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
})()}

        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;