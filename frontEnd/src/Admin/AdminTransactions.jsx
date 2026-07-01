import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Search, DollarSign, TrendingUp,
  CreditCard, Clock, Loader, AlertCircle, ChevronDown
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_CONFIG = {
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending'    },
  confirmed:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Confirmed'  },
  'in-transit':{ bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Transit' },
  delivered:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered'  },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled'  },
};

const PAYMENT_LABELS = {
  cod:       'Cash on Delivery',
  easypaisa: 'Easypaisa',
  jazzcash:  'JazzCash',
  bank:      'Bank Transfer',
};

export default function AdminTransactions() {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [updatingId,    setUpdatingId]    = useState(null);
  const [total,         setTotal]         = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search)                params.search = search;
      if (filterStatus !== 'all') params.status = filterStatus;
      const data = await adminAPI.getOrders(params);
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const data = await adminAPI.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const formatDate   = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Transactions & Orders"
          subtitle={`${total} total orders — real data`}
        />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders',  value: orders.length,                                           icon: CreditCard,  color: 'text-blue-600 bg-blue-50'   },
              { label: 'Total Revenue', value: `PKR ${(totalRevenue/1000).toFixed(0)}K`,                icon: DollarSign,  color: 'text-green-600 bg-green-50' },
              { label: 'Pending',       value: orders.filter(o => o.status === 'pending').length,       icon: Clock,       color: 'text-amber-600 bg-amber-50'  },
              { label: 'Delivered',     value: orders.filter(o => o.status === 'delivered').length,     icon: TrendingUp,  color: 'text-purple-600 bg-purple-50'},
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0"
                placeholder="Search by order no, buyer, seller..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white shadow-sm"
            >
              {['all','pending','confirmed','in-transit','delivered','cancelled'].map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-gray-600 font-mono">
                          {order.orderNumber || order._id.toString().slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getImageUrl(order.artworkImage)}
                          alt={order.artworkTitle}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{order.artworkTitle}</h3>
                        <p className="text-xs text-gray-500">
                          Buyer: <span className="font-semibold">{order.buyerName}</span>
                          {' · '}
                          Seller: <span className="font-semibold">{order.sellerName}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="font-black text-sm text-gray-900">
                            PKR {order.totalAmount?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {PAYMENT_LABELS[order.paymentMethod] || 'COD'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.city}
                          </span>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div className="flex-shrink-0 relative">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateStatus(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 bg-white outline-none cursor-pointer disabled:opacity-50 appearance-none pr-7"
                        >
                          {['pending','confirmed','in-transit','delivered','cancelled'].map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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