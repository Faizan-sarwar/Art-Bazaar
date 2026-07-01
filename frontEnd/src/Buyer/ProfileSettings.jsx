import React, { useState, useEffect } from 'react';
import {
  Camera, Save, Shield, Bell, Settings, Eye, EyeOff,
  Trash2, Edit2, ShoppingBag, MessageCircle, Heart,
  Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';
import { useUser, getImageUrl } from '../hooks/useUser';

const BASE_URL  = 'http://localhost:5000';
const getToken  = () => localStorage.getItem('token');

const ProfileSettings = () => {
  const user = useUser();

  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [activeTab,        setActiveTab]        = useState('profile');
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [message,          setMessage]          = useState({ type: '', text: '' });
  const [avatarFile,       setAvatarFile]       = useState(null);
  const [avatarPreview,    setAvatarPreview]    = useState(null);

  // Password state
  const [showCurrent,      setShowCurrent]      = useState(false);
  const [showNew,          setShowNew]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [passwords,        setPasswords]        = useState({ current: '', newPass: '', confirm: '' });

  // Delete account state
  const [showDeleteConfirm,setShowDeleteConfirm]= useState(false);
  const [deletePassword,   setDeletePassword]   = useState('');
  const [deleteError,      setDeleteError]      = useState('');
  const [deletingAccount,  setDeletingAccount]  = useState(false);
  const [showDeletePass,   setShowDeletePass]   = useState(false);

  // Notification state
  const [notifs, setNotifs] = useState({
    orderUpdates:  true,
    newMessages:   true,
    priceDrops:    true,
    newArtworks:   false,
    liveSessions:  true,
    eventsNews:    false,
  });

  const [profile, setProfile] = useState({
    fullName: '',
    email:    '',
    phone:    '',
    city:     '',
    address:  '',
    bio:      '',
    avatar:   '',
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    favorites:   0,
    memberSince: '',
    totalSpent:  0,
  });

  // ── Load profile ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (data.success && data.user) {
          const u = data.user;
          setProfile({
            fullName: u.fullName || '',
            email:    u.email    || '',
            phone:    u.phone    || '',
            city:     u.city     || '',
            address:  u.address  || '',
            bio:      u.bio      || '',
            avatar:   u.avatar   || '',
          });
          if (u.notifications) {
            setNotifs({
              orderUpdates: u.notifications.orderUpdates  ?? true,
              newMessages:  u.notifications.newMessages   ?? true,
              priceDrops:   u.notifications.priceDrops    ?? true,
              newArtworks:  u.notifications.newArtworks   ?? false,
              liveSessions: u.notifications.liveSessions  ?? true,
              eventsNews:   u.notifications.eventsNews    ?? false,
            });
          }
          if (u.avatar) setAvatarPreview(getImageUrl(u.avatar));
          setStats(prev => ({
            ...prev,
            memberSince: u.createdAt
              ? new Date(u.createdAt).getFullYear().toString()
              : '2024',
          }));
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch (err) {
        console.error('Load profile error:', err);
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
      formData.append('phone',    profile.phone);
      formData.append('city',     profile.city);
      formData.append('address',  profile.address);
      formData.append('bio',      profile.bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res  = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userUpdated'));
        if (data.user.avatar) setAvatarPreview(getImageUrl(data.user.avatar));
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

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('fullName',      profile.fullName);
      formData.append('notifications', JSON.stringify(notifs));

      const res  = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userUpdated'));
        setMessage({ type: 'success', text: 'Notification preferences saved!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save' });
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
      const res  = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword:     passwords.newPass,
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

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }
    setDeletingAccount(true);
    setDeleteError('');
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/delete-account`, {
        method:  'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (data.success) {
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

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition";

  const tabs = [
    { id: 'profile',       label: 'Profile',       icon: Edit2    },
    { id: 'security',      label: 'Security',      icon: Shield   },
    { id: 'notifications', label: 'Notifications', icon: Bell     },
    { id: 'preferences',   label: 'Preferences',   icon: Settings },
  ];

  const avatarUrl = getImageUrl(profile.avatar);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading profile...</p>
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
          title="Account Settings"
          subtitle="Manage your profile"
        />

        <main className="p-4 md:p-6 space-y-5 w-full max-w-7xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-3xl font-black">
                      {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer">
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
                <p className="text-white/70 text-sm mb-3">{profile.email}</p>
                {avatarFile && (
                  <p className="text-white/60 text-xs mb-2">
                    📷 New photo selected — save profile to upload
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Orders',      value: stats.totalOrders },
                    { label: 'Favorites',   value: stats.favorites   },
                    { label: 'Member Since',value: stats.memberSince },
                    { label: 'Total Spent', value: stats.totalSpent > 0 ? `PKR ${(stats.totalSpent / 1000).toFixed(0)}K` : 'PKR 0' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/15 rounded-xl py-2 px-3 text-center">
                      <p className="font-black text-lg leading-none">{s.value}</p>
                      <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success'
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
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 bg-purple-50/50'
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
                      <input
                        value={profile.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        placeholder="Your full name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Email Address
                      </label>
                      <input
                        value={profile.email}
                        readOnly
                        className={inputCls + ' bg-gray-50 text-gray-400 cursor-not-allowed'}
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Phone Number
                      </label>
                      <input
                        value={profile.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="+92 300 1234567"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        City
                      </label>
                      <input
                        value={profile.city}
                        onChange={e => handleChange('city', e.target.value)}
                        placeholder="e.g. Islamabad"
                        className={inputCls}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Address
                      </label>
                      <input
                        value={profile.address}
                        onChange={e => handleChange('address', e.target.value)}
                        placeholder="Street address, area"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> Save Changes</>
                    }
                  </button>
                </div>
              )}

              {/* ── Security Tab ── */}
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
                          <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                          <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                            className={`${inputCls} pr-10 ${
                              passwords.confirm && passwords.newPass !== passwords.confirm
                                ? 'border-red-300'
                                : passwords.confirm && passwords.newPass === passwords.confirm
                                ? 'border-green-300'
                                : ''
                            }`}
                          />
                          <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 disabled:opacity-50"
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
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => { setShowDeleteConfirm(true); setDeletePassword(''); setDeleteError(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete My Account
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">

                        {/* Warning */}
                        <div className="flex items-start gap-3 p-3 bg-red-100 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-800">This action is permanent</p>
                            <ul className="text-xs text-red-700 mt-1 space-y-0.5 list-disc list-inside">
                              <li>All your order history will be removed</li>
                              <li>Your wishlist and favorites will be deleted</li>
                              <li>Your profile and data will be wiped</li>
                              <li>You cannot recover this account</li>
                            </ul>
                          </div>
                        </div>

                        {/* Password */}
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
                              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none transition pr-10 ${
                                deleteError ? 'border-red-400' : 'border-red-200 focus:border-red-400'
                              }`}
                              onKeyDown={e => { if (e.key === 'Enter') handleDeleteAccount(); }}
                              autoFocus
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
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <p className="text-xs font-medium">{deleteError}</p>
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount || !deletePassword}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                          >
                            {deletingAccount
                              ? <><Loader className="w-4 h-4 animate-spin" /> Deleting...</>
                              : <><Trash2 className="w-4 h-4" /> Yes, Delete My Account</>
                            }
                          </button>
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); setShowDeletePass(false); }}
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
                  <p className="text-sm text-gray-500 mb-4">
                    Choose which notifications you want to receive.
                  </p>
                  {[
                    { key: 'orderUpdates', title: 'Order Updates',  desc: 'When your order status changes'              },
                    { key: 'newMessages',  title: 'New Messages',   desc: 'When artists send you messages'              },
                    { key: 'priceDrops',   title: 'Price Drops',    desc: 'When favourited artworks go on sale'         },
                    { key: 'newArtworks',  title: 'New Artworks',   desc: 'When followed artists upload new work'       },
                    { key: 'liveSessions', title: 'Live Sessions',  desc: 'When artists go live'                        },
                    { key: 'eventsNews',   title: 'Events & News',  desc: 'Art events and competitions'                 },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-purple-50 transition">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={notifs[item.key]}
                          onChange={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 mt-4 disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> Save Preferences</>
                    }
                  </button>
                </div>
              )}

              {/* ── Preferences Tab ── */}
              {activeTab === 'preferences' && (
                <div className="space-y-4 max-w-md">
                  <p className="text-sm text-gray-500 mb-2">
                    Customize your ArtBazaar experience.
                  </p>
                  {[
                    { label: 'Language', opts: ['English', 'Urdu'] },
                    { label: 'Currency', opts: ['PKR - Pakistani Rupee', 'USD - US Dollar'] },
                    { label: 'Time Zone', opts: ['Pakistan Standard Time (PST)'] },
                  ].map((s, i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        {s.label}
                      </label>
                      <select className={inputCls + ' cursor-pointer'}>
                        {s.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <button
                    onClick={() => setMessage({ type: 'success', text: 'Preferences saved!' })}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                  >
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {[
                { icon: ShoppingBag,   action: 'Order placed',    detail: 'Urban Dreams artwork',  time: '2 hrs ago'  },
                { icon: Edit2,         action: 'Profile updated', detail: 'Changed address',        time: '1 day ago'  },
                { icon: MessageCircle, action: 'Message sent',    detail: 'To Ayesha Khan',         time: '2 days ago' },
                { icon: Heart,         action: 'Added favorites', detail: '3 artworks saved',       time: '3 days ago' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{a.action}</p>
                    <p className="text-xs text-gray-500 truncate">{a.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;