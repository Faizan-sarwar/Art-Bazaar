import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Package, Users, Eye, MapPin, Globe, Instagram, Award, MessageSquare, Heart, Share2 } from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';

const ArtistProfileView = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState('artworks');

  const profile = {
    name:      'Ayesha Khan',
    specialty: 'Landscape & Nature Art',
    location:  'Islamabad, Pakistan',
    bio:       'I am a landscape artist passionate about capturing the breathtaking beauty of Northern Pakistan. Each painting is an invitation to journey through majestic valleys, golden sunsets, and pristine mountain lakes.',
    rating:    4.9,
    reviews:   128,
    sales:     234,
    followers: 1240,
    artworks:  45,
    joined:    'January 2023',
    website:   'www.ayeshakhanart.com',
    instagram: '@ayeshakhan_art',
    verified:  true,
    coverImg:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    awards:    ['Best Artist 2024', 'Top Seller Q3', 'Rising Star'],
  };

  const artworks = [
    { id:1, title:'Sunset Over Hunza',   price:25000, sales:23, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', liked:true  },
    { id:2, title:'Mountain Serenity',   price:28000, sales:15, img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', liked:false },
    { id:3, title:'Valley Dreams',       price:22000, sales:8,  img:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', liked:false },
    { id:4, title:'Northern Lights',     price:35000, sales:1,  img:'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400', liked:true  },
    { id:5, title:'Golden Hour',         price:26000, sales:5,  img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', liked:false },
    { id:6, title:'Winter in Skardu',    price:32000, sales:3,  img:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400', liked:false },
  ];

  const reviews = [
    { buyer:'Ahmed Hassan', avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', rating:5, comment:'Absolutely stunning work! The colours are even more vibrant in person.', artwork:'Sunset Over Hunza', date:'Dec 10' },
    { buyer:'Sara Ahmed',   avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', rating:5, comment:'Ayesha is incredibly talented and very responsive. Will order again!',      artwork:'Mountain Serenity', date:'Nov 28' },
    { buyer:'Ali Raza',     avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating:4, comment:'Great quality and fast delivery. The artwork looks beautiful.',             artwork:'Valley Dreams', date:'Nov 20' },
  ];

  const tabs = ['artworks', 'reviews', 'about'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="My Public Profile"
          subtitle="This is how buyers see you" />

        <main className="pb-10">
          {/* Cover + Avatar */}
          <div className="relative h-48 md:h-56 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
            <img src={profile.coverImg} alt="cover" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40" />
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-6">
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-5">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white border-4 border-white shadow-xl flex-shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="flex-1 sm:mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-black text-gray-900">{profile.name}</h1>
                  {profile.verified && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{profile.specialty}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin className="w-3 h-3" />{profile.location}
                </div>
              </div>
              <div className="flex gap-2 sm:mb-2">
                <Link to="/seller/chat">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    <MessageSquare className="w-4 h-4" /> Contact
                  </button>
                </Link>
                <button className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: Package, label:'Artworks',  value: profile.artworks  },
                { icon: Users,   label:'Followers', value: profile.followers.toLocaleString() },
                { icon: Star,    label:'Rating',    value: profile.rating    },
                { icon: Eye,     label:'Sales',     value: profile.sales     },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <s.icon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Awards */}
            <div className="flex flex-wrap gap-2 mb-5">
              {profile.awards.map(a => (
                <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />{a}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition ${
                    activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Artworks Tab */}
            {activeTab === 'artworks' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {artworks.map(art => (
                  <div key={art.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition cursor-pointer">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={art.img} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <button className={`absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition ${art.liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                        <Heart className={`w-4 h-4 ${art.liked ? 'fill-white' : ''}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{art.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-indigo-600 text-sm">PKR {art.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">{art.sales} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-5xl font-black text-indigo-600">{profile.rating}</p>
                    <div className="flex gap-0.5 justify-center my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(profile.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{profile.reviews} reviews</p>
                  </div>
                </div>

                {reviews.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={r.avatar} alt={r.buyer} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{r.buyer}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                          <span className="text-xs text-gray-400 ml-1">{r.date}</span>
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">{r.artwork}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="max-w-xl space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-3">About the Artist</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  {[
                    { label:'Member since', value: profile.joined  },
                    { label:'Location',     value: profile.location },
                    { label:'Specialty',    value: profile.specialty},
                    { label:'Website',      value: profile.website  },
                    { label:'Instagram',    value: profile.instagram },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{label}</span>
                      <span className="text-sm font-semibold text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistProfileView;