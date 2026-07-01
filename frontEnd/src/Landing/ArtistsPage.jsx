import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Star, MapPin, Award, CheckCircle,
  Heart, Users, Loader, AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { artworkAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const GRADIENTS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-rose-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-amber-500 to-yellow-500',
  'from-cyan-500 to-blue-500',
];

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [likedArtists, setLikedArtists] = useState({});
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError('');
      try {
        // STRICT APPROVAL FILTER applied here: Only counts artworks that are actually public
        const data = await artworkAPI.getAll({ limit: 500, isApproved: true });
        const artworks = data.artworks || [];

        const artistMap = {};
        artworks.forEach(a => {
          if (!a.artist) return;
          const id = a.artist._id;
          if (!artistMap[id]) {
            artistMap[id] = {
              _id: id,
              fullName: a.artist.fullName || a.artistName,
              avatar: a.artist.avatar,
              city: a.artist.city || 'Pakistan',
              specialty: a.artist.specialty || a.category,
              artworks: 0,
              sales: 0,
              views: 0,
              ratingSum: 0,
              ratingCount: 0,
            };
          }
          artistMap[id].artworks += 1;
          artistMap[id].sales += (a.sales || 0);
          artistMap[id].views += (a.views || 0);
          if (a.rating > 0) {
            artistMap[id].ratingSum += a.rating;
            artistMap[id].ratingCount += 1;
          }
        });

        const arr = Object.values(artistMap).map((artist, idx) => ({
          ...artist,
          rating: artist.ratingCount > 0 ? (artist.ratingSum / artist.ratingCount).toFixed(1) : 0,
          bgGradient: GRADIENTS[idx % GRADIENTS.length]
        }));

        arr.sort((a, b) => b.sales - a.sales);
        setArtists(arr);
      } catch (err) {
        setError(err.message || 'Failed to load artists');
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const toggleLike = (id) => {
    setLikedArtists(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredArtists = artists.filter(a =>
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-purple-900 pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
        <div className="w-full max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Meet the Artists</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Discover the creative minds behind Pakistan's most beautiful artworks.
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full sm:w-96 shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-600 outline-none transition font-medium"
            />
          </div>
          <div className="text-gray-500 font-semibold bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
            Showing <span className="text-purple-600">{filteredArtists.length}</span> artists
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader className="w-10 h-10 text-purple-600 animate-spin" /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtists.map((a) => (
              <div key={a._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group">
                <div className={`h-24 bg-gradient-to-r ${a.bgGradient} relative`}>
                  <button
                    onClick={() => toggleLike(a._id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition group/btn"
                  >
                    <Heart className={`w-4 h-4 ${likedArtists[a._id] ? 'fill-white text-white group-hover/btn:fill-red-500 group-hover/btn:text-red-500' : 'text-white group-hover/btn:text-red-500'}`} />
                  </button>
                </div>

                <div className="p-6 relative text-center pb-8">
                  <div className="w-20 h-20 mx-auto -mt-16 mb-3 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                    {a.avatar ? (
                      <img src={getImageUrl(a.avatar)} alt={a.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center font-black text-2xl text-gray-400">
                        {a.fullName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-1">
                    <h3 className="font-black text-lg text-gray-900 truncate max-w-[80%]">{a.fullName}</h3>
                    <CheckCircle className="w-4 h-4 text-blue-500 fill-white" />
                  </div>

                  <p className="text-sm font-semibold text-purple-600 mb-2">{a.specialty}</p>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {a.city}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                    {[['Artworks', a.artworks], ['Sales', a.sales]].map(([label, val]) => (
                      <div key={label} className="text-center">
                        <p className="font-bold text-gray-900 text-sm">{val}</p>
                        <p className="text-gray-400 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/login">
                    <button className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition shadow-md shadow-purple-200">
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 py-14 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Are You an Artist?</h2>
          <p className="text-white/80 mb-6 font-medium">Join our community and showcase your talent to thousands</p>
          <Link to="/signup">
            <button className="px-7 py-3 bg-white text-purple-700 rounded-xl font-black text-sm hover:bg-purple-50 transition shadow-xl">
              Apply as Seller
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}