import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Check, X, Loader, AlertCircle,
  ShoppingBag, MessageCircle, Star, Package, Clock
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { notificationAPI } from '../services/api';

const TYPE_CONFIG = {
  order: { icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
  message: { icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  review: { icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  payment: { icon: Package, color: 'bg-green-100 text-green-600' },
};

const NotificationsCenter = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) { }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) { }
    finally { setDeletingId(null); }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationAPI.deleteAll();
      setNotifications([]);
    } catch (err) { }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const unread = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'order', label: 'Orders' },
    { id: 'message', label: 'Messages' },
    { id: 'review', label: 'Reviews' },
    { id: 'payment', label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'All caught up!'}
        />

        {/* --- FIXED WRAPPER HERE --- */}
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 overflow-x-auto shadow-sm">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 font-semibold flex items-center gap-1 hover:text-purple-700 transition"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="text-xs text-red-500 font-semibold hover:text-red-700 transition"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            </div>

          ) : error ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>

          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Bell className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>

          ) : (
            <div className="space-y-2">
              {filtered.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif._id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${!notif.read
                      ? 'border-purple-100 border-l-4 border-l-purple-500'
                      : 'border-gray-100'
                      }`}
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={`font-bold text-sm truncate ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notif.title}
                              </h3>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {formatTime(notif.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkRead(notif._id)}
                                className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notif._id)}
                              disabled={deletingId === notif._id}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            >
                              {deletingId === notif._id
                                ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                : <X className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                        </div>
                        {notif.link && (
                          <Link to={notif.link}>
                            <span className="text-xs text-purple-600 font-semibold hover:underline mt-1 inline-block">
                              View →
                            </span>
                          </Link>
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
};

export default NotificationsCenter;