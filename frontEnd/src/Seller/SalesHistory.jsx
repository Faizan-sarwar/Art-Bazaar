import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, XCircle, Download,
  Loader, AlertCircle, Search, TrendingUp,
  DollarSign, ShoppingBag, Package
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { orderAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const COMMISSION = 0.10;

const STATUS_MAP = {
  delivered:   { status: 'completed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed'  },
  pending:     { status: 'pending',   bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock,       label: 'Pending'    },
  confirmed:   { status: 'pending',   bg: 'bg-blue-100',  text: 'text-blue-700',  icon: Clock,       label: 'Confirmed'  },
  'in-transit':{ status: 'pending',   bg: 'bg-indigo-100',text: 'text-indigo-700',icon: Package,     label: 'In Transit' },
  cancelled:   { status: 'refunded',  bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircle,     label: 'Cancelled'  },
};

export default function SalesHistory() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [tab,          setTab]          = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderAPI.getSellerOrders();
        setOrders(data.orders || []);
      } catch (err) {
        setError('Failed to load sales: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatPKR = (n) => {
    if (!n) return 'PKR 0';
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n}`;
  };

  // Map orders to sales format
  const sales = orders.map(o => {
    const cfg = STATUS_MAP[o.status] || STATUS_MAP.pending;
    return {
      _id:        o._id,
      orderNumber:o.orderNumber || o._id.slice(-6).toUpperCase(),
      artwork:    o.artworkTitle,
      artworkImg: o.artworkImage,
      buyer:      o.buyerName,
      amount:     o.totalAmount || 0,
      commission: Math.round((o.totalAmount || 0) * COMMISSION),
      net:        Math.round((o.totalAmount || 0) * (1 - COMMISSION)),
      status:     cfg.status,
      displayStatus: cfg,
      date:       formatDate(o.createdAt),
      createdAt:  o.createdAt,
      paymentMethod: o.paymentMethod || 'cod',
    };
  });

  // Filter
  const filtered = sales.filter(s => {
    const matchTab = tab === 'all' || s.status === tab;
    const q        = searchQuery.toLowerCase();
    const matchQ   = !q || s.artwork.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q);
    return matchTab && matchQ;
  });

  // Stats
  const completedSales = sales.filter(s => s.status === 'completed');
  const totalNet       = completedSales.reduce((sum, s) => sum + s.net, 0);
  const avgNet         = completedSales.length > 0 ? Math.round(totalNet / completedSales.length) : 0;

  const tabs = [
    { id: 'all',       label: 'All',       count: sales.length                                       },
    { id: 'completed', label: 'Completed', count: sales.filter(s => s.status === 'completed').length },
    { id: 'pending',   label: 'Pending',   count: sales.filter(s => s.status === 'pending').length   },
    { id: 'refunded',  label: 'Cancelled', count: sales.filter(s => s.status === 'refunded').length  },
  ];

  const summaryCards = [
    { label: 'Total Sales',   value: sales.length,                     color: 'text-indigo-700', bg: 'bg-indigo-50', icon: ShoppingBag, iconBg: 'bg-indigo-500' },
    { label: 'Completed',     value: completedSales.length,            color: 'text-green-700',  bg: 'bg-green-50',  icon: CheckCircle, iconBg: 'bg-green-500'  },
    { label: 'Total Net',     value: formatPKR(totalNet),              color: 'text-indigo-700', bg: 'bg-indigo-50', icon: DollarSign,  iconBg: 'bg-indigo-500' },
    { label: 'Avg Net / Sale',value: formatPKR(avgNet),                color: 'text-purple-700', bg: 'bg-purple-50', icon: TrendingUp,  iconBg: 'bg-purple-500' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading sales history...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Sales History"
          subtitle={`${sales.length} total transactions`}
        />

        <main className="p-4 md:p-6 space-y-5 w-full max-w-7xl mx-auto">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summaryCards.map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl border border-white shadow-sm p-4`}>
                <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                    tab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                  <span className={`ml-1 text-xs ${tab === t.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    ({t.count})
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No sales found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try a different search term' : 'No sales in this category yet'}
              </p>
            </div>
          )}

          {/* Sales List */}
          <div className="space-y-3">
            {filtered.map(sale => {
              const cfg  = sale.displayStatus;
              const Icon = cfg.icon;
              return (
                <div key={sale._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {sale.artworkImg ? (
                        <img
                          src={getImageUrl(sale.artworkImg)}
                          alt={sale.artwork}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl">🎨</div>
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-400 font-mono">#{sale.orderNumber} · {sale.date}</p>
                          <h3 className="font-bold text-gray-900 text-sm mt-0.5">{sale.artwork}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Buyer: <span className="font-semibold text-gray-700">{sale.buyer}</span>
                            {' · '}
                            <span className="uppercase text-xs text-gray-400">{sale.paymentMethod}</span>
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3.5 h-3.5" /> {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                        <div className="flex gap-4 text-xs text-gray-600">
                          <div>
                            <p className="text-gray-400 mb-0.5">Gross Sale</p>
                            <p className="font-bold text-gray-900">PKR {sale.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-0.5">Commission (10%)</p>
                            <p className="font-bold text-red-500">-PKR {sale.commission.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">Net Earnings</p>
                          <p className="font-black text-indigo-600 text-base">PKR {sale.net.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}