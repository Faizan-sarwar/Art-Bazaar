import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, MapPin, CreditCard, Truck,
  Package, Loader, AlertCircle, CheckCircle,
  Lock, ShoppingBag
} from 'lucide-react';
import BuyerSidebar      from './BuyerSidebar';
import BuyerHeader       from './BuyerHeader';
import { storeOrderAPI, stripeAPI } from '../services/api';
import { getImageUrl }   from '../hooks/useUser';
import { loadStripe }    from '@stripe/stripe-js';
import {
  Elements, CardElement, useStripe, useElements
} from '@stripe/react-stripe-js';

const GRADIENTS = {
  Paints: 'from-purple-100 to-pink-100', Brushes: 'from-amber-100 to-orange-100',
  Canvas: 'from-blue-100 to-indigo-100', Sketchbooks: 'from-green-100 to-teal-100',
  Tools:  'from-rose-100 to-pink-100',   Digital: 'from-slate-100 to-gray-100',
  Other:  'from-purple-100 to-blue-100',
};

const stripePromise = loadStripe('pk_test_51TV8yuKIVREJUo3djJcWD8n3d3wKamNjBDdeHrKPy2aL83eG4ixvIo7eHgkLoyo1xneyEjBkH7U2nZP0hsbrpXbi00ALYxqXXg');

