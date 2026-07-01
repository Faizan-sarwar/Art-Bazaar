import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Landing/Navbar';
import StaticFooter from '../StaticPages/StaticFooter';
import { Palette, Upload, User, Mail, Phone, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ArtistApplicationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', city: '',
    artStyle: '', experience: '', bio: '',
    portfolio: '', instagram: '', reason: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Application Submitted!</h1>
            <p className="text-gray-600 mb-2">Thank you, <strong>{form.fullName}</strong>!</p>
            <p className="text-gray-500 text-sm mb-8">
              Our team will review your application and get back to you at <strong>{form.email}</strong> within 1 to 3 business days.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-2xl transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <StaticFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette size={30} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Apply as an Artist</h1>
          <p className="text-white/80">Join ArtBazaar and sell your art to thousands of buyers across Pakistan.</p>
        </div>
      </div>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ' +
                  (step >= s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400')
                }>
                  {s}
                </div>
                {s < 3 && <div className={'w-12 h-1 rounded ' + (step > s ? 'bg-purple-600' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">

            {/* Step 1 — Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Personal Information</h2>
                  <p className="text-gray-500 text-sm">Tell us a bit about yourself.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.fullName}
                        onChange={e => update('fullName', e.target.value)}
                        placeholder="Ahmed Ali"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        placeholder="ahmed@email.com"
                        type="email"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <select
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select city</option>
                      {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.fullName || !form.email || !form.phone || !form.city}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2 — Art Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">About Your Art</h2>
                  <p className="text-gray-500 text-sm">Tell us about your artistic background.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Art Style / Medium</label>
                  <select
                    value={form.artStyle}
                    onChange={e => update('artStyle', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Select your primary style</option>
                    {['Oil Painting', 'Watercolor', 'Acrylic', 'Digital Art', 'Pencil / Charcoal', 'Calligraphy', 'Photography', 'Sculpture', 'Mixed Media', 'Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                  <select
                    value={form.experience}
                    onChange={e => update('experience', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Select experience</option>
                    {['Less than 1 year', '1 to 2 years', '3 to 5 years', '5 to 10 years', '10+ years'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Artist Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="Tell buyers about yourself, your inspiration, and your work..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!form.artStyle || !form.experience || !form.bio}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Portfolio */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">Portfolio & Links</h2>
                  <p className="text-gray-500 text-sm">Share your work so we can review it.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Portfolio Link (optional)</label>
                  <div className="relative">
                    <Upload size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.portfolio}
                      onChange={e => update('portfolio', e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instagram (optional)</label>
                  <input
                    value={form.instagram}
                    onChange={e => update('instagram', e.target.value)}
                    placeholder="@yourusername"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Why do you want to join ArtBazaar?</label>
                  <textarea
                    value={form.reason}
                    onChange={e => update('reason', e.target.value)}
                    placeholder="Tell us your motivation..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.reason}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    Submit <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <StaticFooter />
    </div>
  );
}