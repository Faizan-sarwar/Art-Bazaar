import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, ShoppingBag, ArrowUpRight,
  Calendar, Loader, AlertCircle, Eye, Star, Package
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import { orderAPI, artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EarningsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [ordersData, artworksData] = await Promise.all([
          orderAPI.getSellerOrders(),
          artworkAPI.getMine(),
        ]);
        setOrders(ordersData.orders || []);
        setArtworks(artworksData.artworks || []);
      } catch (err) {
        setError('Failed to load analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter valid earnings (ignore cancelled/pending)
  const completedOrders = orders.filter(o => ['delivered', 'confirmed', 'in-transit'].includes(o.status));

  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalSales = completedOrders.length;
  const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgOrderValue = totalSales > 0 ? Math.round(totalEarnings / totalSales) : 0;

  // Real Monthly Data Mapping
  const currentYear = new Date().getFullYear();
  const chartData = MONTHS.map((monthName, index) => {
    const monthOrders = completedOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === index && d.getFullYear() === currentYear;
    });
    const revenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { name: monthName, revenue, count: monthOrders.length };
  });

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000); // Floor of 1000 to prevent division by zero

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <Loader className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Earnings & Analytics"
          subtitle="Track your true financial performance"
        />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-gray-900">Performance Overview</h2>
            <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm w-max">
              {['week', 'month', 'year'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition capitalize ${period === p ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Earnings', value: `PKR ${totalEarnings.toLocaleString()}`, icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600' },
              { label: 'Artworks Sold', value: totalSales, icon: ShoppingBag, bg: 'bg-blue-50', color: 'text-blue-600' },
              { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Avg. Order Value', value: `PKR ${avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{m.label}</p>
                  <p className="text-xl font-black text-gray-900">{m.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
                <p className="text-sm text-gray-500">Gross sales for {currentYear}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                <TrendingUp className="w-4 h-4" /> Live Data
              </div>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 mt-8">
              {chartData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-10">
                    PKR {data.revenue.toLocaleString()}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>

                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${data.revenue > 0 ? 'bg-gradient-to-t from-purple-600 to-indigo-500 cursor-pointer hover:opacity-80' : 'bg-gray-100'}`}
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{data.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Performance Table */}
          {artworks.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Artwork Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-4">Artwork</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Views</th>
                      <th className="px-5 py-4">Sales</th>
                      <th className="px-5 py-4">Rating</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {artworks.map(art => (
                      <tr key={art._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                              <img src={getImageUrl(art.image)} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                            </div>
                            <span className="font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">{art.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          PKR {art.price?.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-gray-600">{(art.views || 0).toLocaleString()}</td>
                        <td className="px-5 py-3 font-bold text-indigo-600">{art.sales || 0}</td>
                        <td className="px-5 py-3">
                          {art.rating > 0 ? (
                            <div className="flex items-center gap-1 font-bold text-gray-700 bg-yellow-50 px-2 py-1 rounded w-max">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" /> {art.rating.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs font-semibold">New</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${art.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>
                            {art.isAvailable ? 'Available' : 'Sold'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}