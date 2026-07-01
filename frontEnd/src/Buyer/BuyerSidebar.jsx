import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, Heart, MessageCircle, User,
  Search, LogOut, Palette, Store, Calendar, X,
  Bell, Video, Repeat
} from 'lucide-react';
import { useUser, getImageUrl } from '../hooks/useUser';
import { messageAPI } from '../services/api';

const BuyerSidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('viewMode');
    navigate('/');
  };

  const handleSwitchMode = () => {
    localStorage.setItem('viewMode', 'seller');
    navigate('/seller/home');
  };

  // Fix for Issue #7: Real-time unread message polling for Buyers
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await messageAPI.getConversations();
        const total = (data.conversations || []).reduce(
          (sum, c) => sum + (c.buyerUnread || 0), 0
        );
        setUnreadCount(total);
      } catch (err) {
        // Silently fail to avoid console spam
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchUnread(); // Fetch immediately on mount
      // Poll every 10 seconds
      const intervalId = setInterval(fetchUnread, 10000);
      // Crucial: Clear interval on unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  const navItems = [
    { icon: Home, label: 'Discover', to: '/buyer/home' },
    { icon: Search, label: 'Browse Art', to: '/buyer/browse' },
    { icon: Store, label: 'Art Supply Store', to: '/buyer/store' },
    { icon: Palette, label: 'Custom Requests', to: '/buyer/custom-request' },
    { icon: Heart, label: 'My Favorites', to: '/buyer/favorites' },
    { icon: ShoppingBag, label: 'My Orders', to: '/buyer/orders' },
    { icon: MessageCircle, label: 'Messages', to: '/buyer/messages', badge: unreadCount },
    { icon: Video, label: 'Live Streams', to: '/buyer/live-sessions' },
    { icon: Calendar, label: 'Events & News', to: '/buyer/events' },
    { icon: Bell, label: 'Notifications', to: '/buyer/notifications' },
    { icon: User, label: 'Profile Settings', to: '/buyer/profile' },
  ];

  const isActive = (to) => location.pathname === to;
  const avatarUrl = getImageUrl(user.avatar);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl flex flex-col
        transform transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <Link to="/buyer/home" className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-xl">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Art<span className="text-purple-600">Bazaar</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center text-white font-bold text-base ${avatarUrl ? 'hidden' : 'flex'}`}>
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate text-sm">
                {user.fullName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map(item => (
              <li key={item.to + item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.to)
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {user.role === 'artist' && (
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Switch Mode
              </p>
              <button
                onClick={handleSwitchMode}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <Repeat className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">Switch to Artist</p>
                  <p className="text-xs text-indigo-500">Manage your portfolio</p>
                </div>
              </button>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default BuyerSidebar;