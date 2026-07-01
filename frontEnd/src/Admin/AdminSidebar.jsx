import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, Palette, Tag,
  CreditCard, DollarSign, TrendingUp, BarChart3, Flag,
  Settings, Home, LogOut, ChevronDown,MessageSquare , ChevronRight, X, Shield
} from 'lucide-react';
import {  Calendar } from 'lucide-react';



const navItems = [
  { icon: Home, label: 'Home', path: '/admin' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'All Users', path: '/admin/users' },
  { icon: Palette, label: 'Sellers', path: '/admin/sellers' },
  { icon: ShoppingBag, label: 'Buyers', path: '/admin/buyers' },
  { icon: Tag, label: 'Artworks', path: '/admin/artworks' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
  { icon: DollarSign, label: 'Payouts', path: '/admin/payouts' },
  { icon: TrendingUp, label: 'Revenue', path: '/admin/revenue' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Flag, label: 'Reports', path: '/admin/reports' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
{ icon: ShoppingBag, label: 'Art Store',  path: '/admin/store'  },
{ icon: ShoppingBag, label: 'Store Orders', path: '/admin/store-orders' },
{ icon: Calendar,   label: 'Events & News', path: '/admin/events' },
{ icon: MessageSquare, label: 'Support Chat', path : '/admin/chat' },

];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('viewMode');
  navigate('/');
};

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">ArtBazaar</p>
              <p className="text-slate-400 text-xs">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || 'admin@artbazaar.com'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-sm font-medium
                  ${active
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}