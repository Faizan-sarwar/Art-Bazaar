import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, ShoppingBag, Star, Eye, Upload,
  Users, MessageSquare, ArrowRight, CheckCircle,
  Clock, Package, Award, BarChart2, Loader,
  AlertCircle, Palette, Zap, UserCheck
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import { orderAPI, artworkAPI } from '../services/api';
import { useUser, getImageUrl } from '../hooks/useUser';

const STATUS_CONFIG = {
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Delivered' },
  'in-transit': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package, label: 'In Transit' },
  confirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: CheckCircle, label: 'Confirmed' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Cancelled' },
};

export default function SellerHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = useUser(); // Using hook to get fresh user data

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, artworksRes] = await Promise.all([
          orderAPI.getSellerOrders(),
          artworkAPI.getMine()
        ]);
        setOrders(ordersRes.orders || []);
        setArtworks(artworksRes.artworks || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- ISSUE #25: Profile Completion Logic ---
  const calculateProfileCompletion = () => {
    const fields = ['fullName', 'email', 'avatar', 'bio', 'specialty', 'city'];
    const completed = fields.filter(field => user[field] && user[field].trim() !== '');
    return Math.round((completed.length / fields.length) * 100);
  };
  const profileCompletion = calculateProfileCompletion();

  // Real Database Metrics Calculation
  const totalEarnings = orders
    .filter(o => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'in-transit')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'in-transit'].includes(o.status));
  const totalViews = artworks.reduce((sum, a) => sum + (a.views || 0), 0);

  const averageRating = artworks.filter(a => a.rating > 0).length > 0
    ? (artworks.reduce((sum, a) => sum + (a.rating || 0), 0) / artworks.filter(a => a.rating > 0).length).toFixed(1)
    : '0.0';

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
          title="Seller Dashboard"
          subtitle="Manage your art business"
        />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">

          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
            <div className="relative z-10 flex-1">
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Artist'}! 🎨
              </h1>
              <p className="text-gray-500 text-sm">
                You have <strong className="text-purple-600">{activeOrders.length} active orders</strong> that need your attention today.
              </p>

              {/* ISSUE #25: Profile Completion Indicator */}
              {profileCompletion < 100 && (
                <div className="mt-4 bg-orange-50 border border-orange-100 p-4 rounded-xl max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-orange-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Profile Completion
                    </span>
                    <span className="text-xs font-black text-orange-700">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-orange-600 font-medium">Add bio, city, and avatar to reach 100%</p>
                    <Link to="/seller/profile" className="text-[10px] font-bold text-orange-700 hover:underline">Complete Profile →</Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 w-full md:w-auto">
              <Link to="/seller/upload">
                <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                  <Upload className="w-4 h-4" /> Upload New Artwork
                </button>
              </Link>
            </div>
          </div>

          {/* Key Metrics - Real Data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Total Earnings', value: `PKR ${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
              { label: 'Total Artworks', value: artworks.length, icon: Palette, color: 'bg-purple-50 text-purple-600' },
              { label: 'Profile Views', value: totalViews, icon: Eye, color: 'bg-orange-50 text-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Recent Orders - Real Data */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" /> Recent Orders
                </h3>
                <Link to="/seller/orders" className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1 p-5">
                {orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                    <ShoppingBag className="w-12 h-12 mb-3 text-gray-200" />
                    <p className="font-medium text-sm">No orders received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 4).map(order => {
                      const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                      return (
                        <div key={order._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <img src={getImageUrl(order.artworkImage)} alt="Artwork" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{order.artworkTitle}</h4>
                            <p className="text-xs text-gray-500 truncate">Buyer: {order.buyerName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-gray-900 text-sm mb-1">PKR {order.totalAmount?.toLocaleString()}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.text}`}>
                              <StatusIcon className="w-3 h-3" /> {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Reputation */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" /> Reputation
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center border-4 border-yellow-100">
                    <span className="text-2xl font-black text-yellow-600">{averageRating}</span>
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= Math.round(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Based on recent reviews</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Response Rate</span>
                    <span className="font-bold text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full w-full"></div></div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-500">Order Completion</span>
                    <span className="font-bold text-blue-600">
                      {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${orders.length > 0 ? (orders.filter(o => o.status === 'delivered').length / orders.length) * 100 : 0}%` }}></div></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/seller/earnings" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition text-center group">
                    <BarChart2 className="w-6 h-6 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-gray-700">Analytics</span>
                  </Link>
                  <Link to="/seller/chat" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition text-center group">
                    <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-gray-700">Messages</span>
                  </Link>
                  <Link to="/seller/custom-requests" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition text-center group">
                    <Palette className="w-6 h-6 text-pink-500 mx-auto mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-gray-700">Custom</span>
                  </Link>
                  <Link to="/seller/reviews" className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition text-center group">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold text-gray-700">Reviews</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}