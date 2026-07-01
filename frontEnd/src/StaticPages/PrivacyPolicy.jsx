import React from 'react';

import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import { Shield, ChevronRight } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'Personal identification information (name, email address, phone number)',
      'Profile information including artist bio, portfolio images, and payment details',
      'Transaction data including purchase history, order status, and payment confirmations',
      'Device and usage data such as IP address, browser type, and pages visited',
      'Communications between buyers and sellers conducted through our platform',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To create and manage your account and profile on ArtBazaar',
      'To process transactions and send related notifications and receipts',
      'To facilitate communication between buyers and sellers',
      'To verify seller identities and artwork authenticity',
      'To send platform updates, promotional offers (with your consent), and security alerts',
      'To improve our platform features based on usage patterns and feedback',
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      'We do not sell, trade, or rent your personal information to third parties',
      'Buyer shipping addresses are shared with sellers only to fulfil orders',
      'We may share data with trusted service providers who assist in platform operations',
      'We may disclose information when required by law or to protect platform integrity',
      'Aggregate anonymised data may be used for analytics and reporting',
    ],
  },
  {
    title: '4. Data Security',
    content: [
      'All data is transmitted using SSL/TLS encryption',
      'Passwords are hashed using industry-standard bcrypt algorithms',
      'Payment information is processed through secure, verified payment gateways',
      'We conduct regular security audits and vulnerability assessments',
      'Access to personal data is restricted to authorised personnel only',
    ],
  },
  {
    title: '5. Cookies & Tracking',
    content: [
      'We use cookies to maintain your session and remember preferences',
      'Analytics cookies help us understand how users interact with the platform',
      'You can disable cookies in your browser settings, though some features may be affected',
      'We do not use cookies to track you across third-party websites',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'Right to access: request a copy of the personal data we hold about you',
      'Right to correction: update or correct inaccurate personal information',
      'Right to deletion: request removal of your account and associated data',
      'Right to portability: receive your data in a structured, machine-readable format',
      'Right to object: opt out of marketing communications at any time',
    ],
  },
  {
    title: '7. Contact & Updates',
    content: [
      'For privacy concerns, contact us at privacy@artbazaar.pk',
      'We may update this policy periodically — changes will be posted on this page',
      'Continued use of ArtBazaar after updates constitutes acceptance of the revised policy',
      'This policy was last updated in December 2024',
    ],
  },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-blue-700 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={30} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-white/80 text-base md:text-lg">
            How ArtBazaar collects, uses, and protects your personal information.
          </p>
          <p className="text-white/60 text-sm mt-2">Last updated: December 2024</p>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="w-full max-w-7xl mx-auto">

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-10">
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              At ArtBazaar, your privacy is important to us. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our platform. By using ArtBazaar,
              you consent to the practices described here.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-10">
            <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo('section-' + i)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition w-full text-left"
                >
                  <ChevronRight size={14} />
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={i} id={'section-' + i} className="border border-gray-100 rounded-2xl p-6 hover:border-purple-200 transition">
                <h2 className="text-lg font-black text-gray-900 mb-4">{s.title}</h2>
                <ul className="space-y-2">
                  {s.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}