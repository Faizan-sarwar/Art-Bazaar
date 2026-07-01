import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import {
  Users, TrendingUp, ShoppingCart,
  DollarSign, Eye, Star, Package,
  Loader, AlertCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, ordersData, artworksData, usersData] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getOrders({ limit: 500 }),
          adminAPI.getArtworks({ limit: 500 }),
          adminAPI.getUsers({ limit: 500 }),
        ]);
        setStats(statsData.stats);
        setOrders(ordersData.orders || []);
        setArtworks(artworksData.artworks || []);
        setUsers(usersData.users || []);
      } catch (err) {
        setError('Failed to load analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatPKR = (n) => {
    if (!n) return 'PKR 0';
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n}`;
  };

  // Monthly user signups
  const userMonthMap = {};
  users.forEach(u => {
    const m = new Date(u.createdAt).getMonth();
    userMonthMap[m] = (userMonthMap[m] || 0) + 1;
  });
  const userGrowth = Object.entries(userMonthMap)
    .map(([m, count]) => ({ month: parseInt(m), label: MONTHS[parseInt(m)], count }))
    .sort((a, b) => a.month - b.month);
  const maxGrowth = userGrowth.length > 0
    ? Math.max(...userGrowth.map(u => u.count))
    : 1;

  // Category breakdown from artworks
  const categoryMap = {};
  artworks.forEach(a => {
    if (!categoryMap[a.category]) categoryMap[a.category] = { count: 0, views: 0, sales: 0 };
    categoryMap[a.category].count += 1;
    categoryMap[a.category].views += a.views || 0;
    categoryMap[a.category].sales += a.sales || 0;
  });
  const categories = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxCatCount = categories.length > 0
    ? Math.max(...categories.map(c => c.count))
    : 1;

  // Order status breakdown
  const statusMap = {};
  orders.forEach(o => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });

  // Payment method breakdown
  const paymentMap = {};
  orders.forEach(o => {
    const method = o.paymentMethod || 'cod';
    paymentMap[method] = (paymentMap[method] || 0) + 1;
  });

  const PAYMENT_LABELS = {
    cod: 'Cash on Delivery',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash',
    bank: 'Bank Transfer',
  };

  const totalRev = stats?.totalRevenue || 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
        </div>
      </div>
    </div>
  );

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Artworks', value: stats?.totalArtworks || 0, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
    { label: 'Total Revenue', value: formatPKR(totalRev), icon: DollarSign, color: 'text-red-600 bg-red-50' },
    { label: 'Total Buyers', value: stats?.totalBuyers || 0, icon: Users, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Total Artists', value: stats?.totalArtists || 0, icon: Star, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Analytics"
          subtitle="Real platform performance — MongoDB data"
        />
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-5">

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}>
                    <m.icon size={17} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">
              User Growth by Month — Real Data
            </h3>
            {userGrowth.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
                No user data available
              </div>
            ) : (
              <div className="flex items-end gap-2 h-36">
                {userGrowth.map((u, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{u.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-lg transition-all"
                      style={{
                        height: `${(u.count / maxGrowth) * 100}px`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs text-gray-400">{u.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category & Order Status */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Artworks by Category</h3>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No artwork data</div>
              ) : (
                <div className="space-y-3">
                  {categories.map(c => (
                    <div key={c.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{c.views} views</span>
                          <span className="text-sm font-bold text-gray-900">{c.count} artworks</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
              {Object.keys(statusMap).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No order data</div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusMap).map(([status, count]) => {
                    const colors = {
                      pending: 'from-amber-400 to-amber-500',
                      confirmed: 'from-blue-400 to-blue-500',
                      'in-transit': 'from-purple-400 to-purple-500',
                      delivered: 'from-green-400 to-green-500',
                      cancelled: 'from-red-400 to-red-500',
                    };
                    const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700 font-medium capitalize">{status}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{pct}%</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[status] || 'from-gray-400 to-gray-500'} rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Payment Methods Used</h3>
            {Object.keys(paymentMap).length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No payment data</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(paymentMap).map(([method, count]) => {
                  const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                  return (
                    <div key={method} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <p className="text-2xl font-black text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500 mt-1">{PAYMENT_LABELS[method] || method}</p>
                      <p className="text-xs text-red-500 font-bold mt-1">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Platform Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Conversion Rate',
                  value: stats?.totalUsers && stats?.totalOrders
                    ? `${((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%`
                    : '0%',
                  color: 'text-green-600',
                  desc: 'Orders per user',
                },
                {
                  label: 'Avg Revenue / Artist',
                  value: stats?.totalArtists
                    ? formatPKR(Math.round(totalRev / stats.totalArtists))
                    : 'PKR 0',
                  color: 'text-purple-600',
                  desc: 'Revenue per seller',
                },
                {
                  label: 'Sold Artworks',
                  value: artworks.filter(a => !a.isAvailable).length,
                  color: 'text-blue-600',
                  desc: `Out of ${artworks.length} total`,
                },
              ].map(p => (
                <div key={p.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className={`text-2xl font-bold ${p.color}`}>{p.value}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-1">{p.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}