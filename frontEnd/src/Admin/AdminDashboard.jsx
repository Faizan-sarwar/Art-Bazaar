import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import {
  Users, DollarSign, Package, TrendingUp,
  ShoppingCart, Loader, Clock, CheckCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsData, recentData] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getRecent(),
        ]);
        setStats(statsData.stats);
        setRecent(recentData);
      } catch (err) {
        console.error('Dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatPKR = (n) => {
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n}`;
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  // BUG FIX: Map real MongoDB data to all 12 months for a beautiful UI
  const chartData = MONTHS.map((monthName, index) => {
    const monthData = stats?.monthlyRevenue?.find(m => m._id === index + 1);
    return {
      name: monthName,
      revenue: monthData ? monthData.revenue : 0,
      orders: monthData ? monthData.orders : 0
    };
  });

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000); // Floor of 1000 to prevent zero division

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, sub: `${stats?.totalBuyers || 0} buyers · ${stats?.totalArtists || 0} artists`, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Revenue', value: formatPKR(stats?.totalRevenue || 0), sub: 'All time', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Artworks', value: stats?.totalArtworks || 0, sub: 'Listed on platform', icon: Package, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, sub: `${stats?.pendingOrders || 0} pending`, icon: ShoppingCart, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
          subtitle="Platform overview — real data"
        />
        <main className="p-4 md:p-6 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-sm`}>
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <s.icon size={18} />
                </div>
                <p className="text-xl md:text-2xl font-bold">{s.value}</p>
                <p className="text-white/80 text-xs mt-0.5">{s.label}</p>
                <p className="text-white/60 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart — mapped to all 12 months */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">
              Monthly Revenue — 2026
            </h3>
            <div className="flex items-end gap-2 h-40">
              {chartData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <span className="text-[10px] text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    {m.revenue > 0 ? `PKR ${(m.revenue / 1000).toFixed(0)}K` : ''}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${m.revenue > 0 ? 'bg-gradient-to-t from-red-500 to-red-400' : 'bg-gray-100'}`}
                    style={{ height: `${(m.revenue / maxRevenue) * 120}px`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users & Orders */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Recent Users */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Users</h3>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recent?.recentUsers?.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No users yet</p>
                ) : (
                  recent?.recentUsers?.map(u => (
                    <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{u.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'artist'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'admin'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                          {u.role}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <button
                  onClick={() => navigate('/admin/transactions')}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recent?.recentOrders?.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No orders yet</p>
                ) : (
                  recent?.recentOrders?.map(o => (
                    <div key={o._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getImageUrl(o.artworkImage)}
                          alt={o.artworkTitle}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{o.artworkTitle}</p>
                        <p className="text-xs text-gray-400 truncate">by {o.buyerName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          PKR {o.totalAmount?.toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          o.status === 'in-transit' ? 'bg-purple-100 text-purple-700' :
                            o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                          }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Artworks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Recently Uploaded Artworks</h3>
              <button
                onClick={() => navigate('/admin/artworks')}
                className="text-xs text-red-500 font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4">
              {recent?.recentArtworks?.length === 0 ? (
                <p className="col-span-5 text-center py-8 text-gray-400 text-sm">No artworks yet</p>
              ) : (
                recent?.recentArtworks?.map(a => (
                  <div key={a._id} className="rounded-xl overflow-hidden border border-gray-100">
                    <div className="h-24 bg-gray-100 overflow-hidden">
                      <img
                        src={getImageUrl(a.image)}
                        alt={a.title}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400 truncate">by {a.artistName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}