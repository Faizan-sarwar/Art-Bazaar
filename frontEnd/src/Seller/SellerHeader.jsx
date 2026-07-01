import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Settings, Search, Plus } from 'lucide-react';
import { useUser, getImageUrl } from '../hooks/useUser';
import { notificationAPI } from '../services/api';

const SellerHeader = ({
  onMenuClick,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  action,
}) => {
  const user          = useUser();
  const avatarUrl     = getImageUrl(user.avatar);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchCount = async () => {
      try {
        const data = await notificationAPI.getUnreadCount();
        setUnread(data.count || 0);
      } catch (err) {}
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3.5 gap-4">

        {/* Left */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Search */}
        {searchPlaceholder && (
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={onSearchChange}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {action && (
            <Link to={action.to}>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                <Plus className="w-4 h-4" /> {action.label}
              </button>
            </Link>
          )}

          <Link to="/seller/notifications">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </Link>

          <Link to="/seller/profile">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
              <Settings className="w-5 h-5" />
            </button>
          </Link>

          <Link to="/seller/profile">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100 ml-1 flex-shrink-0 cursor-pointer hover:border-indigo-400 transition">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-white text-sm font-bold ${avatarUrl ? 'hidden' : 'flex'}`}>
                {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;