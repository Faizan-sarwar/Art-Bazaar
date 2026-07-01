import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Check, Loader, AlertCircle,
  Clock, DollarSign, Ruler, Plus,
  CheckCircle, XCircle, Package, Palette
} from 'lucide-react';
import BuyerSidebar        from './BuyerSidebar';
import BuyerHeader         from './BuyerHeader';
import { customRequestAPI } from '../services/api';
import { getImageUrl }      from '../hooks/useUser';

const OPTIONS = {
  categories: ['Landscape','Abstract','Portrait','Traditional','Modern','Calligraphy','Still Life'],
  styles:     ['Realistic','Impressionistic','Abstract','Minimalist','Expressionist','Surrealist'],
  mediums:    ['Oil on Canvas','Acrylic','Watercolor','Mixed Media','Digital Art','Charcoal','Ink'],
  sizes:      ['8x10 inches','12x16 inches','16x20 inches','24x36 inches','30x40 inches','Custom'],
  colors:     [['Warm tones','🔴'],['Cool tones','🔵'],['Earth tones','🟤'],['Pastels','🌸'],['Monochrome','⚫'],['Vibrant','🌈']],
  budgets:    ['PKR 10,000–20,000','PKR 20,000–40,000','PKR 40,000–70,000','PKR 70,000+'],
  deadlines:  ['1 week','2 weeks','1 month','2 months','Flexible'],
};

const STEPS = [
  { n: 1, label: 'Choose Artist'  },
  { n: 2, label: 'Art Details'    },
  { n: 3, label: 'Specifications' },
  { n: 4, label: 'Review & Send'  },
];

const GRADIENTS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-rose-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-amber-500 to-yellow-500',
  'from-cyan-500 to-blue-500',
];

const STATUS_CONFIG = {
  pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: Clock,       label: 'Pending'  },
  accepted: { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle, label: 'Accepted' },
  declined: { bg: 'bg-red-100',    text: 'text-red-600',    icon: XCircle,     label: 'Declined' },
};

