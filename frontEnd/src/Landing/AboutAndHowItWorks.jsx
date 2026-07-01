import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Heart, Shield, Users, TrendingUp, MessageCircle,
  Package, Star, Search, Upload, DollarSign, Truck,
  Award, Target, Eye, Lightbulb, Zap, Loader
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { adminAPI } from '../services/api';

const VALUES = [
  { icon: Heart, title: 'Community First', desc: 'Building a supportive ecosystem for artists and art lovers' },
  { icon: Shield, title: 'Trust & Security', desc: 'Secure transactions with admin verification and delivery tracking' },
  { icon: Target, title: 'Local Focus', desc: 'Empowering Pakistani artists and celebrating local talent' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Bringing modern technology to traditional art commerce' },
];

const BUYER_STEPS = [
  { step: 1, icon: Search, title: 'Browse & Discover', desc: 'Explore unique artworks from talented Pakistani artists', color: 'bg-blue-500' },
  { step: 2, icon: MessageCircle, title: 'Connect with Artists', desc: 'Chat directly, negotiate prices, and request custom pieces', color: 'bg-green-500' },
  { step: 3, icon: DollarSign, title: 'Secure Payment', desc: 'Make peer-to-peer payments and share proof within the platform', color: 'bg-purple-500' },
  { step: 4, icon: Truck, title: 'Track Delivery', desc: 'Monitor your artwork delivery with real-time tracking updates', color: 'bg-orange-500' },
];

const TEAM = [
  { name: 'Haroon Arshad', role: 'Project Lead', gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Usama Ifzal', role: 'Full Stack Developer', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Faran Naveed', role: 'UI/UX Designer', gradient: 'from-pink-500 to-rose-500' },
];

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function AboutAndHowItWorks() {
  const [activePage, setActivePage] = useState('about');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(d => setStats(d.stats))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, num: stats ? `${stats.totalArtists}+` : '…', label: 'Artists' },
    { icon: Palette, num: stats ? `${stats.totalArtworks}+` : '…', label: 'Artworks' },
    { icon: Star, num: stats ? `${stats.totalOrders}+` : '…', label: 'Sales' },
    { icon: Award, num: '4.8/5', label: 'Rating' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero with Magic Tabs */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 pt-32 pb-24 px-4 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
        />
        <div className="w-full max-w-7xl mx-auto text-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.h1
              key={activePage}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
            >
              {activePage === 'about' ? 'About ArtBazaar' : 'How It Works'}
            </motion.h1>
          </AnimatePresence>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            {activePage === 'about'
              ? "Pakistan's first dedicated digital marketplace connecting artists and art enthusiasts nationwide."
              : 'Simple steps to start buying or selling art securely on our platform.'
            }
          </p>

          <div className="inline-flex bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 shadow-2xl">
            {['about', 'how-it-works'].map((tab) => (
              <button
                key={tab} onClick={() => setActivePage(tab)}
                className="relative px-8 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                {activePage === tab && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className={`relative z-10 ${activePage === tab ? 'text-purple-900' : 'text-white hover:text-white/80'}`}>
                  {tab === 'about' ? 'About Us' : 'How It Works'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {/* ABOUT TAB */}
          {activePage === 'about' && (
            <motion.section
              key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="py-20 px-4"
            >
              <div className="max-w-7xl mx-auto space-y-24">

                {/* Stats */}
                <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {statCards.map((s, i) => (
                    <motion.div key={i} variants={fadeUp} className="text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <s.icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                        {loading ? <Loader className="w-6 h-6 animate-spin mx-auto text-purple-400" /> : s.num}
                      </div>
                      <div className="text-gray-500 font-medium uppercase tracking-widest text-xs">{s.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Story */}
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                  <motion.div variants={fadeUp}>
                    <p className="text-purple-600 font-bold text-sm mb-3 uppercase tracking-widest">Our Story</p>
                    <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Bridging the Gap in Art Commerce</h2>
                    <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
                      <p>ArtBazaar was born from a simple observation: Pakistani artists lacked a dedicated platform to showcase and sell their work online. While international platforms existed, they were not tailored to local needs.</p>
                      <p>We spent months understanding the challenges faced by local artists and buyers, and built ArtBazaar to address every pain point—from integrated delivery to secure peer-to-peer verification.</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} whileHover={{ scale: 1.02, rotate: 1 }} className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-indigo-100 h-96 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    <div className="text-center relative z-10 bg-white/60 backdrop-blur-md p-10 rounded-3xl border border-white/50">
                      <Palette className="w-24 h-24 text-purple-600 mx-auto mb-4 drop-shadow-md" />
                      <p className="text-purple-900 font-black text-2xl tracking-tight">ArtBazaar</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Values */}
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
                  <motion.div variants={fadeUp} className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900">Our Core Values</h2>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {VALUES.map((v, i) => (
                      <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }} className="text-center p-8 rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all bg-white group">
                        <div className="w-16 h-16 bg-purple-50 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                          <v.icon className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mb-3">{v.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Team */}
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="pb-10">
                  <motion.div variants={fadeUp} className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900">The Minds Behind ArtBazaar</h2>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
                    {TEAM.map((m, i) => (
                      <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.05 }} className="text-center bg-gray-50 p-8 rounded-3xl">
                        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-black text-4xl mx-auto mb-5 shadow-xl shadow-purple-500/20`}>
                          {m.name.charAt(0)}
                        </div>
                        <h3 className="font-black text-gray-900 text-xl mb-1">{m.name}</h3>
                        <p className="text-purple-600 text-sm font-bold tracking-widest uppercase">{m.role}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </motion.section>
          )}

          {/* HOW IT WORKS TAB */}
          {activePage === 'how-it-works' && (
            <motion.section
              key="how" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="py-20 px-4 bg-gray-50"
            >
              <div className="max-w-7xl mx-auto space-y-24">

                {/* Buyers */}
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
                  <motion.div variants={fadeUp} className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">For Art Lovers & Buyers</h2>
                    <p className="text-gray-600 text-lg">Discover and securely purchase unique artworks in 4 simple steps.</p>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />

                    {BUYER_STEPS.map((s, i) => (
                      <motion.div key={s.step} variants={fadeUp} className="relative z-10 bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-shadow border border-gray-100 flex flex-col items-center text-center">
                        <div className={`${s.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-lg transform -translate-y-12 absolute`}>
                          {s.step}
                        </div>
                        <div className="pt-8">
                          <s.icon className={`w-10 h-10 mb-4 mx-auto ${s.color.replace('bg-', 'text-')}`} />
                          <h3 className="font-black text-gray-900 text-xl mb-3">{s.title}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* CTA Footer */}
      <section className="py-24 bg-gradient-to-r from-purple-800 to-indigo-900 relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-7xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to Dive In?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto px-10 py-4 bg-white text-purple-800 rounded-2xl font-black text-lg shadow-2xl">
                Sign Up Now
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}