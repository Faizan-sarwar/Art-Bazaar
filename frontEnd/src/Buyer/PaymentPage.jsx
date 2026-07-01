import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Smartphone, Building2, CreditCard, ArrowLeft, Check } from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';

const PaymentPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [method, setMethod]           = useState('jazzcash');
  const [processing, setProcessing]   = useState(false);
  const [paid, setPaid]               = useState(false);
  const navigate = useNavigate();

  const order = { items:[{ title:'Sunset Dreams', price:25000 },{ title:'Ocean Waves', price:32000 }], subtotal:57000, shipping:500, total:57500 };

  const methods = [
    { id:'jazzcash',  name:'JazzCash',         Icon: Smartphone, color:'bg-red-100 text-red-600'    },
    { id:'easypaisa', name:'EasyPaisa',         Icon: Smartphone, color:'bg-green-100 text-green-600'},
    { id:'bank',      name:'Bank Transfer',     Icon: Building2,  color:'bg-blue-100 text-blue-600'  },
    { id:'card',      name:'Credit/Debit Card', Icon: CreditCard, color:'bg-purple-100 text-purple-600'},
  ];

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setPaid(true); setTimeout(() => navigate('/buyer/orders'), 2500); }, 2000);
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  if (paid) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-1">PKR {order.total.toLocaleString()} paid successfully.</p>
          <p className="text-gray-400 text-sm">Redirecting to your orders...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader onMenuClick={() => setSidebarOpen(true)} title="Payment" subtitle="Secure checkout" />

        <main className="p-4 md:p-6">
          <Link to="/buyer/checkout" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-5 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-4">
              {/* Security */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-900 text-sm">Secure Payment</p>
                  <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
                </div>
              </div>

              {/* Method selector */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {methods.map(({ id, name, Icon, color }) => (
                    <button key={id} onClick={() => setMethod(id)}
                      className={`p-4 border-2 rounded-2xl text-left transition ${method === id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {method === id && <CheckCircle className="w-4 h-4 text-purple-600 ml-auto" />}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Payment Details</h3>
                {method === 'jazzcash' && (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">JazzCash Mobile Number</label><input type="tel" placeholder="03XX XXXXXXX" className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">MPIN</label><input type="password" placeholder="5-digit MPIN" maxLength="5" className={inputCls} /></div>
                  </div>
                )}
                {method === 'easypaisa' && (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">EasyPaisa Number</label><input type="tel" placeholder="03XX XXXXXXX" className={inputCls} /></div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">PIN</label><input type="password" placeholder="Enter PIN" className={inputCls} /></div>
                  </div>
                )}
                {method === 'bank' && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-1">
                      <p className="font-bold text-blue-900">Bank Details:</p>
                      {[['Account Title','ArtBazaar Escrow'],['Bank','HBL'],['Account','1234-5678-9012-3456'],['IBAN','PK36HABB0000001234567890']].map(([k,v]) => (
                        <div key={k} className="flex justify-between text-blue-700 text-xs"><span>{k}:</span><span className="font-mono">{v}</span></div>
                      ))}
                    </div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Transaction Reference</label><input placeholder="Enter reference number" className={inputCls} /></div>
                  </div>
                )}
                {method === 'card' && (
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Card Number</label><input placeholder="1234 5678 9012 3456" maxLength="19" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expiry</label><input placeholder="MM/YY" maxLength="5" className={inputCls} /></div>
                      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">CVV</label><input type="password" placeholder="123" maxLength="3" className={inputCls} /></div>
                    </div>
                    <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cardholder Name</label><input placeholder="Name on card" className={inputCls} /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4 text-sm">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600">
                      <span className="truncate flex-1 mr-2">{i.title}</span>
                      <span className="font-semibold flex-shrink-0">PKR {i.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-3 mb-5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-semibold">PKR {order.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-semibold">PKR {order.shipping}</span></div>
                  <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100 text-base">
                    <span>Total</span><span className="text-purple-600">PKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={handlePay} disabled={processing}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70">
                  {processing ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4" />Pay PKR {order.total.toLocaleString()}</>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">Your payment is secure and encrypted</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;