// ── Inner checkout form (needs Stripe context) ───────────────
function CheckoutForm({ cart, onSuccess }) {
  const navigate = useNavigate();
  const stripe   = useStripe();
  const elements = useElements();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing,       setPlacing]       = useState(false);
  const [error,         setError]         = useState('');
  const [fieldErrors,   setFieldErrors]   = useState({});

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    fullName: storedUser.fullName || '',
    phone:    storedUser.phone    || '',
    address:  storedUser.address  || '',
    city:     storedUser.city     || '',
    notes:    '',
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 200;
  const total    = subtotal + shipping;

  const sel = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(f => ({ ...f, [key]: '' }));
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
    if (cart.length === 0) { setError('Your cart is empty'); return; }

    setPlacing(true);
    setError('');

    try {
      // ── COD path ──────────────────────────────────────────
      if (paymentMethod === 'cod') {
        const data = await storeOrderAPI.create({
          items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
          fullName: form.fullName, phone: form.phone,
          address:  form.address,  city:  form.city,
          notes: form.notes, paymentMethod: 'cod',
        });
        onSuccess(data.order, 'cod');
        return;
      }

      // ── Card / Stripe path ────────────────────────────────
      if (!stripe || !elements) {
        setError('Stripe not loaded yet. Please wait a moment and try again.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found. Please refresh and try again.');
        return;
      }

      // 1. Get PaymentIntent clientSecret from backend
      const { clientSecret } = await stripeAPI.createPaymentIntent({
        amount: total,   // backend converts PKR → USD cents
      });

      // 2. Confirm card payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name: form.fullName },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please check your card details.');
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        setError('Payment not completed. Please try again.');
        return;
      }

      // 3. Save order in DB with stripePaymentId
      const data = await storeOrderAPI.create({
        items: cart.map(i => ({ productId: i._id, quantity: i.quantity })),
        fullName: form.fullName, phone: form.phone,
        address:  form.address,  city:  form.city,
        notes: form.notes, paymentMethod: 'card',
        stripePaymentId: paymentIntent.id,
        cardLast4: paymentIntent.payment_method_details?.card?.last4 || '',
      });

      onSuccess(data.order, 'card');

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Store Checkout"
          subtitle={`${cart.reduce((s, i) => s + i.quantity, 0)} items`}
        />

        <main className="p-4 md:p-6 max-w-5xl mx-auto">
          <button onClick={() => navigate('/buyer/store')}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition">
            <ChevronLeft className="w-4 h-4" /> Back to Store
          </button>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-red-700">{error}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Delivery */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" /> Delivery Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input value={form.fullName} onChange={e => sel('fullName', e.target.value)} placeholder="Your full name" className={inputCls('fullName')} />
                    {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone *</label>
                    <input value={form.phone} onChange={e => sel('phone', e.target.value)} placeholder="+92 300 1234567" className={inputCls('phone')} />
                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Street Address *</label>
                    <input value={form.address} onChange={e => sel('address', e.target.value)} placeholder="House no, street, area" className={inputCls('address')} />
                    {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">City *</label>
                    <input value={form.city} onChange={e => sel('city', e.target.value)} placeholder="e.g. Karachi" className={inputCls('city')} />
                    {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                    <input value={form.notes} onChange={e => sel('notes', e.target.value)} placeholder="Special instructions..." className={inputCls('notes')} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" /> Payment Method
                </h2>

                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {[
                    { id: 'cod',  icon: '💵', label: 'Cash on Delivery',    desc: 'Pay when order arrives',  badge: 'No extra charges'     },
                    { id: 'card', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa & Mastercard',       badge: 'Instant confirmation' },
                  ].map(pm => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border-2 text-left transition relative ${
                        paymentMethod === pm.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}>
                      {paymentMethod === pm.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className="text-2xl mb-2">{pm.icon}</div>
                      <p className={`font-bold text-sm ${paymentMethod === pm.id ? 'text-purple-700' : 'text-gray-900'}`}>{pm.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                      <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-lg ${
                        paymentMethod === pm.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                      }`}>{pm.badge}</span>
                    </button>
                  ))}
                </div>

                {/* COD info */}
                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 font-bold text-sm mb-2">💵 Cash on Delivery</p>
                    <ul className="text-amber-700 text-xs space-y-1">
                      <li>• Keep exact change ready at time of delivery</li>
                      <li>• Our delivery partner collects payment</li>
                      <li>• Estimated delivery: 3-5 business days</li>
                    </ul>
                  </div>
                )}

                {/* Real Stripe CardElement */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700 font-semibold">
                        Secured by Stripe. Your card details are never stored on our servers.
                      </p>
                    </div>

                    {/* Stripe CardElement — handles all card input securely */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '15px',
                              color: '#111827',
                              fontFamily: 'inherit',
                              '::placeholder': { color: '#9ca3af' },
                            },
                            invalid: { color: '#ef4444' },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-400">
                      💡 Test card: <span className="font-mono font-bold">4242 4242 4242 4242</span> · Expiry: <span className="font-mono font-bold">12/26</span> · CVV: <span className="font-mono font-bold">123</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right — Order Summary ── */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" /> Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${GRADIENTS[item.category] || GRADIENTS.Other} flex items-center justify-center text-xl flex-shrink-0 overflow-hidden`}>
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }} />
                        ) : item.emoji || '🎨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs">×{item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-xs flex-shrink-0">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-3 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? '🎁 FREE' : `PKR ${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1.5 rounded-lg">
                      Add PKR {(5000 - subtotal).toLocaleString()} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-black pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-600 text-lg">PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || (paymentMethod === 'card' && !stripe)}
                  className="w-full mt-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black hover:opacity-90 transition flex items-center justify-center gap-2 shadow-xl shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : paymentMethod === 'card' ? (
                    <><Lock className="w-5 h-5" /> Pay PKR {total.toLocaleString()}</>
                  ) : (
                    <><Package className="w-5 h-5" /> Place Order</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-400">Secure & encrypted checkout</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Outer wrapper — provides Stripe context + handles success state ──
export default function StoreCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const cart     = location.state?.cart || [];

  const [success,       setSuccess]       = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const handleSuccess = (order, method) => {
    setPaymentMethod(method);
    setSuccess(order);
  };

  // ── Empty Cart ──
  if (cart.length === 0 && !success) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Your cart is empty</h3>
          <button onClick={() => navigate('/buyer/store')}
            className="mt-3 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition">
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );

  // ── Success Screen ──
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {paymentMethod === 'card' ? '💳 Payment Confirmed!' : '✅ Order Placed!'}
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            Order <span className="font-bold text-gray-700">#{success.orderNumber}</span>
          </p>
          <p className="text-purple-600 font-black text-xl mb-5">
            PKR {success.total?.toLocaleString()}
          </p>

          {paymentMethod === 'cod' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left mb-5">
              <p className="text-amber-800 font-black text-sm mb-1">💵 Cash on Delivery</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Keep <strong>PKR {success.total?.toLocaleString()}</strong> ready when your order arrives.
                Estimated delivery: 3-5 business days.
              </p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-left mb-5">
              <p className="text-green-800 font-black text-sm mb-1">💳 Card Payment Successful</p>
              <p className="text-green-700 text-xs leading-relaxed">
                PKR {success.total?.toLocaleString()} charged to card ending in{' '}
                <strong>****{success.cardLast4}</strong>. Your order is confirmed.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/buyer/store-orders')}
              className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200 text-sm">
              View Orders
            </button>
            <button onClick={() => navigate('/buyer/store')}
              className="px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-purple-300 hover:text-purple-600 transition text-sm">
              Keep Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main Checkout wrapped in Stripe Elements ──
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cart={cart} onSuccess={handleSuccess} />
    </Elements>
  );
}