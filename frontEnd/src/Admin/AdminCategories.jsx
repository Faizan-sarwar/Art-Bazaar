import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Landscape', slug: 'landscape', artworks: 342, status: 'Active', color: '#10b981', description: 'Nature and scenery artworks', featured: true },
  { id: 2, name: 'Abstract', slug: 'abstract', artworks: 284, status: 'Active', color: '#8b5cf6', description: 'Non-representational art forms', featured: true },
  { id: 3, name: 'Portrait', slug: 'portrait', artworks: 195, status: 'Active', color: '#f59e0b', description: 'Human and animal portraits', featured: false },
  { id: 4, name: 'Calligraphy', slug: 'calligraphy', artworks: 156, status: 'Active', color: '#3b82f6', description: 'Islamic and Urdu calligraphy', featured: true },
  { id: 5, name: 'Miniature', slug: 'miniature', artworks: 98, status: 'Active', color: '#ec4899', description: 'Traditional miniature paintings', featured: false },
  { id: 6, name: 'Digital Art', slug: 'digital', artworks: 72, status: 'Active', color: '#06b6d4', description: 'Digitally created artworks', featured: false },
  { id: 7, name: 'Sculpture', slug: 'sculpture', artworks: 34, status: 'Inactive', color: '#84cc16', description: '3D artworks and sculptures', featured: false },
];

const defaultForm = { name: '', slug: '', description: '', status: 'Active', color: '#8b5cf6', featured: false };

export default function AdminCategories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => { setForm(defaultForm); setModal('add'); };
  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, status: cat.status, color: cat.color, featured: cat.featured });
    setEditId(cat.id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (modal === 'add') {
      setCategories(prev => [...prev, { ...form, id: Date.now(), artworks: 0 }]);
    } else {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Categories" subtitle="Manage artwork categories" />
        <main className="p-4 md:p-6 space-y-5">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-3 flex-1 mr-4">
              {[
                { label: 'Total', value: categories.length },
                { label: 'Active', value: categories.filter(c => c.status === 'Active').length },
                { label: 'Featured', value: categories.filter(c => c.featured).length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition flex-shrink-0 shadow-sm">
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '22' }}>
                      <Tag size={18} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        {cat.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">Featured</span>}
                      </div>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
                <p className="text-sm font-semibold text-gray-700 mb-3">{cat.artworks} artworks</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Modal */}
          {modal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
                  <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  {[['Name', 'name', 'text', 'Category name'], ['Slug', 'slug', 'text', 'url-slug'], ['Description', 'description', 'text', 'Short description']].map(([label, key, type, ph]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400 focus:border-red-400" />
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none text-gray-700 bg-white">
                        <option>Active</option><option>Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
                      <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                        className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer overflow-hidden" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
                    <span className="text-sm text-gray-700">Featured category</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={handleSave} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                    {modal === 'add' ? 'Add Category' : 'Save Changes'}
                  </button>
                  <button onClick={closeModal} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirm */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Category?</h3>
                <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">Delete</button>
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">Cancel</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}