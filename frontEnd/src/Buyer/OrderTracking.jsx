import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Package, Truck, CheckCircle,
  MapPin, Clock, Shield, Loader, AlertCircle,
  XCircle, MessageCircle
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { orderAPI, messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Your order has been received by the artist', icon: Package },
  { key: 'confirmed', label: 'Order Confirmed', desc: 'Artist has confirmed and is preparing your artwork', icon: CheckCircle },
  { key: 'in-transit', label: 'In Transit', desc: 'Your artwork is on its way to you', icon: Truck },
  { key: 'delivered', label: 'Delivered', desc: 'Your artwork has been delivered successfully', icon: CheckCircle },
];

const PAYMENT_LABELS = {
  cod: 'Cash on Delivery', easypaisa: 'Easypaisa', jazzcash: 'JazzCash', bank: 'Bank Transfer',
};

// Simulated Transit Hubs for UI
const TRANSIT_HUBS = [
  { label: 'Origin City (Seller)', time: '09:00 AM' },
  { label: 'Central Logistics Hub', time: '14:30 PM' },
  { label: 'Destination City Hub', time: '08:15 AM' },
  { label: 'Out for Delivery', time: '10:00 AM' },
  { label: 'Delivered Successfully', time: '14:45 PM' }
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderAPI.getById(id);
        setOrder(data.order);
      } catch (err) {
        setError(err.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleChat = async () => {
    if (!order) return;
    setChatLoading(true);
    try {
      const res = await messageAPI.getOrCreateConversation(order.seller);
      navigate('/buyer/messages', { state: { conversationId: res.conversation._id } });
    } catch (err) {
      alert('Failed to start chat: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <Loader className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Order Not Found'}</h2>
        <button onClick={() => navigate('/buyer/orders')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold">
          Back to Orders
        </button>
      </div>
    </div>
  );

  const isCancelled = order.status === 'cancelled';
  let currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  if (currentStepIndex === -1 && !isCancelled) currentStepIndex = 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader onMenuClick={() => setSidebarOpen(true)} title="Track Order" subtitle={`Order ID: ${order.orderNumber || order._id.toString().slice(-6).toUpperCase()}`} />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">

          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 transition mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to orders
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Status Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
                  {isCancelled ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-lg text-xs flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> CANCELLED
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                      Est. Delivery: 5-7 Days
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {!isCancelled && (
                  <div className="relative mt-8 mb-4">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1.5 bg-purple-600 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={step.key} className="flex flex-col items-center relative group">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-colors ${isCompleted ? 'bg-purple-600 text-white ring-4 ring-purple-50' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                              <step.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="absolute top-12 w-24 sm:w-32 text-center">
                              <p className={`text-[10px] sm:text-xs font-bold mt-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Location History (Simulated) */}
              {['in-transit', 'delivered'].includes(order.status) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mt-6">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" /> Transit Milestones
                  </h3>
                  <div className="relative border-l-2 border-purple-200 ml-3 space-y-8">
                    {TRANSIT_HUBS.map((hub, idx) => {
                      // Logic to show partial list if merely in-transit
                      if (order.status === 'in-transit' && idx > 2) return null;
                      const isLast = idx === TRANSIT_HUBS.length - 1 || (order.status === 'in-transit' && idx === 2);
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${isLast && order.status === 'in-transit' ? 'bg-amber-500 animate-pulse' : 'bg-purple-500'}`} />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{hub.label}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {idx === 0 ? new Date(order.createdAt).toLocaleDateString() : 'Update automatically tracked'} · {hub.time}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Shipping Address</p>
                    <p className="font-semibold text-gray-900 text-sm">{order.fullName}</p>
                    <p className="text-gray-600 text-sm">{order.address}</p>
                    <p className="text-gray-600 text-sm">{order.city}</p>
                    <p className="text-gray-600 text-sm mt-1">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {PAYMENT_LABELS[order.paymentMethod] || 'Cash on Delivery'}
                      {order.paymentStatus === 'paid' && (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-md uppercase font-bold">PAID</span>
                      )}
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2 border border-blue-100">
                      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 font-medium">Your payment is protected by ArtBazaar's buyer guarantee until delivery.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Item Details</h3>
                <div className="flex gap-3 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={getImageUrl(order.artworkImage)} alt="Artwork" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{order.artworkTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: 1</p>
                    <p className="font-black text-purple-700 text-sm mt-1">PKR {order.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">PKR {order.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-black mt-3 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-purple-700">PKR {order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Artist */}
              <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Contact Artist</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                    {order.sellerName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{order.sellerName}</p>
                    <p className="text-xs text-purple-600 font-semibold">Artist</p>
                  </div>
                </div>
                <button
                  onClick={handleChat}
                  disabled={chatLoading}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-purple-200"
                >
                  {chatLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  Send Message
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}