import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { DollarSign, TrendingUp, ShoppingCart, Users, Loader, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminRevenue() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getStats();
        setStats(res.stats);
      } catch (err) {
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const formatPKR = (n) => {
    if (!n) return 'PKR 0';
    if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
    return `PKR ${n.toLocaleString()}`;
  };

  // Real mapped data
  const totalRevenue = stats?.totalRevenue || 0;
  const platformFee = totalRevenue * 0.10; // Assuming a 10% platform fee

  const chartData = MONTHS.map((monthName, index) => {
    const data = stats?.monthlyRevenue?.find(m => m._id === index + 1);
    return {
      name: monthName,
      revenue: data ? data.revenue : 0,
      orders: data ? data.orders : 0
    };
  });

  const maxRev = Math.max(...chartData.map(d => d.revenue), 1000);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <Loader className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Revenue Center" subtitle="Financials & Payouts (Real Data)" />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" /> <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Gross Volume', value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: 'Est. Platform Fee', value: `PKR ${platformFee.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600', sub: '(10% of Gross)' },
              { label: 'Total Transactions', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
              { label: 'Avg Order Value', value: formatPKR(stats?.totalOrders ? Math.round(totalRevenue / stats.totalOrders) : 0), icon: Users, color: 'bg-orange-50 text-orange-600' },
            ].map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{m.label}</p>
                  <p className="text-xl font-black text-gray-900">{m.value}</p>
                  {m.sub && <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">{m.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900">Gross Revenue (2026)</h3>
              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                {['Overview', 'Monthly Breakdown'].map(t => (
                  <button
                    key={t} onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'Overview' ? (
              <div className="h-64 flex items-end gap-2 sm:gap-4 mt-8">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-gray-900 text-white text-[11px] font-bold py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
                      PKR {d.revenue.toLocaleString()}
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all ${d.revenue > 0 ? 'bg-gradient-to-t from-red-500 to-red-400 hover:opacity-80 cursor-pointer' : 'bg-gray-100'}`}
                      style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: '4px' }}
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{d.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Month</th>
                      <th className="px-4 py-3">Gross Revenue</th>
                      <th className="px-4 py-3">Total Orders</th>
                      <th className="px-4 py-3 rounded-r-xl">Platform Fee (10%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {chartData.filter(d => d.revenue > 0 || d.orders > 0).map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-bold text-gray-900">{d.name} 2026</td>
                        <td className="px-4 py-3 font-semibold text-green-600">PKR {d.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-gray-600">{d.orders}</td>
                        <td className="px-4 py-3 font-bold text-blue-600">PKR {(d.revenue * 0.1).toLocaleString()}</td>
                      </tr>
                    ))}
                    {chartData.filter(d => d.revenue > 0).length === 0 && (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-400">No revenue generated yet this year.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}