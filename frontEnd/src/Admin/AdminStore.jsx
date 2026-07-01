import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Plus, Trash2, Edit2, Loader, AlertCircle,
  X, Package, Check
} from 'lucide-react';
import { storeAPI }  from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const CATEGORIES  = ['Paints','Brushes','Canvas','Sketchbooks','Tools','Digital','Other'];
const EMOJI_LIST  = ['🎨','🖌️','✏️','🖼️','📓','🔧','💻','🎭','✨','🌈'];
const GRADIENTS   = [
  'from-purple-100 to-pink-100',
  'from-amber-100 to-orange-100',
  'from-blue-100 to-indigo-100',
  'from-green-100 to-teal-100',
  'from-rose-100 to-pink-100',
  'from-slate-100 to-gray-100',
];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Paints', emoji: '🎨', gradient: 'from-purple-100 to-pink-100',
  badge: '', inStock: true, stock: '10', featured: false,
};

export default function AdminStore() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [imageFile,   setImageFile]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [deletingId,  setDeletingId]  = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await storeAPI.getProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setSaveError(''); setShowModal(true); };
  const openEdit = (p)  => {
    setEditing(p._id);
    setForm({
      name: p.name, description: p.description,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      category: p.category, emoji: p.emoji || '🎨',
      gradient: p.gradient || GRADIENTS[0],
      badge: p.badge || '', inStock: p.inStock,
      stock: p.stock.toString(), featured: p.featured,
    });
    setImageFile(null);
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      setSaveError('Name, description, price and category are required');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        const data = await storeAPI.updateProduct(editing, fd);
        setProducts(prev => prev.map(p => p._id === editing ? data.product : p));
      } else {
        const data = await storeAPI.createProduct(fd);
        setProducts(prev => [data.product, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setSaveError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      await storeAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Art Store Manager"
          subtitle="Manage products — buyers see these in the store"
        />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Products', value: products.length                              },
              { label: 'In Stock',       value: products.filter(p => p.inStock).length       },
              { label: 'Out of Stock',   value: products.filter(p => !p.inStock).length      },
              { label: 'Featured',       value: products.filter(p => p.featured).length      },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-md shadow-red-200"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No products yet</h3>
              <p className="text-gray-500 text-sm mb-4">Add your first product to the store</p>
              <button onClick={openAdd} className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition">
                Add First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className={`h-32 bg-gradient-to-br ${p.gradient || GRADIENTS[0]} flex items-center justify-center text-5xl relative`}>
                    {p.image ? (
                      <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : p.emoji || '🎨'}
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                        {p.badge}
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:bg-blue-50">
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:bg-red-50 disabled:opacity-50">
                        {deletingId === p._id
                          ? <Loader className="w-3.5 h-3.5 text-red-500 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        }
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-lg">{p.category}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {p.inStock ? `${p.stock} left` : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm truncate mt-1">{p.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-1 mb-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-600 text-sm">PKR {p.price.toLocaleString()}</span>
                      {p.originalPrice && (
                        <span className="text-gray-400 line-through text-xs">PKR {p.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-900 text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Professional Acrylic Set"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Product description..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Price (PKR) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="3500"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Original Price (optional)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="4500"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Badge (optional)</label>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="Bestseller, New, Sale..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_LIST.map(e => (
                      <button key={e} type="button" onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition border-2 ${form.emoji === e ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Background</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gradient: g }))}
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${g} transition border-2 ${form.gradient === g ? 'border-red-500' : 'border-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Product Image (optional)</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-red-100 file:text-red-700 file:font-bold file:text-xs" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))}
                      className="w-4 h-4 accent-red-500" />
                    <span className="text-sm font-semibold text-gray-700">In Stock</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-red-500" />
                    <span className="text-sm font-semibold text-gray-700">Featured</span>
                  </label>
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-600 text-sm">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Product'}</>}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}