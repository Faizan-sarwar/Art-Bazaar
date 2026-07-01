import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader  from './AdminHeader';
import {
  Plus, Trash2, Edit2, Loader, AlertCircle,
  X, Calendar, Check, Eye, EyeOff
} from 'lucide-react';
import { eventAPI }  from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const TYPE_OPTIONS = ['event','workshop','competition','news'];

const TYPE_CONFIG = {
  event:       { color: 'bg-purple-100 text-purple-700', label: 'Event'       },
  competition: { color: 'bg-amber-100 text-amber-700',   label: 'Competition' },
  workshop:    { color: 'bg-blue-100 text-blue-700',     label: 'Workshop'    },
  news:        { color: 'bg-green-100 text-green-700',   label: 'News'        },
};

const EMPTY_FORM = {
  title: '', description: '', type: 'event', date: '',
  location: '', price: '', prize: '', organizer: 'ArtBazaar',
  capacity: '', readTime: '', featured: false, active: true,
};

export default function AdminEvents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [imageFile,   setImageFile]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [deletingId,  setDeletingId]  = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventAPI.getAllAdmin();
      setEvents(data.events || []);
    } catch (err) {
      setError('Failed to load events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setSaveError(''); setShowModal(true); };
  const openEdit = (e) => {
    setEditing(e._id);
    setForm({
      title: e.title, description: e.description,
      type: e.type, date: e.date,
      location: e.location || '', price: e.price != null ? e.price.toString() : '',
      prize: e.prize ? e.prize.toString() : '',
      organizer: e.organizer || 'ArtBazaar',
      capacity: e.capacity ? e.capacity.toString() : '',
      readTime: e.readTime || '',
      featured: e.featured, active: e.active,
    });
    setImageFile(null);
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.type || !form.date) {
      setSaveError('Title, description, type and date are required');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        const data = await eventAPI.update(editing, fd);
        setEvents(prev => prev.map(e => e._id === editing ? data.event : e));
      } else {
        const data = await eventAPI.create(fd);
        setEvents(prev => [data.event, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setSaveError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event/news?')) return;
    setDeletingId(id);
    try {
      await eventAPI.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Events & News Manager"
          subtitle="Upload events, workshops, competitions and news"
        />
        <main className="p-4 md:p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TYPE_OPTIONS.map(t => {
              const cfg = TYPE_CONFIG[t];
              return (
                <div key={t} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <p className="text-2xl font-black text-gray-900">{events.filter(e => e.type === t).length}</p>
                  <p className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-lg w-fit ${cfg.color}`}>{cfg.label}s</p>
                </div>
              );
            })}
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-md shadow-red-200"
            >
              <Plus className="w-4 h-4" /> Add Event / News
            </button>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No events yet</h3>
              <button onClick={openAdd} className="mt-3 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition">
                Add First Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => {
                const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.event;
                return (
                  <div key={event._id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition ${!event.active ? 'opacity-60' : 'border-gray-100'}`}>
                    {/* Image/Icon */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex-shrink-0 flex items-center justify-center text-2xl">
                      {event.image ? (
                        <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        event.type === 'event' ? '🎨' : event.type === 'workshop' ? '✏️' : event.type === 'competition' ? '🏆' : '📰'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {event.featured && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">
                            ⭐ Featured
                          </span>
                        )}
                        {!event.active && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm truncate">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>📅 {event.date}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.price != null && <span>🎟️ {event.price === 0 ? 'Free' : `PKR ${event.price}`}</span>}
                        <span>Added {formatDate(event.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(event)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(event._id)} disabled={deletingId === event._id}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition disabled:opacity-50">
                        {deletingId === event._id
                          ? <Loader className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-900 text-lg">{editing ? 'Edit Event' : 'Add New Event / News'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Karachi Art Festival 2025"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe the event..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none capitalize">
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Date *</label>
                  <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    placeholder="Jan 20–25, 2025"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Karachi Expo Center"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Organizer</label>
                  <input value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                </div>
                {form.type !== 'news' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                      {form.type === 'competition' ? 'Prize (PKR)' : 'Price (PKR, 0=Free)'}
                    </label>
                    <input type="number" value={form.type === 'competition' ? form.prize : form.price}
                      onChange={e => setForm(f => ({ ...f, [form.type === 'competition' ? 'prize' : 'price']: e.target.value }))}
                      placeholder="500"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                  </div>
                )}
                {form.type === 'news' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Read Time</label>
                    <input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                      placeholder="3 min"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                  </div>
                )}
                {(form.type === 'event' || form.type === 'workshop') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Capacity</label>
                    <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      placeholder="50"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-red-400 outline-none" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-red-100 file:text-red-700 file:font-bold file:text-xs" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-sm font-semibold text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-sm font-semibold text-gray-700">Active (visible to buyers)</span>
                </label>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Publish'}</>}
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