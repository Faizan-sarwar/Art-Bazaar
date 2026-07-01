import React from 'react';
import { useState } from 'react';
import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

const contactInfo = [
  { icon: Mail,   label: 'Email',    value: 'support@artbazaar.pk', sub: 'We reply within 24 hours' },
  { icon: Phone,  label: 'Phone',    value: '+92 300 123 4567',      sub: 'Mon–Fri, 9am–6pm PKT' },
  { icon: MapPin, label: 'Location', value: 'Islamabad, Pakistan',   sub: 'F-7 Markaz, Blue Area' },
  { icon: Clock,  label: 'Hours',    value: 'Mon–Fri: 9am–6pm',     sub: 'Pakistan Standard Time' },
];

const faqs = [
  { q: 'How do I track my order?',           a: 'Go to My Orders in your buyer dashboard and click "Track" next to your order.' },
  { q: 'How do I become a seller?',           a: 'Click "Apply as Artist" and complete the verification process. Approval takes 1–3 business days.' },
  { q: 'What payment methods are accepted?',  a: 'We accept JazzCash, EasyPaisa, Bank Transfer, and major credit/debit cards.' },
  { q: 'How do I request a refund?',          a: 'Visit our Refund Policy page or contact support within 7 days of delivery.' },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Contact Us</h1>
          <p className="text-white/80 text-base md:text-xl">We're here to help. Reach out to us any time.</p>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-16">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((c, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <c.icon size={20} className="text-white" />
                </div>
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">{c.label}</p>
                <p className="font-bold text-gray-900 text-sm mb-1">{c.value}</p>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle size={22} className="text-purple-600" /> Send a Message
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Your Name', key: 'name',    type: 'text',  ph: 'Ahmed Khan' },
                  { label: 'Email',     key: 'email',   type: 'email', ph: 'ahmed@email.com' },
                  { label: 'Subject',   key: 'subject', type: 'text',  ph: 'Order issue, payment query...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-400 focus:border-purple-400 transition"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your issue or question..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-400 focus:border-purple-400 transition resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition ${
                    sent ? 'bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Send size={16} />
                  {sent ? 'Message Sent!' : 'Send Message'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((f, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:border-purple-200 hover:shadow-sm transition">
                    <p className="font-bold text-gray-900 text-sm mb-2">{f.q}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}