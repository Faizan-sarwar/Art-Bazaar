import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Search, ShoppingCart, Heart, X } from 'lucide-react';

const tiers = { Platinum: 'bg-slate-100 text-slate-700', Gold: 'bg-yellow-100 text-yellow-700', Silver: 'bg-gray-100 text-gray-600', Bronze: 'bg-orange-100 text-orange-700' };

const mockBuyers = [
  { id: 1, name: 'Bilal Ahmed', email: 'bilal@email.com', orders: 34, spent: 'Rs 68K', tier: 'Platinum', status: 'Active', joined: '2023-05-10', favorites: 12 },
  { id: 2, name: 'Omar Sheikh', email: 'omar@email.com', orders: 22, spent: 'Rs 44K', tier: 'Gold', status: 'Active', joined: '2023-08-15', favorites: 8 },
  { id: 3, name: 'Hina Mirza', email: 'hina@email.com', orders: 15, spent: 'Rs 30K', tier: 'Gold', status: 'Active', joined: '2023-11-20', favorites: 5 },
  { id: 4, name: 'Tariq Mehmood', email: 'tariq@email.com', orders: 8, spent: 'Rs 16K', tier: 'Silver', status: 'Active', joined: '2024-01-05', favorites: 3 },
  { id: 5, name: 'Saba Raza', email: 'saba@email.com', orders: 4, spent: 'Rs 8K', tier: 'Bronze', status: 'Active', joined: '2024-02-20', favorites: 7 },
  { id: 6, name: 'Kamran Akhtar', email: 'kamran@email.com', orders: 1, spent: 'Rs 2K', tier: 'Bronze', status: 'Suspended', joined: '2024-03-10', favorites: 1 },
];

export default function AdminBuyers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = mockBuyers.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = filterTier === 'All' || b.tier === filterTier;
    return matchSearch && matchTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Manage Buyers" subtitle="All buyer accounts" />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Buyers', value: mockBuyers.length },
              { label: 'Platinum', value: mockBuyers.filter(b => b.tier === 'Platinum').length },
              { label: 'Gold', value: mockBuyers.filter(b => b.tier === 'Gold').length },
              { label: 'Active', value: mockBuyers.filter(b => b.status === 'Active').length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" placeholder="Search buyers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white shadow-sm">
              {['All', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Buyer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(buyer => (
              <div key={buyer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {buyer.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{buyer.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{buyer.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${tiers[buyer.tier]}`}>
                    {buyer.tier}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[['Orders', buyer.orders, ShoppingCart], ['Spent', buyer.spent, null], ['Favorites', buyer.favorites, Heart]].map(([l, v, Icon]) => (
                    <div key={l} className="text-center bg-gray-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-gray-900">{v}</p>
                      <p className="text-xs text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSelected(buyer)} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition">
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Buyer Details</h3>
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selected.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selected.name}</p>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tiers[selected.tier]}`}>{selected.tier}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selected.status}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Orders', selected.orders], ['Total Spent', selected.spent], ['Favorites', selected.favorites]].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="font-bold text-gray-900 text-sm">{v}</p>
                      <p className="text-xs text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-4">Joined: {selected.joined}</p>
                <button onClick={() => setSelected(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">Close</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}