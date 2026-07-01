import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const mockPayouts = [
  { id: 'PAY-001', seller: 'Fatima Arts', amount: 'Rs 45,000', sales: 12, status: 'Pending', requested: '2024-12-10', method: 'Bank Transfer', account: '****4521' },
  { id: 'PAY-002', seller: 'Hassan Studio', amount: 'Rs 32,000', sales: 9, status: 'Processing', requested: '2024-12-09', method: 'JazzCash', account: '0300-*****89' },
  { id: 'PAY-003', seller: 'Ali Paintings', amount: 'Rs 28,500', sales: 8, status: 'Completed', requested: '2024-12-07', method: 'EasyPaisa', account: '0321-*****44' },
  { id: 'PAY-004', seller: 'Zara Creations', amount: 'Rs 22,000', sales: 6, status: 'Completed', requested: '2024-12-05', method: 'Bank Transfer', account: '****8822' },
  { id: 'PAY-005', seller: 'Noor Gallery', amount: 'Rs 15,000', sales: 4, status: 'Pending', requested: '2024-12-11', method: 'JazzCash', account: '0311-*****67' },
  { id: 'PAY-006', seller: 'Amna Art House', amount: 'Rs 8,500', sales: 2, status: 'Pending', requested: '2024-12-11', method: 'Bank Transfer', account: '****3391' },
];

const statusStyle = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

export default function AdminPayouts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payouts, setPayouts] = useState(mockPayouts);
  const [filter, setFilter] = useState('All');

  const processPayment = (id) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'Processing' } : p));
  };
  const completePayment = (id) => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
  };

  const filtered = filter === 'All' ? payouts : payouts.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Payouts" subtitle="Seller payout management" />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending', value: payouts.filter(p => p.status === 'Pending').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Processing', value: payouts.filter(p => p.status === 'Processing').length, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
              { label: 'Completed', value: payouts.filter(p => p.status === 'Completed').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Total Amount', value: 'Rs 151K', icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Pending', 'Processing', 'Completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Payout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(payout => (
              <div key={payout.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {payout.seller[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{payout.seller}</p>
                      <p className="font-mono text-xs text-gray-400">{payout.id}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[payout.status]}`}>
                    {payout.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-2xl font-bold text-gray-900">{payout.amount}</p>
                  <p className="text-xs text-gray-500">{payout.sales} sales · {payout.method}</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">Account: {payout.account} · {payout.requested}</p>
                <div className="flex gap-2">
                  {payout.status === 'Pending' && (
                    <button onClick={() => processPayment(payout.id)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition">
                      Process
                    </button>
                  )}
                  {payout.status === 'Processing' && (
                    <button onClick={() => completePayment(payout.id)} className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition">
                      Mark Complete
                    </button>
                  )}
                  {payout.status === 'Completed' && (
                    <div className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold text-center">
                      ✓ Paid
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}