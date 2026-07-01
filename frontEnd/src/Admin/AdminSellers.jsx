import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Search, Star, Package, DollarSign, CheckCircle, XCircle, PauseCircle, X } from 'lucide-react';

const mockSellers = [
  { id: 1, name: 'Fatima Arts', email: 'fatima@arts.com', artworks: 45, sales: 142, revenue: 'Rs 284K', rating: 4.9, status: 'Active', joined: '2023-06-15', bio: 'Contemporary Pakistani artist specializing in abstract expressionism.', verified: true },
  { id: 2, name: 'Hassan Studio', email: 'hassan@studio.com', artworks: 38, sales: 118, revenue: 'Rs 236K', rating: 4.8, status: 'Active', joined: '2023-08-20', bio: 'Landscape and portrait painter from Lahore.', verified: true },
  { id: 3, name: 'Zara Creations', email: 'zara@create.com', artworks: 29, sales: 95, revenue: 'Rs 190K', rating: 4.7, status: 'Pending', joined: '2024-01-10', bio: 'Digital artist and traditional miniature painter.', verified: false },
  { id: 4, name: 'Ali Paintings', email: 'ali@paint.com', artworks: 22, sales: 87, revenue: 'Rs 174K', rating: 4.6, status: 'Active', joined: '2023-11-05', bio: 'Calligraphy and Islamic art specialist from Islamabad.', verified: true },
  { id: 5, name: 'Noor Gallery', email: 'noor@gallery.com', artworks: 15, sales: 42, revenue: 'Rs 84K', rating: 4.3, status: 'Suspended', joined: '2024-02-28', bio: 'Modern abstract art and installations.', verified: false },
  { id: 6, name: 'Amna Art House', email: 'amna@art.com', artworks: 8, sales: 12, revenue: 'Rs 24K', rating: 4.1, status: 'Pending', joined: '2024-03-15', bio: 'New artist focusing on watercolors and mixed media.', verified: false },
];

const statusStyle = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Suspended: 'bg-red-100 text-red-700',
};

export default function AdminSellers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [sellers, setSellers] = useState(mockSellers);

  const filtered = sellers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, status) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status, verified: status === 'Active' ? true : s.verified } : s));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Manage Sellers" subtitle="Artist & seller accounts" />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: sellers.length, color: 'bg-blue-50 text-blue-700' },
              { label: 'Active', value: sellers.filter(s => s.status === 'Active').length, color: 'bg-green-50 text-green-700' },
              { label: 'Pending', value: sellers.filter(s => s.status === 'Pending').length, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Suspended', value: sellers.filter(s => s.status === 'Suspended').length, color: 'bg-red-50 text-red-700' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className={`text-xs font-semibold mt-1 ${s.color} inline-block px-2 py-0.5 rounded-full`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" placeholder="Search sellers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white shadow-sm">
              {['All', 'Active', 'Pending', 'Suspended'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Seller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(seller => (
              <div key={seller.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {seller.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 text-sm">{seller.name}</p>
                        {seller.verified && <CheckCircle size={14} className="text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500">{seller.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[seller.status]}`}>
                    {seller.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{seller.bio}</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-gray-900">{seller.artworks}</p>
                    <p className="text-xs text-gray-500">Artworks</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-gray-900">{seller.sales}</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-0.5">
                      <Star size={11} className="text-yellow-500" fill="currentColor" />{seller.rating}
                    </p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(seller)} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition">
                    Details
                  </button>
                  {seller.status === 'Pending' && (
                    <button onClick={() => updateStatus(seller.id, 'Active')} className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition">
                      Approve
                    </button>
                  )}
                  {seller.status === 'Active' && (
                    <button onClick={() => updateStatus(seller.id, 'Suspended')} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition">
                      Suspend
                    </button>
                  )}
                  {seller.status === 'Suspended' && (
                    <button onClick={() => updateStatus(seller.id, 'Active')} className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition">
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Seller Details</h3>
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selected.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900">{selected.name}</p>
                      {selected.verified && <CheckCircle size={15} className="text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[selected.status]}`}>{selected.status}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{selected.bio}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Artworks', selected.artworks], ['Sales', selected.sales], ['Revenue', selected.revenue]].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="font-bold text-gray-900 text-sm">{v}</p>
                      <p className="text-xs text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-4">Joined: {selected.joined}</p>
                <div className="flex gap-2">
                  {selected.status === 'Pending' && (
                    <button onClick={() => updateStatus(selected.id, 'Active')} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition">
                      Approve
                    </button>
                  )}
                  {selected.status !== 'Suspended' && (
                    <button onClick={() => updateStatus(selected.id, 'Suspended')} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                      Suspend
                    </button>
                  )}
                  {selected.status === 'Suspended' && (
                    <button onClick={() => updateStatus(selected.id, 'Active')} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition">
                      Activate
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}