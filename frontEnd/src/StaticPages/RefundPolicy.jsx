import React from 'react';
import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Mail } from 'lucide-react';

const eligible = [
  'Artwork arrives significantly damaged during delivery',
  'Item received is materially different from the listing description',
  'Artwork is confirmed as inauthentic or misrepresented',
  'Order is not delivered within 30 days of confirmed dispatch',
  'Seller cancels the order after payment is confirmed',
];

const notEligible = [
  'Change of mind after the order has been dispatched',
  'Minor colour variations due to screen display differences',
  'Damage caused by the buyer after delivery',
  'Custom or personalised orders once production has begun',
  'Digital artworks once downloaded or accessed',
  'Issues reported more than 7 days after delivery',
];

const steps = [
  { step: 1, icon: AlertTriangle, title: 'Report the Issue',  desc: 'Contact support within 7 days of delivery with photos of the issue.', color: 'bg-orange-500' },
  { step: 2, icon: Clock,         title: 'Review Process',    desc: 'Our team reviews your request within 2 business days.',               color: 'bg-blue-500' },
  { step: 3, icon: CheckCircle,   title: 'Decision & Action', desc: 'We issue a refund or arrange a return based on our findings.',         color: 'bg-green-500' },
  { step: 4, icon: RefreshCw,     title: 'Refund Processed',  desc: 'Approved refunds are credited within 5 to 7 business days.',          color: 'bg-purple-500' },
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={30} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Refund Policy</h1>
          <p className="text-white/80 text-base md:text-lg">
            We want every purchase to be a great experience.
          </p>
          <p className="text-white/60 text-sm mt-2">Last updated: December 2024</p>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="w-full max-w-7xl mx-auto space-y-12">

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              ArtBazaar is committed to ensuring buyer satisfaction. This policy outlines the conditions
              under which refunds, returns, or replacements are offered. All refund requests are reviewed
              by our support team on a case-by-case basis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-green-600" />
                <h2 className="font-black text-gray-900 text-lg">Eligible for Refund</h2>
              </div>
              <ul className="space-y-2">
                {eligible.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={20} className="text-red-500" />
                <h2 className="font-black text-gray-900 text-lg">Not Eligible</h2>
              </div>
              <ul className="space-y-2">
                {notEligible.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">How to Request a Refund</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((s) => (
                <div key={s.step} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition text-center">
                  <div className={s.color + ' w-10 h-10 rounded-xl flex items-center justify-center text-white font-black mx-auto mb-3'}>
                    {s.step}
                  </div>
                  <s.icon size={22} className="text-gray-400 mx-auto mb-2" />
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <Mail size={28} className="text-purple-600 mx-auto mb-3" />
            <h2 className="font-black text-gray-900 text-xl mb-2">Need Help?</h2>
            <p className="text-gray-600 text-sm mb-4">Our support team is here to help with any refund queries.</p>
            <button
              onClick={() => window.location.href = 'mailto:support@artbazaar.pk'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              Contact Support
            </button>
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}