export default function CustomRequestForm() {
  const navigate = useNavigate();

  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [activeTab,      setActiveTab]      = useState('new');   // 'new' | 'my'
  const [step,           setStep]           = useState(1);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [submitted,      setSubmitted]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState('');

  const [artists,        setArtists]        = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [artistsError,   setArtistsError]   = useState('');

  const [myRequests,     setMyRequests]     = useState([]);
  const [loadingMy,      setLoadingMy]      = useState(false);

  const [form, setForm] = useState({
    title: '', category: '', style: '', medium: '',
    size: '', customW: '', customH: '',
    colors: [], budget: '', deadline: '', description: '',
  });

  // Load real artists
  useEffect(() => {
    const fetchArtists = async () => {
      setLoadingArtists(true);
      setArtistsError('');
      try {
        const data = await customRequestAPI.getSellers();
        setArtists(data.sellers || []);
      } catch (err) {
        setArtistsError('Failed to load artists: ' + err.message);
      } finally {
        setLoadingArtists(false);
      }
    };
    fetchArtists();
  }, []);

  // Load my requests when tab switches
  useEffect(() => {
    if (activeTab !== 'my') return;
    const fetchMy = async () => {
      setLoadingMy(true);
      try {
        const data = await customRequestAPI.getBuyerRequests();
        setMyRequests(data.requests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMy(false);
      }
    };
    fetchMy();
  }, [activeTab]);

  const sel    = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggle = (key, val) => setForm(f => ({
    ...f,
    [key]: f[key].includes(val)
      ? f[key].filter(x => x !== val)
      : [...f[key], val],
  }));

  const handleSubmit = async () => {
    if (!selectedArtist || !form.title || !form.category || !form.description) {
      setSubmitError('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await customRequestAPI.create({
        sellerId:    selectedArtist._id,
        title:       form.title,
        category:    form.category,
        style:       form.style,
        medium:      form.medium,
        size:        form.size === 'Custom'
          ? `${form.customW}×${form.customH} inches`
          : form.size,
        budget:      form.budget,
        deadline:    form.deadline,
        description: form.description,
        colors:      form.colors,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError('Failed to send: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const OptionBtn = ({ value, current, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
        current === value
          ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-200'
          : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 bg-white'
      }`}
    >
      {value}
    </button>
  );

  // ── Success Screen ────────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Request Sent! 🎨</h2>
          <p className="text-gray-500 mb-1">
            Your request has been sent to{' '}
            <span className="font-bold text-gray-700">{selectedArtist?.fullName}</span>.
          </p>
          <p className="text-gray-400 text-sm mb-7">
            They'll respond within 24 hours. You'll get a notification.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setSelectedArtist(null);
                setForm({ title:'',category:'',style:'',medium:'',size:'',customW:'',customH:'',colors:[],budget:'',deadline:'',description:'' });
                setActiveTab('my');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
            >
              View My Requests
            </button>
            <Link to="/buyer/browse">
              <button className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-purple-300 hover:text-purple-600 transition">
                Browse Art
              </button>
            </Link>
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
          title="Custom Request"
          subtitle="Commission your perfect artwork"
        />

        <main className="p-4 md:p-6 max-w-2xl mx-auto">

          {/* Tab Toggle */}
          <div className="flex gap-2 mb-5 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'new'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" /> New Request
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'my'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              My Requests
              {myRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                  {myRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* ── MY REQUESTS TAB ── */}
          {activeTab === 'my' && (
            <div className="space-y-4">

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Sent', value: myRequests.length,                                      color: 'text-purple-600', bg: 'bg-purple-50', iconBg: 'bg-purple-500', icon: Package      },
                  { label: 'Accepted',   value: myRequests.filter(r => r.status === 'accepted').length, color: 'text-green-600',  bg: 'bg-green-50',  iconBg: 'bg-green-500',  icon: CheckCircle  },
                  { label: 'Pending',    value: myRequests.filter(r => r.status === 'pending').length,  color: 'text-amber-600',  bg: 'bg-amber-50',  iconBg: 'bg-amber-500',  icon: Clock        },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3`}>
                    <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <s.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {loadingMy ? (
                <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Palette className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">No requests yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Send your first custom artwork request to an artist
                  </p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition"
                  >
                    Make a Request
                  </button>
                </div>
              ) : (
                myRequests.map(req => {
                  const cfg  = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={req._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                      req.status === 'accepted' ? 'border-green-200' :
                      req.status === 'declined' ? 'border-red-200' :
                      'border-amber-100'
                    }`}>
                      {/* Status bar */}
                      <div className={`px-5 py-2.5 border-b flex items-center justify-between ${
                        req.status === 'accepted' ? 'bg-green-50 border-green-100' :
                        req.status === 'declined' ? 'bg-red-50 border-red-100' :
                        'bg-amber-50 border-amber-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            {req.category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span>
                      </div>

                      <div className="p-4">
                        {/* Artist info */}
                        <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${GRADIENTS[0]} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                            {req.sellerName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Sent to: {req.sellerName}</p>
                            <p className="text-xs text-gray-500">{req.title}</p>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            ['Budget',   req.budget   || '—'],
                            ['Deadline', req.deadline || '—'],
                            ['Size',     req.size     || '—'],
                            ['Medium',   req.medium   || '—'],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                              <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                              <p className="font-bold text-gray-900 text-xs">{v}</p>
                            </div>
                          ))}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
                          {req.description.slice(0, 100)}{req.description.length > 100 ? '...' : ''}
                        </p>

                        {/* Status message */}
                        {req.status === 'accepted' && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <p className="text-green-700 text-sm font-semibold">
                              Artist accepted! Check your messages to discuss details.
                            </p>
                          </div>
                        )}
                        {req.status === 'declined' && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-red-600 text-sm font-semibold">
                              Artist declined. Try sending to another artist.
                            </p>
                          </div>
                        )}
                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <p className="text-amber-700 text-sm font-semibold">
                              Waiting for artist response — usually within 24 hours.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {myRequests.length > 0 && (
                <button
                  onClick={() => setActiveTab('new')}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md shadow-purple-200"
                >
                  <Plus className="w-4 h-4" /> Send Another Request
                </button>
              )}
            </div>
          )}

          {/* ── NEW REQUEST TAB ── */}
          {activeTab === 'new' && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center gap-1 mb-6">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s.n}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
                        s.n < step  ? 'bg-green-500 text-white shadow-md shadow-green-200'
                        : s.n === step ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                        {s.n < step ? <Check className="w-4 h-4" /> : s.n}
                      </div>
                      <span className={`text-xs font-bold hidden sm:block ${
                        s.n === step ? 'text-purple-600' : s.n < step ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${s.n < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Step Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">

                {/* Step 1 — Artist */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Choose an Artist</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Select a verified artist to commission</p>
                    </div>

                    {loadingArtists ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                      </div>
                    ) : artistsError ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">{artistsError}</p>
                      </div>
                    ) : artists.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 text-sm">No artists available yet</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {artists.map((artist, idx) => (
                          <button
                            key={artist._id}
                            type="button"
                            onClick={() => setSelectedArtist(artist)}
                            className={`p-4 rounded-2xl border-2 text-left transition relative ${
                              selectedArtist?._id === artist._id
                                ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-100'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {selectedArtist?._id === artist._id && (
                              <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 relative">
                                {artist.avatar ? (
                                  <img
                                    src={getImageUrl(artist.avatar)}
                                    alt={artist.fullName}
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} ${artist.avatar ? 'hidden' : 'flex'} items-center justify-center text-white font-black text-xl absolute inset-0`}>
                                  {artist.fullName?.charAt(0)?.toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm">{artist.fullName}</h3>
                                <p className="text-xs text-gray-500">{artist.specialty || 'Artist'}</p>
                                {artist.city && <p className="text-xs text-gray-400">📍 {artist.city}</p>}
                              </div>
                            </div>
                            {artist.bio && (
                              <p className="text-xs text-gray-500 line-clamp-2">{artist.bio}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2 — Art Details */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Artwork Details</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Tell us what you want</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.title}
                        onChange={e => sel('title', e.target.value)}
                        placeholder="e.g. Sunset over my hometown"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.categories.map(c => (
                          <OptionBtn key={c} value={c} current={form.category} onClick={v => sel('category', v)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Style</label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.styles.map(s => (
                          <OptionBtn key={s} value={s} current={form.style} onClick={v => sel('style', v)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Medium</label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.mediums.map(m => (
                          <OptionBtn key={m} value={m} current={form.medium} onClick={v => sel('medium', v)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 — Specs */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Specifications</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Size, budget and timeline</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        <Ruler className="w-3.5 h-3.5 inline mr-1" /> Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.sizes.map(s => (
                          <OptionBtn key={s} value={s} current={form.size} onClick={v => sel('size', v)} />
                        ))}
                      </div>
                      {form.size === 'Custom' && (
                        <div className="flex gap-3 mt-3 items-center">
                          <input value={form.customW} onChange={e => sel('customW', e.target.value)} placeholder="Width (in)"
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                          <span className="text-gray-400 font-bold">×</span>
                          <input value={form.customH} onChange={e => sel('customH', e.target.value)} placeholder="Height (in)"
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-purple-400 outline-none" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">🎨 Color Palette</label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.colors.map(([c, icon]) => (
                          <button key={c} type="button" onClick={() => toggle('colors', c)}
                            className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                              form.colors.includes(c)
                                ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-200'
                                : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 bg-white'
                            }`}>
                            {icon} {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1" /> Budget
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.budgets.map(b => (
                          <OptionBtn key={b} value={b} current={form.budget} onClick={v => sel('budget', v)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        <Clock className="w-3.5 h-3.5 inline mr-1" /> Deadline
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {OPTIONS.deadlines.map(d => (
                          <OptionBtn key={d} value={d} current={form.deadline} onClick={v => sel('deadline', v)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={e => sel('description', e.target.value)}
                        rows={4}
                        placeholder="Describe your vision in detail — mood, references, special requirements..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none transition"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} chars</p>
                    </div>
                  </div>
                )}

                {/* Step 4 — Review */}
                {step === 4 && selectedArtist && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Review Your Request</h2>
                      <p className="text-gray-500 text-sm mt-0.5">Check everything before sending</p>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 relative">
                        {selectedArtist.avatar ? (
                          <img src={getImageUrl(selectedArtist.avatar)} alt={selectedArtist.fullName}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }} />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[0]} ${selectedArtist.avatar ? 'hidden' : 'flex'} items-center justify-center text-white font-black text-2xl absolute inset-0`}>
                          {selectedArtist.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedArtist.fullName}</p>
                        <p className="text-sm text-gray-500">{selectedArtist.specialty || 'Artist'}</p>
                        {selectedArtist.city && <p className="text-xs text-gray-400">📍 {selectedArtist.city}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ['Title',    form.title    || '—'],
                        ['Category', form.category || '—'],
                        ['Style',    form.style    || '—'],
                        ['Medium',   form.medium   || '—'],
                        ['Size',     form.size === 'Custom' ? `${form.customW}×${form.customH} in` : form.size || '—'],
                        ['Budget',   form.budget   || '—'],
                        ['Deadline', form.deadline || '—'],
                        ['Colors',   form.colors.join(', ') || '—'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{k}</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">{v}</p>
                        </div>
                      ))}
                    </div>

                    {form.description && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{form.description}</p>
                      </div>
                    )}

                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-600 text-sm font-semibold">{submitError}</p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-blue-700 text-xs font-semibold">
                        ℹ️ The artist will review your request and respond via notifications within 24 hours.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    disabled={step === 1 && !selectedArtist}
                    className="px-7 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                    Continue <span className="text-white/70">→</span>
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting}
                    className="px-7 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50">
                    {submitting
                      ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</>
                      : <><Check className="w-4 h-4" /> Send Request</>
                    }
                  </button>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}