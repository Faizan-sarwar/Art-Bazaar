import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings, Search } from 'lucide-react';

const AdminHeader = ({ onMenuClick, title, subtitle, showSearch = false }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          {(title || subtitle) && (
            <div>
              {title && <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          )}
        </div>

        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ml-1">
            {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;