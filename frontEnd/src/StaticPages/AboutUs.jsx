import React from 'react';
import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import { Heart, Shield, Target, Lightbulb, Users, Palette, Star, Award } from 'lucide-react';

const team = [
  { name: 'Haroon Arshad', role: 'Project Lead',        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Usama Ifzal',   role: 'Full Stack Developer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { name: 'Faran Naveed',  role: 'UI/UX Designer',       img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
];

const values = [
  { icon: Heart,     title: 'Community First', desc: 'Building a supportive ecosystem for artists and art lovers across Pakistan.' },
  { icon: Shield,    title: 'Trust & Security', desc: 'Secure transactions with admin verification and full delivery tracking.' },
  { icon: Target,    title: 'Local Focus',      desc: 'Empowering Pakistani artists and celebrating homegrown talent.' },
  { icon: Lightbulb, title: 'Innovation',       desc: 'Bringing modern technology to traditional art commerce.' },
];

const stats = [
  { icon: Users,   num: '1,200+', label: 'Artists' },
  { icon: Palette, num: '3,000+', label: 'Artworks' },
  { icon: Star,    num: '1,500+', label: 'Sales' },
  { icon: Award,   num: '4.8/5',  label: 'Avg Rating' },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">About ArtBazaar</h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto">
            Pakistan's first dedicated digital marketplace connecting artists and art enthusiasts nationwide.
          </p>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-20">

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-1">Our Purpose</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              To empower Pakistani artists by providing a secure, transparent, and user-friendly platform
              where they can showcase their talent, connect with buyers, and build sustainable careers.
              We're bridging the gap between traditional art commerce and modern technology.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div key={i} className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <s.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{s.num}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-1">Background</p>
              <h2 className="text-3xl font-black text-gray-900 mb-5">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>ArtBazaar was born from a simple observation: Pakistani artists lacked a dedicated platform to showcase and sell their work online. While international platforms existed, they weren't tailored to local needs — from payment methods to shipping logistics.</p>
                <p>As a team of developers and designers passionate about both technology and art, we decided to create a solution. We spent months understanding the challenges faced by local artists and buyers, and built ArtBazaar to address every pain point.</p>
                <p>Today, we're proud to support hundreds of artists across Pakistan, helping them reach audiences they never could before.</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop"
                alt="Art workspace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="text-center mb-10">
              <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-1">Principles</p>
              <h2 className="text-3xl font-black text-gray-900">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v, i) => (
                <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <v.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-center mb-10">
              <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-1">People</p>
              <h2 className="text-3xl font-black text-gray-900">Meet the Team</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {team.map((m, i) => (
                <div key={i} className="text-center">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-3 ring-4 ring-purple-100"
                  />
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  <p className="text-purple-600 text-sm">{m.role}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}