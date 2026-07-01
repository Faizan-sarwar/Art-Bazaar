import React from 'react';
import { useState } from 'react';
import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import {
  HelpCircle, ChevronDown, ChevronUp, Search,
  ShoppingBag, Palette, CreditCard, Truck, Shield, Mail
} from 'lucide-react';

const categories = [
  {
    icon: ShoppingBag,
    label: 'Buying',
    faqs: [
      { q: 'How do I purchase an artwork?',       a: 'Browse artworks, click on one you like, and press "Buy Now". Follow the checkout steps to complete payment.' },
      { q: 'Can I negotiate prices with sellers?', a: 'Yes! Use the in-app chat to message the seller directly and discuss pricing before placing an order.' },
      { q: 'How do I track my order?',             a: 'Go to "My Orders" in your buyer dashboard and click "Track" next to your order for real-time updates.' },
      { q: 'What if I do not receive my order?',   a: 'If not delivered within 30 days, contact support and we will investigate and process a refund if needed.' },
    ],
  },
  {
    icon: Palette,
    label: 'Selling',
    faqs: [
      { q: 'How do I become a seller?',      a: 'Click "Apply as Artist" and submit your profile and portfolio. Our team reviews applications within 1 to 3 business days.' },
      { q: 'How do I upload an artwork?',     a: 'From your seller dashboard, go to "Upload Artwork", fill in the details, upload images, set your price, and submit for review.' },
      { q: 'When do I receive my earnings?',  a: 'Earnings are released 5 to 7 business days after the buyer confirms receipt or the delivery window closes.' },
      { q: 'Can I offer custom commissions?', a: 'Yes! Enable "Custom Orders" in your profile settings and buyers can send you personalised artwork requests.' },
    ],
  },
  {
    icon: CreditCard,
    label: 'Payments',
    faqs: [
      { q: 'What payment methods are accepted?', a: 'We accept JazzCash, EasyPaisa, Bank Transfer, and major debit/credit cards.' },
      { q: 'Is my payment information secure?',   a: 'Yes. All transactions are encrypted and processed through verified payment gateways. We never store card details.' },
      { q: 'Can I get a refund?',                 a: 'Yes, under certain conditions. Visit our Refund Policy page for full details.' },
    ],
  },
  {
    icon: Truck,
    label: 'Delivery',
    faqs: [
      { q: 'How long does delivery take?',       a: 'Delivery typically takes 5 to 14 business days depending on the seller location and shipping method.' },
      { q: 'Who handles shipping?',              a: 'Sellers are responsible for packaging and dispatching. ArtBazaar provides tracking through our platform.' },
      { q: 'What if my artwork arrives damaged?', a: 'Take photos immediately and contact support within 48 hours. We will arrange a refund or replacement.' },
    ],
  },
  {
    icon: Shield,
    label: 'Account',
    faqs: [
      { q: 'How do I reset my password?',       a: 'Click "Forgot Password" on the login page and follow the email instructions to reset your password.' },
      { q: 'How do I report a user or artwork?', a: 'Use the "Report" button on any listing or profile page. Our moderation team reviews reports within 24 hours.' },
      { q: 'Can I delete my account?',           a: 'Yes. Go to Profile Settings then Account then Delete Account. This action is permanent and cannot be undone.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-purple-200 transition">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-purple-600 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 pt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  const allFaqs = categories.flatMap((c) => c.faqs);
  const searchResults = search.trim()
    ? allFaqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={30} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Help and Support</h1>
          <p className="text-white/80 text-base md:text-lg mb-6">Find answers to common questions about ArtBazaar.</p>
          <div className="max-w-lg mx-auto flex items-center bg-white rounded-2xl px-4 py-3 gap-3 shadow-xl">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
              placeholder="Search for help..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 px-4">
        <div className="w-full max-w-7xl mx-auto">

          {search.trim() ? (
            <div className="mb-10">
              <h2 className="font-bold text-gray-900 mb-4">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
              </h2>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((f, i) => (
                    <FAQItem key={i} q={f.q} a={f.a} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <HelpCircle size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No results found. Try different keywords or browse categories below.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap mb-6">
                {categories.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(i)}
                    className={
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ' +
                      (activeCategory === i
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600')
                    }
                  >
                    <c.icon size={15} />
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {categories[activeCategory].faqs.map((f, i) => (
                  <FAQItem key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </>
          )}

          <div className="mt-12 bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center">
            <Mail size={28} className="text-purple-600 mx-auto mb-3" />
            <h2 className="font-black text-gray-900 text-lg mb-2">Still need help?</h2>
            <p className="text-gray-600 text-sm mb-4">Our support team is available Monday to Friday, 9am to 6pm PKT.</p>
            <button
              onClick={() => window.location.href = 'mailto:support@artbazaar.pk'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              Email Support
            </button>
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}