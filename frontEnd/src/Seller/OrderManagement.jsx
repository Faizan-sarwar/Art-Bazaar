import React, { useState, useEffect } from 'react';
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  Loader, AlertCircle, ChevronDown, Search
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { orderAPI }  from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_CONFIG = {
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock,       label: 'Pending'    },
  confirmed:   { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: CheckCircle, label: 'Confirmed'  },
  'in-transit':{ bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck,       label: 'In Transit' },
  delivered:   { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle, label: 'Delivered'  },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle,     label: 'Cancelled'  },
};

const STATUS_FLOW = ['pending', 'confirmed', 'in-transit', 'delivered'];

const OrderManagement = () => {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId,   setUpdatingId]   = useState(null);
  const [successMsg,   setSuccessMsg]   = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderAPI.getSellerOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const data = await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => o._id === orderId ? data.order : o)
      );
      setSuccessMsg(`Order updated to "${STATUS_CONFIG[newStatus].label}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update order: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      o.artworkTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase())    ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusFilters = [
    { id: 'all',         label: 'All',        count: orders.length },
    { id: 'pending',     label: 'Pending',    count: orders.filter(o => o.status === 'pending').length     },
    { id: 'confirmed',   label: 'Confirmed',  count: orders.filter(o => o.status === 'confirmed').length   },
    { id: 'in-transit',  label: 'In Transit', count: orders.filter(o => o.status === 'in-transit').length  },
    { id: 'delivered',   label: 'Delivered',  count: orders.filter(o => o.status === 'delivered').length   },
    { id: 'cancelled',   label: 'Cancelled',  count: orders.filter(o => o.status === 'cancelled').length   },
  ];

  const stats = [
    { label: 'Total Orders',   value: orders.length,                                           color: 'text-indigo-600' },
    { label: 'Pending',        value: orders.filter(o => o.status === 'pending').length,       color: 'text-amber-600'  },
    { label: 'In Transit',     value: orders.filter(o => o.status === 'in-transit').length,    color: 'text-purple-600' },
    { label: 'Delivered',      value: orders.filter(o => o.status === 'delivered').length,     color: 'text-green-600'  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Order Management"
          subtitle="Manage and track your orders"
          searchPlaceholder="Search orders..."
          searchValue={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
        />

        <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

          {/* Success */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
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
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
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
                <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading orders...</p>
              </div>
            </div>

          /* Error */
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-900 font-bold mb-2">Failed to load orders</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>

          /* Empty */
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
              </h3>
              <p className="text-gray-500 text-sm">
                {orders.length === 0
                  ? 'When buyers purchase your artworks, orders will appear here'
                  : 'Try changing the filter or search query'
                }
              </p>
            </div>

          /* Orders */
          ) : (
            <div className="space-y-4">
              {filtered.map(order => {
                const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

                return (
                  <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-600">{order.orderNumber}</span>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={getImageUrl(order.artworkImage)}
                            alt={order.artworkTitle}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{order.artworkTitle}</h3>
                          <p className="text-indigo-600 font-black text-sm mt-0.5">
                            PKR {order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Buyer + Delivery Info */}
                      <div className="grid sm:grid-cols-2 gap-3 mt-4">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Buyer</p>
                          <p className="text-sm font-semibold text-gray-900">{order.buyerName}</p>
                          <p className="text-xs text-gray-500">{order.buyerEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">{order.phone}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
                          <p className="text-sm font-semibold text-gray-900">{order.fullName}</p>
                          <p className="text-xs text-gray-500">{order.address}</p>
                          <p className="text-xs text-gray-500">{order.city}</p>
                          {order.notes && (
                            <p className="text-xs text-purple-600 mt-1 italic">Note: {order.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Update Status */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">Update Status:</span>
                          {STATUS_FLOW.filter(s => STATUS_FLOW.indexOf(s) > STATUS_FLOW.indexOf(order.status)).map(s => {
                            const scfg = STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => handleUpdateStatus(order._id, s)}
                                disabled={updatingId === order._id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition disabled:opacity-50 ${scfg.bg} ${scfg.text} border-current hover:opacity-80`}
                              >
                                {updatingId === order._id
                                  ? <Loader className="w-3 h-3 animate-spin" />
                                  : <scfg.icon className="w-3 h-3" />
                                }
                                {scfg.label}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            disabled={updatingId === order._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 bg-red-100 text-red-700 border-red-200 hover:opacity-80 transition disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                          <CheckCircle className="w-5 h-5" /> Order completed and delivered
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-semibold">
                          <XCircle className="w-5 h-5" /> This order was cancelled
                        </div>
                      )}
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

export default OrderManagement;