import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Palette, Menu, X, Heart, User, LogOut, ChevronDown, Search } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!token;

  const heroPages = ['/', '/artworks', '/artists', '/about'];
  const isHero = heroPages.includes(location.pathname);
  const isTransparent = isHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/artworks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const dashboardLink =
    user.role === 'artist' ? '/seller/home' :
      user.role === 'admin' ? '/admin/dashboard' :
        '/buyer/home';

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Artworks', to: '/artworks' },
    { label: 'Artists', to: '/artists' },
    { label: 'About', to: '/about' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isTransparent ? 'bg-transparent' : 'bg-white shadow-md border-b border-gray-100'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className={`p-1.5 rounded-xl transition-colors ${isTransparent ? 'bg-white/20' : 'bg-purple-50'
            }`}>
            <Palette className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-purple-600'}`} />
          </div>
          <span className={`font-bold text-lg tracking-tight ${isTransparent ? 'text-white' : 'text-gray-900'
            }`}>
            Art<span className={isTransparent ? 'text-purple-300' : 'text-purple-600'}>Bazaar</span>
          </span>
        </Link>

        {/* Desktop Global Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isTransparent ? 'text-white/70' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search artworks, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${isTransparent
                  ? 'bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100'
                }`}
            />
          </form>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                  ? isTransparent
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-600 text-white'
                  : isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/15'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {user.role === 'buyer' && (
                <Link to="/buyer/favorites"
                  className={`p-2 rounded-lg transition ${isTransparent ? 'text-white/80 hover:bg-white/15' : 'text-gray-500 hover:bg-gray-100'
                    }`}>
                  <Heart className="w-5 h-5" />
                </Link>
              )}
              <div className="relative">
                <button onClick={() => setDropdown(!dropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${isTransparent ? 'text-white hover:bg-white/15' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] truncate">{user.fullName?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.fullName}</p>
                      <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                    </div>
                    <Link to={dashboardLink}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition">
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition ${isTransparent
                    ? 'text-white border-white/40 hover:bg-white/15'
                    : 'text-purple-600 border-purple-200 hover:bg-purple-50'
                  }`}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-200">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg transition ${isTransparent ? 'text-white hover:bg-white/15' : 'text-gray-700 hover:bg-gray-100'
            }`}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artworks, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-200"
              />
            </form>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${isActive(link.to)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2 border-t border-gray-100 mt-2">
              {isLoggedIn ? (
                <>
                  <Link to={dashboardLink}
                    className="flex-1 text-center py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex-1 py-2.5 border-2 border-red-200 text-red-500 rounded-xl text-sm font-semibold">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="flex-1 text-center py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl text-sm font-semibold">
                    Login
                  </Link>
                  <Link to="/signup"
                    className="flex-1 text-center py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;