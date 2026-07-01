import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import {
  Users, ShoppingBag, DollarSign, Package,
  ArrowRight, Activity, Loader, AlertCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';

export default function AdminHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, r] = await Promise.all([adminAPI.getStats(), adminAPI.getRecent()]);
        setStats(s.stats);
        setRecent(r);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatPKR = (n) => {
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n || 0}`;
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Approvals', value: stats?.pendingApproval || 0, icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Total Revenue', value: formatPKR(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Admin Home"
          subtitle="Welcome back to ArtBazaar Admin"
        />
        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {/* Hero */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
                </h2>
                <p className="text-slate-300 text-sm">
                  Here's what's happening on ArtBazaar right now.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition self-start sm:self-auto"
              >
                View Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats — real data */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
                  {s.label === 'Pending Approvals' && s.value > 0 && (
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                  <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                    <s.icon size={18} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activity — real data */}
          {!loading && recent && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Recent Users</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Activity size={13} /> Live
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {recent.recentUsers?.map(u => (
                    <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${u.role === 'artist' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
                  {recent.recentOrders?.length === 0 ? (
                    <p className="text-center py-8 text-gray-400 text-sm">No orders yet</p>
                  ) : (
                    recent.recentOrders?.map(o => (
                      <div key={o._id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{o.artworkTitle}</p>
                          <p className="text-xs text-gray-400">{o.buyerName} → {o.sellerName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">PKR {o.totalAmount?.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 capitalize">{o.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Manage Users', path: '/admin/users', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'Pending Approvals', path: '/admin/artworks', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { label: 'View Orders', path: '/admin/transactions', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { label: 'Analytics', path: '/admin/analytics', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              ].map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className={`${a.color} rounded-xl px-3 py-3 text-sm font-semibold text-center transition`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}