import React from 'react';
import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

export default function StaticFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Palette size={16} className="text-white" />
          </div>
          <span className="text-white font-black text-lg">ArtBazaar</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mb-6">
          <Link to="/about-us"       className="hover:text-white transition">About Us</Link>
          <Link to="/contact"        className="hover:text-white transition">Contact</Link>
          <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/terms"          className="hover:text-white transition">Terms & Conditions</Link>
          <Link to="/refund-policy"  className="hover:text-white transition">Refund Policy</Link>
          <Link to="/help"           className="hover:text-white transition">Help & Support</Link>
        </div>

        {/* Bottom */}
        <p className="text-center text-xs text-gray-600">
          © {new Date().getFullYear()} ArtBazaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}