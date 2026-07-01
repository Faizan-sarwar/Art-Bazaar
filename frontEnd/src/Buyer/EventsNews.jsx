import React, { useState, useEffect } from 'react';
import {
  Calendar, Award, Users, BookOpen,
  MapPin, Clock, ChevronRight, Ticket,
  Loader, AlertCircle, Sparkles, CheckCircle
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader from './BuyerHeader';
import { eventAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const TYPE_CONFIG = {
  event: { icon: Calendar, color: 'bg-purple-100 text-purple-700', label: 'Event' },
  competition: { icon: Award, color: 'bg-amber-100 text-amber-700', label: 'Competition' },
  workshop: { icon: Users, color: 'bg-blue-100 text-blue-700', label: 'Workshop' },
  news: { icon: BookOpen, color: 'bg-green-100 text-green-700', label: 'News' },
};

export default function EventsNews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await eventAPI.getAll();
        setEvents(data.events || []);
      } catch (err) {
        setError('Failed to load events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      // Direct fetch call bypassing custom API wrappers if missing, standard approach:
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Update local state to reflect registration
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, attendees: [...(e.attendees || []), user._id] } : e));
      alert('Successfully registered for event!');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  const filtered = events.filter(e => tab === 'all' || e.type === tab);
  const featured = events.filter(e => e.featured).slice(0, 3);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      day: d.getDate(),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader onMenuClick={() => setSidebarOpen(true)} title="Events & News" subtitle="Discover art exhibitions, workshops, and updates" />

        <main className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8">

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-10 h-10 text-purple-600 animate-spin" /></div>
          ) : (
            <>
              {featured.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" /> Featured Highlight
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {featured.map(f => (
                      <div key={f._id} className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-purple-900/20 group">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                        <div className="relative z-10">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                            {TYPE_CONFIG[f.type]?.label || 'Featured'}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black mb-2">{f.title}</h3>
                          <p className="text-purple-200 text-sm mb-6 line-clamp-2 max-w-md">{f.description}</p>
                          {f.date && (
                            <div className="flex items-center gap-2 text-sm font-semibold mb-6">
                              <Calendar className="w-4 h-4 text-purple-300" /> {formatDate(f.date).full}
                            </div>
                          )}
                          <button
                            onClick={() => f.type !== 'news' && handleRegister(f._id)}
                            disabled={registering === f._id || f.attendees?.includes(user._id)}
                            className={`px-6 py-3 bg-white text-purple-900 rounded-xl font-black text-sm transition shadow-lg disabled:opacity-80 flex items-center gap-2 ${f.attendees?.includes(user._id) ? '' : 'hover:scale-105'}`}
                          >
                            {registering === f._id ? <Loader className="w-4 h-4 animate-spin" /> : f.attendees?.includes(user._id) ? <CheckCircle className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                            {f.type === 'news' ? 'Read Article' : f.attendees?.includes(user._id) ? 'Registered ✓' : 'Register Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm overflow-x-auto hide-scroll w-max">
                {['all', 'event', 'competition', 'workshop', 'news'].map(t => (
                  <button
                    key={t} onClick={() => setTab(t)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${tab === t ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">No items found</h3>
                  <p className="text-gray-500 text-sm">Check back later for new updates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(item => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
                    const Icon = cfg.icon;
                    const dateObj = item.date ? formatDate(item.date) : null;
                    const isRegistered = item.attendees?.includes(user._id);

                    return (
                      <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full overflow-hidden">
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                          {item.image ? (
                            <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Icon className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          <span className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">{item.title}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>

                          <div className="space-y-2 mb-6 mt-auto">
                            {dateObj && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <Calendar className="w-4 h-4 text-purple-500" /> {dateObj.full}
                              </div>
                            )}
                            {item.location && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <MapPin className="w-4 h-4 text-blue-500" /> {item.location}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              {item.price != null ? (
                                <span className="font-black text-purple-700 text-sm">{item.price === 0 ? 'Free Entry' : `PKR ${item.price.toLocaleString()}`}</span>
                              ) : item.prize ? (
                                <span className="font-black text-amber-600 text-sm">🏆 PKR {item.prize.toLocaleString()}</span>
                              ) : item.readTime ? (
                                <span className="text-xs text-gray-400 font-semibold">{item.readTime} read</span>
                              ) : null}
                            </div>

                            <button
                              onClick={() => item.type !== 'news' && handleRegister(item._id)}
                              disabled={registering === item._id || isRegistered}
                              className={`px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-200 ${isRegistered ? 'bg-green-600' : 'hover:bg-purple-700'}`}
                            >
                              {registering === item._id ? <Loader className="w-4 h-4 animate-spin" /> : isRegistered ? <CheckCircle className="w-4 h-4" /> : item.type === 'news' ? <ChevronRight className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                              {item.type === 'news' ? 'Read More' : isRegistered ? 'Registered' : 'Register'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}