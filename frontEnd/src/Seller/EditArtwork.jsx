import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, CheckCircle, X,
  DollarSign, Loader, AlertCircle, Upload, Image
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';
import { artworkAPI } from '../services/api';

const CATEGORIES  = ['Landscape','Abstract','Portraits','Traditional','Modern','Calligraphy','Other'];
const MEDIUMS     = ['Oil on Canvas','Acrylic','Watercolor','Mixed Media','Digital Art','Charcoal','Pencil','Other'];
const DELIVERIES  = ['3-5 days','1 week','2 weeks','1 month'];

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:5000${img}`;
};

const EditArtwork = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [message,     setMessage]     = useState({ type: '', text: '' });
  const [newImage,    setNewImage]    = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const [tagInput,    setTagInput]    = useState('');

  const [formData, setFormData] = useState({
    title:        '',
    description:  '',
    price:        '',
    category:     '',
    medium:       '',
    dimensions:   '',
    isAvailable:  true,
    tags:         [],
  });

  // Fetch real artwork data
  useEffect(() => {
    const fetchArtwork = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await artworkAPI.getById(id);
        const art  = data.artwork;
        setFormData({
          title:       art.title       || '',
          description: art.description || '',
          price:       art.price       || '',
          category:    art.category    || '',
          medium:      art.medium      || '',
          dimensions:  art.dimensions  || '',
          isAvailable: art.isAvailable !== undefined ? art.isAvailable : true,
          tags:        art.tags        || [],
        });
        setImagePreview(getImageUrl(art.image));
      } catch (err) {
        setError('Failed to load artwork: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArtwork();
  }, [id]);

  const sel = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB' });
      return;
    }
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(',', '');
      if (tag && !formData.tags.includes(tag)) {
        sel('tags', [...formData.tags, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    sel('tags', formData.tags.filter(t => t !== tag));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' }); return false;
    }
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' }); return false;
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid price' }); return false;
    }
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a category' }); return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('title',       formData.title);
      data.append('description', formData.description);
      data.append('price',       formData.price);
      data.append('category',    formData.category);
      data.append('medium',      formData.medium);
      data.append('dimensions',  formData.dimensions);
      data.append('isAvailable', formData.isAvailable);
      data.append('tags',        formData.tags.join(','));
      if (newImage) data.append('image', newImage);

      await artworkAPI.update(id, data);

      setSaved(true);
      setMessage({ type: 'success', text: 'Artwork updated successfully!' });
      setTimeout(() => {
        setSaved(false);
        navigate('/seller/dashboard');
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const optBtn = (val, current, onSelect) => (
    <button
      key={val}
      type="button"
      onClick={() => onSelect(val)}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
        current === val
          ? 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-gray-200 text-gray-600 hover:border-indigo-300 bg-white'
      }`}
    >
      {val}
    </button>
  );

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition";

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading artwork...</p>
        </div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={false} onClose={() => {}} />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load artwork</h3>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Edit Artwork"
          subtitle={formData.title}
        />

        <main className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

          {/* Back */}
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 text-sm font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success'
                ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              }
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">

            {/* Left — Image */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image className="w-16 h-16" />
                    </div>
                  )}
                  {newImage && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      New Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-2">
                    {newImage ? newImage.name : 'Current artwork image'}
                  </p>
                  <label className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    Replace Image
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Available for Sale</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formData.isAvailable ? 'Buyers can purchase this artwork' : 'Hidden from buyers'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={e => sel('isAvailable', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right — Form Fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-gray-900">Artwork Details</h2>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={e => sel('title', e.target.value)}
                  placeholder="Artwork title"
                  className={inputCls}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => sel('price', e.target.value)}
                    placeholder="e.g. 25000"
                    min="0"
                    className={inputCls + ' pl-9'}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => optBtn(c, formData.category, v => sel('category', v)))}
                </div>
              </div>

              {/* Medium */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Medium
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEDIUMS.map(m => optBtn(m, formData.medium, v => sel('medium', v)))}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Dimensions
                </label>
                <input
                  value={formData.dimensions}
                  onChange={e => sel('dimensions', e.target.value)}
                  placeholder="e.g. 24 x 36 inches"
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => sel('description', e.target.value)}
                  rows={4}
                  placeholder="Describe your artwork..."
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-indigo-900 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Type a tag and press Enter..."
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a tag</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                saved
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {saving ? (
                <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default EditArtwork;