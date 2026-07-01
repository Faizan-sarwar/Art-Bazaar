import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Palette, Menu, X, ShoppingCart, Heart, Bell, User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get logged in user
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!token;

  // Pages where navbar should be transparent on top
  const transparentPages = ['/', '/about', '/artworks', '/artists'];
  const isTransparentPage = transparentPages.includes(location.pathname);
  const isTransparent = isTransparentPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user.role === 'artist') return '/seller/home';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/buyer/home';
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Artworks', to: '/artworks' },
    { label: 'Artists', to: '/artists' },
    { label: 'About', to: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white shadow-md border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Palette className={`w-8 h-8 ${isTransparent ? 'text-white' : 'text-purple-600'}`} />
            <span className={`text-xl md:text-2xl font-bold ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
              ArtBazaar
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive(link.to)
                    ? isTransparent
                      ? 'text-white bg-white/20'
                      : 'text-purple-600 bg-purple-50'
                    : isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {/* Buyer icons */}
                {user.role === 'buyer' && (
                  <>
                    <Link
                      to="/buyer/favorites"
                      className={`p-2 rounded-lg transition ${
                        isTransparent
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/buyer/notifications"
                      className={`p-2 rounded-lg transition ${
                        isTransparent
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                    </Link>
                  </>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium text-sm ${
                      isTransparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user.fullName?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
                      isTransparent
                        ? 'text-white border border-white/40 hover:bg-white/10'
                        : 'text-purple-600 border border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition shadow-sm">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                  isActive(link.to)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <hr className="border-gray-100 my-2" />

            {isLoggedIn ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1">
                  <button className="w-full px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-50 transition">
                    Login
                  </button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <button className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
