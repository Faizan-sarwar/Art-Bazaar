import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Package, Truck, CheckCircle,
  XCircle, Clock, Loader, AlertCircle,
  CreditCard, Search, ChevronDown, ChevronUp,
  MapPin, Phone, StickyNote
} from 'lucide-react';
import AdminSidebar  from './AdminSidebar';
import AdminHeader   from './AdminHeader';
import { storeOrderAPI } from '../services/api';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',  dot: 'bg-amber-400',   icon: Clock,        strip: 'bg-amber-400'   },
  confirmed:  { label: 'Confirmed',  bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200',    dot: 'bg-sky-400',     icon: CheckCircle,  strip: 'bg-sky-400'     },
  processing: { label: 'Processing', bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200', dot: 'bg-violet-400',  icon: Package,      strip: 'bg-violet-400'  },
  shipped:    { label: 'Shipped',    bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',   dot: 'bg-blue-400',    icon: Truck,        strip: 'bg-blue-400'    },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200',dot: 'bg-emerald-400', icon: CheckCircle,  strip: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50',     text: 'text-red-500',     border: 'border-red-200',    dot: 'bg-red-400',     icon: XCircle,      strip: 'bg-red-400'     },
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function OrderCard({ order, onStatusUpdate, updating }) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Status color strip */}
      <div className={`h-1 w-full ${cfg.strip}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order</span>
              <span className="text-sm font-black text-gray-900">#{order.orderNumber}</span>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>

            {/* Payment badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border ${
              order.paymentMethod === 'card'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <CreditCard className="w-3 h-3" />
              {order.paymentMethod === 'card' ? `Card ····${order.cardLast4}` : 'COD'}
            </span>
          </div>
        </div>

        {/* Buyer info */}
        <div className="p-3 bg-gray-50 rounded-xl mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Customer</p>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(order.fullName || order.buyerName || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 text-sm">{order.fullName || order.buyerName}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" /> {order.phone}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /> {order.address}, {order.city}
                </span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-1 mt-1.5">
                  <StickyNote className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-600 font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Items</p>
          {(expanded ? order.items : order.items.slice(0, 2)).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-xl flex-shrink-0">
                {item.emoji || '🎨'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.productName}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} × PKR {item.price?.toLocaleString()}</p>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                PKR {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          {order.items.length > 2 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-red-500 hover:text-red-600 transition"
            >
              {expanded
                ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                : <><ChevronDown className="w-3.5 h-3.5" /> +{order.items.length - 2} more items</>
              }
            </button>
          )}
        </div>

        {/* Total + Status updater */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order Total</p>
            <p className="font-black text-red-600 text-xl">PKR {order.total?.toLocaleString()}</p>
          </div>

          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {/* Toggle status panel */}
            <button
              onClick={() => setShowActions(a => !a)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              {updating ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <StatusIcon className="w-3.5 h-3.5" />
              )}
              Update Status
              {showActions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Status options dropdown */}
            {showActions && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {STATUS_OPTIONS.map(s => {
                  const c        = STATUS_CONFIG[s];
                  const isActive = order.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        if (!isActive) {
                          onStatusUpdate(order._id, s);
                          setShowActions(false);
                        }
                      }}
                      disabled={isActive || updating}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isActive
                          ? `${c.bg} ${c.text} ${c.border} cursor-default`
                          : `bg-white text-gray-600 border-gray-200 hover:${c.bg} hover:${c.text} hover:${c.border} disabled:opacity-50`
                      }`}
                    >
                      <c.icon className="w-3 h-3" />
                      {c.label}
                      {isActive && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminStoreOrders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('all');
  const [search,      setSearch]      = useState('');
  const [updating,    setUpdating]    = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await storeOrderAPI.getAllAdmin();
        setOrders(data.orders || []);
      } catch (err) {
        setError('Failed to load orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const data = await storeOrderAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o =>
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName?.toLowerCase().includes(search.toLowerCase())
    );

  const stats = [
    { label: 'Total Orders', value: orders.length,                                                      color: 'text-gray-900'    },
    { label: 'Pending',      value: orders.filter(o => o.status === 'pending').length,                  color: 'text-amber-500'   },
    { label: 'Shipped',      value: orders.filter(o => o.status === 'shipped').length,                  color: 'text-blue-500'    },
    { label: 'Delivered',    value: orders.filter(o => o.status === 'delivered').length,                color: 'text-emerald-500' },
    { label: 'Revenue',      value: `PKR ${orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}`, color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Store Orders"
          subtitle="Manage and fulfill art supply orders"
        />

        <main className="p-4 md:p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by order # or buyer name..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', ...STATUS_OPTIONS].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    filter === f
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                  {f !== 'all' && orders.filter(o => o.status === f).length > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {orders.filter(o => o.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-1">Something went wrong</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-red-300" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">No orders found</h3>
              <p className="text-gray-400 text-sm">Try changing the filter or search term.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  updating={updating === order._id}
                />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}