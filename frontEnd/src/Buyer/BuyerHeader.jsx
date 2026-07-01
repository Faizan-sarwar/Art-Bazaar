import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useUser, getImageUrl } from '../hooks/useUser';
import { notificationAPI } from '../services/api';

const BuyerHeader = ({
  onMenuClick,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) => {
  const user      = useUser();
  const navigate  = useNavigate();
  const avatarUrl = getImageUrl(user.avatar);

  const [unread,       setUnread]       = useState(0);
  const [localSearch,  setLocalSearch]  = useState('');
  const [showSearch,   setShowSearch]   = useState(false);

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

  // Handle Enter key on global search → navigate to search page
  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && localSearch.trim()) {
      navigate(`/buyer/search?q=${encodeURIComponent(localSearch.trim())}`);
      setLocalSearch('');
      setShowSearch(false);
    }
  };

  // Handle Enter on page-level search (browse, orders etc)
  const handlePageSearch = (e) => {
    if (onSearchChange) onSearchChange(e);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-3">

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
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Page-level search (Browse, Orders etc) */}
        {searchPlaceholder && !showSearch && (
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={handlePageSearch}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-gray-50 transition"
            />
          </div>
        )}

        {/* Global search overlay */}
        {showSearch && (
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              autoFocus
              type="text"
              placeholder="Search artworks, artists... press Enter"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={handleGlobalSearch}
              className="w-full pl-9 pr-10 py-2 border-2 border-purple-400 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none bg-white transition"
            />
            <button
              onClick={() => { setShowSearch(false); setLocalSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Search icon — for pages without built-in search */}
          {!searchPlaceholder && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Notification bell */}
          <Link to="/buyer/notifications">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
          </Link>

          {/* Avatar */}
          <Link to="/buyer/profile">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-100 ml-1 flex-shrink-0 cursor-pointer hover:border-purple-400 transition">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 items-center justify-center text-white text-sm font-bold ${avatarUrl ? 'hidden' : 'flex'}`}>
                {user.fullName?.charAt(0)?.toUpperCase() || 'B'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default BuyerHeader;