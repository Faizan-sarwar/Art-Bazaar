import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Palette, Users, Award, ChevronRight,
  Star, Play, MessageCircle, Package, Shield,
  ArrowRight, Loader, TrendingUp, Sparkles
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { artworkAPI, adminAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const HERO_SLIDES = [
  {
    title: "Discover Pakistan's Finest Art",
    subtitle: "Connect directly with talented local artists across the country",
    bg: 'from-violet-900 via-purple-800 to-indigo-900',
  },
  {
    title: "Commission Custom Artwork",
    subtitle: "Request personalized pieces made just for you by top artists",
    bg: 'from-rose-900 via-pink-800 to-orange-900',
  },
  {
    title: "Join Live Art Sessions",
    subtitle: "Watch artists create in real-time and interact with them",
    bg: 'from-emerald-900 via-teal-800 to-cyan-900',
  },
];

const FEATURES = [
  { icon: Shield, title: 'Secure Transactions', desc: 'Safe peer-to-peer and card payments' },
  { icon: Sparkles, title: 'Authentic Art', desc: '100% genuine pieces from verified artists' },
  { icon: Package, title: 'Nationwide Delivery', desc: 'Safe and tracked shipping anywhere in Pakistan' },
  { icon: MessageCircle, title: 'Direct Communication', desc: 'Chat directly with artists before buying' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({ users: 0, artworks: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      try {
        const [artData, statsData] = await Promise.all([
          artworkAPI.getAll({ limit: 8, isApproved: true }), // STRICT APPROVAL FILTER
          adminAPI.getStats().catch(() => ({ stats: { totalUsers: 500, totalArtworks: 1200, totalOrders: 300 } }))
        ]);
        setArtworks(artData.artworks || []);
        if (statsData.stats) {
          setStats({
            users: statsData.stats.totalUsers || 500,
            artworks: statsData.stats.totalArtworks || 1200,
            orders: statsData.stats.totalOrders || 300
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">

        {/* HERO SECTION */}
        <div className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[currentSlide].bg}`}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold mb-6 border border-white/30 shadow-lg">
                🏆 The #1 Marketplace for Pakistani Artists
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium drop-shadow-md">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/artworks">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-8 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:bg-gray-50 transition shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                    <Palette className="w-5 h-5" /> Explore Artworks
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-8 py-4 bg-purple-600/40 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black text-lg hover:bg-purple-600/60 transition shadow-lg flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" /> Join as Artist
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125 w-8' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="bg-white border-b border-gray-100 py-8 relative z-20 -mt-6 mx-4 sm:mx-8 lg:mx-auto max-w-5xl rounded-2xl shadow-xl">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center px-4">
              <p className="text-3xl font-black text-purple-600">{stats.artworks}+</p>
              <p className="text-sm text-gray-500 font-semibold mt-1">Active Artworks</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-black text-purple-600">{stats.users}+</p>
              <p className="text-sm text-gray-500 font-semibold mt-1">Community Members</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-black text-purple-600">{stats.orders}+</p>
              <p className="text-sm text-gray-500 font-semibold mt-1">Successful Sales</p>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="py-24 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Why Choose ArtBazaar?</h2>
              <p className="text-gray-500 text-lg">We provide the most secure and vibrant platform for art commerce in Pakistan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-300">
                    <f.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED ARTWORKS */}
        <div className="py-24 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Featured Masterpieces</h2>
                <p className="text-gray-500 text-lg">Handpicked approved artworks from our top talented creators.</p>
              </div>
              <Link to="/artworks">
                <button className="px-6 py-3 bg-gray-50 text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition border border-gray-100 flex items-center gap-2 shadow-sm">
                  View Gallery <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader className="w-10 h-10 text-purple-600 animate-spin" /></div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">No artworks showcased right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {artworks.map((art, i) => (
                  <motion.div key={art._id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group">
                    <Link to="/login">
                      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-purple-200 transition-all duration-300">
                        <div className="h-64 bg-gray-100 overflow-hidden relative">
                          <img src={getImageUrl(art.image)} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={e => { e.target.style.display = 'none'; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-1 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-purple-600 transition">{art.title}</h3>
                            {art.isAuthenticated && <Shield className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" title="Verified Authentic" />}
                          </div>
                          <p className="text-sm text-gray-500 mb-4">by {art.artistName}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-lg text-gray-900">PKR {art.price?.toLocaleString()}</span>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <ShoppingBag className="w-4 h-4 text-purple-600 group-hover:text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="relative py-24 overflow-hidden bg-purple-900">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-purple-500/30 blur-[120px] rounded-full" />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, type: "spring" }} className="w-full max-w-7xl mx-auto text-center px-4 relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to Start Your Art Journey?
            </h2>
            <p className="text-xl text-white/80 mb-10 font-medium">Join thousands of art enthusiasts and creators today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-10 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg hover:bg-gray-50 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Sign Up as Buyer
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-white text-white rounded-2xl font-black text-lg transition">
                  Become a Seller
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

      </main>
      <Footer />
    </div>
  );
}