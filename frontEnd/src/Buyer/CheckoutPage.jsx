import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ShoppingBag, MapPin, CreditCard,
  Truck, CheckCircle, Loader, AlertCircle,
  Package, Info, MessageCircle
} from 'lucide-react';
import BuyerSidebar        from './BuyerSidebar';
import BuyerHeader         from './BuyerHeader';
import { artworkAPI, orderAPI } from '../services/api';
import { getImageUrl }     from '../hooks/useUser';

const PAYMENT_METHODS = [
  {
    id:    'cod',
    label: 'Cash on Delivery',
    icon:  '💵',
    desc:  'Pay cash when artwork arrives',
    info:  'Keep exact amount ready. Delivery partner collects at your door. Estimated 5-7 business days.',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
  },
  {
    id:    'p2p',
    label: 'P2P Transfer',
    icon:  '🏦',
    desc:  'EasyPaisa / JazzCash / Bank',
    info:  'After placing order: open Messages → ask artist for payment details → send money → share screenshot as Payment Proof → artist confirms order.',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
];

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const artworkId = location.state?.artworkId
    || new URLSearchParams(location.search).get('artworkId');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artwork,     setArtwork]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [placing,     setPlacing]     = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success,     setSuccess]     = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    fullName:      storedUser.fullName || '',
    phone:         storedUser.phone    || '',
    address:       storedUser.address  || '',
    city:          storedUser.city     || '',
    notes:         '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    if (!artworkId) {
      setError('No artwork selected. Please go back and click Buy Now on an artwork.');
      setLoading(false);
      return;
    }
    artworkAPI.getById(artworkId)
      .then(d => setArtwork(d.artwork))
      .catch(() => setError('Failed to load artwork details.'))
      .finally(() => setLoading(false));
  }, [artworkId]);

  const sel = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(f => ({ ...f, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Required';
    if (!form.phone.trim())    errs.phone    = 'Required';
    if (!form.address.trim())  errs.address  = 'Required';
    if (!form.city.trim())     errs.city     = 'Required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    setError('');
    try {
      const data = await orderAPI.create({
        artworkId,
        fullName:      form.fullName,
        phone:         form.phone,
        address:       form.address,
        city:          form.city,
        notes:         form.notes,
        paymentMethod: form.paymentMethod,
      });
      setSuccess(data.order);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 transition ${
      fieldErrors[field]
        ? 'border-red-300 focus:ring-red-200'
        : 'border-gray-200 focus:ring-purple-200 focus:border-purple-400'
    }`;

  const selectedPM = PAYMENT_METHODS.find(p => p.id === form.paymentMethod);

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    </div>
  );

  // ── No artwork ───────────────────────────────────────────
  if (!artwork) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Cannot load checkout</h3>
          <p className="text-gray-500 text-sm mb-6">{error || 'Artwork not found'}</p>
          <button onClick={() => navigate('/buyer/browse')}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition">
            Browse Artworks
          </button>
        </div>
      </div>
    </div>
  );

  // ── Success ──────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Order Placed! 🎉</h2>
          <p className="text-gray-500 text-sm mb-1">
            Order <span className="font-bold text-gray-700">#{success.orderNumber}</span>
          </p>
          <p className="text-purple-600 font-black text-xl mb-5">
            PKR {artwork?.price?.toLocaleString()}
          </p>

          {form.paymentMethod === 'cod' ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left mb-5">
              <p className="text-amber-800 font-black text-sm mb-2">💵 Cash on Delivery</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                Keep <strong>PKR {artwork?.price?.toLocaleString()}</strong> ready when your artwork arrives.
                Estimated delivery: 5-7 business days.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-left mb-5">
              <p className="text-blue-800 font-black text-sm mb-3">🏦 Next Step — Send Payment</p>
              <div className="space-y-2">
                {[
                  'Go to Messages and open chat with the artist',
                  'Ask for their EasyPaisa / JazzCash / Bank details',
                  `Send PKR ${artwork?.price?.toLocaleString()} and take a screenshot`,
                  'Send screenshot in chat — tap 📎 then select "Payment Proof"',
                  'Artist confirms payment → order status updates',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs text-white ${i === 4 ? 'bg-green-600' : 'bg-blue-600'}`}>
                      {i + 1}
                    </span>
                    <p className="text-blue-700 text-xs">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            {form.paymentMethod === 'p2p' && (
              <button onClick={() => navigate('/buyer/messages')}
                className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Go to Messages
              </button>
            )}
            <button onClick={() => navigate('/buyer/orders')}
              className="px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-purple-300 hover:text-purple-600 transition text-sm">
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Checkout"
          subtitle="Complete your purchase"
        />

        <main className="p-4 md:p-6 max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-red-700">{error}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-5">

              {/* Delivery Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Delivery Information</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input value={form.fullName} onChange={e => sel('fullName', e.target.value)}
                      placeholder="Recipient full name" className={inputCls('fullName')} />
                    {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input value={form.phone} onChange={e => sel('phone', e.target.value)}
                      placeholder="+92 300 1234567" className={inputCls('phone')} />
                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input value={form.address} onChange={e => sel('address', e.target.value)}
                      placeholder="House no, street, area" className={inputCls('address')} />
                    {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input value={form.city} onChange={e => sel('city', e.target.value)}
                      placeholder="e.g. Lahore" className={inputCls('city')} />
                    {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Notes (optional)
                    </label>
                    <input value={form.notes} onChange={e => sel('notes', e.target.value)}
                      placeholder="Special instructions..." className={inputCls('notes')} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-base">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Payment Method</span>
                </h2>
                <p className="text-xs text-gray-500 mb-4">Select how you will pay for this artwork</p>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id} onClick={() => sel('paymentMethod', pm.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left relative ${
                        form.paymentMethod === pm.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}>
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {pm.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${form.paymentMethod === pm.id ? 'text-purple-700' : 'text-gray-900'}`}>
                          {pm.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                      </div>
                      {form.paymentMethod === pm.id && (
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {selectedPM && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${selectedPM.color}`}>
                    <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedPM.iconColor}`} />
                    <p className={`text-xs leading-relaxed font-medium ${selectedPM.textColor}`}>
                      {selectedPM.info}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Order Summary</span>
                </h2>

                <div className="flex gap-3 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    <img src={getImageUrl(artwork.image)} alt={artwork.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{artwork.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">by {artwork.artistName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-lg font-semibold">
                      {artwork.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Artwork Price</span>
                    <span className="font-semibold text-gray-900">PKR {artwork.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-semibold text-green-600">Free 🎁</span>
                  </div>
                  <div className="flex justify-between font-black pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-600 text-lg">PKR {artwork.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-blue-700 text-xs font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">Estimated delivery: 5-7 business days</span>
                  </p>
                </div>

                <button onClick={handlePlaceOrder} disabled={placing}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xl shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {placing
                    ? <><Loader className="w-5 h-5 animate-spin" /> Placing Order...</>
                    : <><Package className="w-5 h-5" /> Place Order</>
                  }
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure & safe checkout</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}