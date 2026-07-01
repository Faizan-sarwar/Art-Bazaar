import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Instagram, Twitter, Facebook, Mail, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white">

      {/* Newsletter Strip */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Stay in the loop</h3>
            <p className="text-white/70 text-sm">Latest artworks and artist updates, straight to your inbox</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 md:w-60 px-4 py-2.5 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white" />
            <button className="px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-50 transition flex items-center gap-1.5 flex-shrink-0">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-purple-900 rounded-xl">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-lg font-bold">Art<span className="text-purple-400">Bazaar</span></span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Pakistan's premier digital marketplace connecting artists and art lovers across the nation.
          </p>
          <div className="flex gap-2.5">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#"
                className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-purple-600 hover:text-white transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-5">Explore</h4>
          <ul className="space-y-3">
            {[
              ['Home',             '/'],
              ['Browse Artworks',  '/artworks'],
              ['Discover Artists', '/artists'],
              ['About Us',         '/about'],
              ['How It Works',     '/about'],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-gray-400 hover:text-purple-400 text-sm transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Artists */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-5">For Artists</h4>
          <ul className="space-y-3">
            {[
              ['Join as Artist',   '/signup'],
              ['Apply as Artist',  '/apply-artist'],
              ['Help & Support',   '/help'],
              ['Contact Us',       '/contact'],
              ['FAQ',              '/help'],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-gray-400 hover:text-purple-400 text-sm transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal + Contact */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-5">Legal</h4>
          <ul className="space-y-3 mb-6">
            {[
              ['Privacy Policy',   '/privacy-policy'],
              ['Terms of Service', '/terms'],
              ['Refund Policy',    '/refund-policy'],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-gray-400 hover:text-purple-400 text-sm transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail className="w-4 h-4 text-purple-500 flex-shrink-0" />
              support@artbazaar.pk
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
              Islamabad, Pakistan
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © 2026 ArtBazaar. All rights reserved. Built with ❤️ for Pakistani Artists
          </p>
          <div className="flex gap-5">
            {[
              ['Privacy', '/privacy-policy'],
              ['Terms',   '/terms'],
              ['Contact', '/contact'],
            ].map(([label, to]) => (
              <Link key={to} to={to}
                className="text-gray-500 hover:text-purple-400 text-xs transition">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;