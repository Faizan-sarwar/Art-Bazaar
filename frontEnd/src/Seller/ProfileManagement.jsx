import React, { useState, useEffect } from 'react';
import {
  Camera, Shield, Bell, Settings, Eye, EyeOff,
  Trash2, CheckCircle, Edit2, Award, Star,
  Package, Users, Loader, AlertCircle, Save
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';

const BASE_URL = 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');
const getImgUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BASE_URL}${img}`;
};

const ProfileManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    country: 'Pakistan',
    bio: '',
    specialty: '',
    experience: '',
    instagram: '',
    website: '',
    avatar: '',
    storeName: '',
    storeTagline: '',
    acceptCustomOrders: true,
    deliveryOptions: ['Standard (5-7 days)'],
    notifications: {
      newOrders: true,
      customRequests: true,
      newMessages: true,
      paymentReceived: true,
      newReviews: true,
      platformUpdates: false,
    },
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [stats, setStats] = useState({
    artworks: 0,
    sales: 0,
    rating: '—',
  });

  // ── Load profile on mount ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch fresh profile
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (data.success && data.user) {
          const u = data.user;
          setProfile({
            fullName: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            city: u.city || '',
            country: u.country || 'Pakistan',
            bio: u.bio || '',
            specialty: u.specialty || '',
            experience: u.experience || '',
            instagram: u.instagram || '',
            website: u.website || '',
            avatar: u.avatar || '',
            storeName: u.storeName || '',
            storeTagline: u.storeTagline || '',
            acceptCustomOrders: u.acceptCustomOrders !== false,
            deliveryOptions: u.deliveryOptions || ['Standard (5-7 days)'],
            notifications: u.notifications || {
              newOrders: true, customRequests: true, newMessages: true,
              paymentReceived: true, newReviews: true, platformUpdates: false,
            },
          });
          if (u.avatar) setAvatarPreview(getImgUrl(u.avatar));
          localStorage.setItem('user', JSON.stringify(u));
        }

        // Fetch artwork stats
        const artRes = await fetch(`${BASE_URL}/api/artworks/my`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const artData = await artRes.json();
        if (artData.success) {
          const arts = artData.artworks || [];
          const totalSales = arts.reduce((s, a) => s + (a.sales || 0), 0);
          const rated = arts.filter(a => a.rating > 0);
          const avgRating = rated.length > 0
            ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1)
            : '—';
          setStats({ artworks: arts.length, sales: totalSales, rating: avgRating });
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    if (!profile.fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('phone', profile.phone);
      formData.append('city', profile.city);
      formData.append('country', profile.country);
      formData.append('bio', profile.bio);
      formData.append('specialty', profile.specialty);
      formData.append('experience', profile.experience);
      formData.append('instagram', profile.instagram);
      formData.append('website', profile.website);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userUpdated')); // ← add this
        if (data.user.avatar) setAvatarPreview(getImgUrl(data.user.avatar));
        setAvatarFile(null);
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStore = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('storeName', profile.storeName);
      formData.append('storeTagline', profile.storeTagline);
      formData.append('acceptCustomOrders', profile.acceptCustomOrders);
      formData.append('deliveryOptions', JSON.stringify(profile.deliveryOptions));

      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Store settings saved!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save store settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('notifications', JSON.stringify(profile.notifications));

      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Notification preferences saved!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save preferences' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (passwords.newPass.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };
  //  handleDeleteAccount
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (data.success) {
        // Clear everything and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('viewMode');
        window.location.href = '/signup';
      } else {
        setDeleteError(data.message || 'Incorrect password');
        setDeletingAccount(false);
      }
    } catch (err) {
      setDeleteError('Server error. Please try again.');
      setDeletingAccount(false);
    }
  };

  // -------------------------
  const toggleDelivery = (opt) => {
    setProfile(prev => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(opt)
        ? prev.deliveryOptions.filter(d => d !== opt)
        : [...prev.deliveryOptions, opt],
    }));
  };

  const toggleNotif = (key) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition";

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Edit2 },
    { id: 'store', label: 'Store Info', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => { }} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Profile & Settings"
          subtitle="Manage your artist profile"
        />

        <main className="p-4 md:p-6 space-y-5 w-full max-w-7xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-4xl font-black text-white">
                      {profile.fullName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-black">{profile.fullName || 'Your Name'}</h2>
                <p className="text-white/70 text-sm mb-3">
                  {profile.specialty || 'Artist'} · {profile.email}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Artworks', value: stats.artworks },
                    { label: 'Followers', value: 0 },
                    { label: 'Rating', value: stats.rating },
                    { label: 'Sales', value: stats.sales },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/15 rounded-xl py-2 px-3 text-center">
                      <p className="font-black text-lg leading-none">{s.value}</p>
                      <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {avatarFile && (
              <p className="text-white/70 text-xs mt-3 text-center sm:text-left">
                📷 New photo selected — save profile to upload
              </p>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
              {message.type === 'success'
                ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              }
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition border-b-2 ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input value={profile.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder="Your full name" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                      <input value={profile.email} readOnly className={inputCls + ' bg-gray-50 text-gray-400 cursor-not-allowed'} />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                      <input value={profile.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+92 300 1234567" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">City</label>
                      <input value={profile.city} onChange={e => handleChange('city', e.target.value)} placeholder="e.g. Islamabad" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Art Specialty</label>
                      <input value={profile.specialty} onChange={e => handleChange('specialty', e.target.value)} placeholder="e.g. Landscape & Nature Art" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Experience</label>
                      <input value={profile.experience} onChange={e => handleChange('experience', e.target.value)} placeholder="e.g. 5 years" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Instagram</label>
                      <input value={profile.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="@yourhandle" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Website</label>
                      <input value={profile.website} onChange={e => handleChange('website', e.target.value)} placeholder="www.yourwebsite.com" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio / Artist Statement</label>
                    <textarea
                      value={profile.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Tell buyers about yourself, your art style, and your inspiration..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> Save Profile</>
                    }
                  </button>
                </div>
              )}

              {/* ── Store Tab ── */}
              {activeTab === 'store' && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Store Name</label>
                    <input value={profile.storeName} onChange={e => handleChange('storeName', e.target.value)} placeholder={profile.fullName + ' Art Studio'} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Store Tagline</label>
                    <input value={profile.storeTagline} onChange={e => handleChange('storeTagline', e.target.value)} placeholder="Handcrafted art from the heart of Pakistan" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Options</label>
                    {['Standard (5-7 days)', 'Express (2-3 days)', 'Local Pickup'].map(opt => (
                      <label key={opt} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2 cursor-pointer hover:bg-indigo-50 transition border border-gray-100">
                        <input
                          type="checkbox"
                          checked={profile.deliveryOptions.includes(opt)}
                          onChange={() => toggleDelivery(opt)}
                          className="accent-indigo-600 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Accept Custom Orders</p>
                      <p className="text-xs text-gray-500 mt-0.5">Show custom request button on your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.acceptCustomOrders}
                        onChange={e => handleChange('acceptCustomOrders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                  <button
                    onClick={handleSaveStore}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> Save Store Settings</>
                    }
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 max-w-md">

                  {/* Change Password */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Update your password to keep your account secure.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrent ? 'text' : 'password'}
                            value={passwords.current}
                            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                            placeholder="Enter current password"
                            className={inputCls + ' pr-10'}
                          />
                          <button
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNew ? 'text' : 'password'}
                            value={passwords.newPass}
                            onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                            placeholder="Min. 8 characters"
                            className={inputCls + ' pr-10'}
                          />
                          <button
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={passwords.confirm}
                            onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                            placeholder="Re-enter new password"
                            className={`${inputCls} pr-10 ${passwords.confirm && passwords.newPass !== passwords.confirm
                                ? 'border-red-300'
                                : passwords.confirm && passwords.newPass === passwords.confirm
                                  ? 'border-green-300'
                                  : ''
                              }`}
                          />
                          <button
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwords.confirm && passwords.newPass !== passwords.confirm && (
                          <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                        )}
                        {passwords.confirm && passwords.newPass === passwords.confirm && (
                          <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                      >
                        {saving
                          ? <><Loader className="w-4 h-4 animate-spin" /> Updating...</>
                          : <><Shield className="w-4 h-4" /> Update Password</>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-bold text-red-600 mb-1">Delete Account</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Permanently delete your account, all artworks and data. This cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setDeletePassword('');
                          setDeleteError('');
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete My Account
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">

                        {/* Warning Banner */}
                        <div className="flex items-start gap-3 p-3 bg-red-100 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-800">This action is permanent</p>
                            <ul className="text-xs text-red-700 mt-1 space-y-0.5 list-disc list-inside">
                              <li>All your artworks will be deleted</li>
                              <li>All your order history will be removed</li>
                              <li>Your profile and data will be wiped</li>
                              <li>You cannot recover this account</li>
                            </ul>
                          </div>
                        </div>

                        {/* Password Confirm Input */}
                        <div>
                          <label className="block text-xs font-bold text-red-700 uppercase tracking-wide mb-1.5">
                            Enter your password to confirm
                          </label>
                          <div className="relative">
                            <input
                              type={showDeletePass ? 'text' : 'password'}
                              value={deletePassword}
                              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                              placeholder="Your current password"
                              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none transition pr-10 ${deleteError ? 'border-red-400 focus:border-red-500' : 'border-red-200 focus:border-red-400'
                                }`}
                            />
                            <button
                              onClick={() => setShowDeletePass(!showDeletePass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {deleteError && (
                            <div className="flex items-center gap-1.5 mt-2 text-red-600">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <p className="text-xs font-medium">{deleteError}</p>
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount || !deletePassword}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingAccount
                              ? <><Loader className="w-4 h-4 animate-spin" /> Deleting...</>
                              : <><Trash2 className="w-4 h-4" /> Yes, Delete My Account</>
                            }
                          </button>
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                            disabled={deletingAccount}
                            className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Notifications Tab ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-2 max-w-lg">
                  <p className="text-sm text-gray-500 mb-4">Choose which notifications you want to receive.</p>
                  {[
                    { key: 'newOrders', title: 'New Orders', desc: 'When a buyer places an order' },
                    { key: 'customRequests', title: 'Custom Requests', desc: 'When a buyer sends a custom request' },
                    { key: 'newMessages', title: 'New Messages', desc: 'When buyers send you messages' },
                    { key: 'paymentReceived', title: 'Payment Received', desc: 'When a payment is confirmed' },
                    { key: 'newReviews', title: 'New Reviews', desc: 'When buyers leave reviews' },
                    { key: 'platformUpdates', title: 'Platform Updates', desc: 'ArtBazaar announcements & news' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 transition">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={profile.notifications[item.key]}
                          onChange={() => toggleNotif(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-4 disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> Save Preferences</>
                    }
                  </button>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileManagement;