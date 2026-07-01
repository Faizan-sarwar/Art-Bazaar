import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, Truck, CheckCircle,
  XCircle, Clock, Loader, AlertCircle,
  CreditCard, Store, ChevronDown, ChevronUp
} from 'lucide-react';
import BuyerSidebar  from './BuyerSidebar';
import BuyerHeader   from './BuyerHeader';
import { storeOrderAPI } from '../services/api';
import { getImageUrl }   from '../hooks/useUser';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200', dot: 'bg-amber-400',  icon: Clock,        step: 0 },
  confirmed:  { label: 'Confirmed',  bg: 'bg-sky-50',     text: 'text-sky-600',    border: 'border-sky-200',   dot: 'bg-sky-400',    icon: CheckCircle,  step: 1 },
  processing: { label: 'Processing', bg: 'bg-violet-50',  text: 'text-violet-600', border: 'border-violet-200',dot: 'bg-violet-400', icon: Package,      step: 2 },
  shipped:    { label: 'Shipped',    bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200',  dot: 'bg-blue-400',   icon: Truck,        step: 3 },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200',dot:'bg-emerald-400', icon: CheckCircle,  step: 4 },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50',     text: 'text-red-500',    border: 'border-red-200',   dot: 'bg-red-400',    icon: XCircle,      step: -1 },
};

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg      = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* Top color strip based on status */}
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order</span>
              <span className="text-sm font-black text-gray-900">#{order.orderNumber}</span>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Items preview */}
        <div className="space-y-2 mb-4">
          {(expanded ? order.items : order.items.slice(0, 2)).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                {item.emoji || '🎨'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.productName}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                PKR {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}

          {order.items.length > 2 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition"
            >
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> +{order.items.length - 2} more items</>
              )}
            </button>
          )}
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="mb-4">
            <div className="relative flex items-center justify-between">
              {/* connecting line */}
              <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-3 left-3 h-0.5 bg-purple-500 z-0 transition-all duration-500"
                style={{ width: currentStep >= 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%' }}
              />
              {STEPS.map((step, i) => {
                const done    = i <= currentStep;
                const active  = i === currentStep;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      done
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-white border-gray-300'
                    } ${active ? 'ring-4 ring-purple-100' : ''}`}>
                      {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <p className={`text-xs font-semibold hidden sm:block ${done ? 'text-purple-600' : 'text-gray-400'}`}>
                      {STATUS_CONFIG[step]?.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-red-600">This order was cancelled.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              order.paymentMethod === 'card'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <CreditCard className="w-3 h-3" />
              {order.paymentMethod === 'card'
                ? `Card ····${order.cardLast4}`
                : 'Cash on Delivery'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Total paid</p>
            <p className="font-black text-purple-600 text-lg leading-none">
              PKR {order.total?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Delivery address */}
        <div className="mt-3 flex items-start gap-2 p-3 bg-purple-50 rounded-xl">
          <Package className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700 font-medium leading-relaxed">
            <span className="font-bold">{order.fullName}</span> · {order.address}, {order.city}
            {order.phone && <span className="text-purple-500"> · {order.phone}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BuyerStoreOrders() {
  const navigate                      = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await storeOrderAPI.getMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError('Failed to load orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const stats = [
    { label: 'Total',     value: orders.length,                                          color: 'text-gray-900'    },
    { label: 'Pending',   value: orders.filter(o => o.status === 'pending').length,      color: 'text-amber-500'   },
    { label: 'Shipped',   value: orders.filter(o => o.status === 'shipped').length,      color: 'text-blue-500'    },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length,    color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Store Orders"
          subtitle="Track your art supply purchases"
        />

        <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {f === 'all' ? 'All Orders' : STATUS_CONFIG[f]?.label || f}
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

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-1">Something went wrong</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">
                {filter === 'all' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label || filter} orders`}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {filter === 'all'
                  ? 'Your art supply orders will appear here.'
                  : 'Try a different filter to see other orders.'}
              </p>
              <button
                onClick={() => navigate('/buyer/store')}
                className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200"
              >
                Browse Art Store
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}