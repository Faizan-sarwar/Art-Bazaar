import React from 'react';
import Navbar from '../Landing/Navbar';
import StaticFooter from './StaticFooter';
import { FileText, ChevronRight } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using ArtBazaar, you agree to be bound by these Terms and Conditions',
      'If you do not agree with any part of these terms, you may not use our platform',
      'These terms apply to all users including buyers, sellers, and visitors',
      'We reserve the right to update these terms at any time with notice posted on this page',
    ],
  },
  {
    title: '2. User Accounts',
    content: [
      'You must be at least 18 years old to create an account on ArtBazaar',
      'You are responsible for maintaining the confidentiality of your account credentials',
      'You agree to provide accurate and complete information during registration',
      'One person may not maintain more than one active account',
      'ArtBazaar reserves the right to suspend or terminate accounts that violate these terms',
    ],
  },
  {
    title: '3. Seller Responsibilities',
    content: [
      'Sellers must accurately describe their artworks including medium, size, and condition',
      'All listed artworks must be original works created by the seller',
      'Sellers are responsible for packaging artworks safely for delivery',
      'Sellers must respond to buyer inquiries within 48 hours',
      'Sellers may not list counterfeit, plagiarised, or unlicensed artworks',
      'ArtBazaar charges a platform commission on each completed sale',
    ],
  },
  {
    title: '4. Buyer Responsibilities',
    content: [
      'Buyers must provide accurate shipping information for order delivery',
      'Payment must be completed within 24 hours of placing an order',
      'Buyers should inspect artwork upon delivery and report issues within 48 hours',
      'Buyers may not attempt to conduct transactions outside the ArtBazaar platform',
      'False or fraudulent payment claims will result in account termination',
    ],
  },
  {
    title: '5. Prohibited Activities',
    content: [
      'Uploading or sharing harmful, offensive, or illegal content',
      'Attempting to hack, scrape, or disrupt the platform',
      'Creating fake reviews or manipulating the rating system',
      'Using the platform for money laundering or fraudulent transactions',
      'Harassing, threatening, or abusing other users',
      'Listing artworks that infringe on third-party intellectual property',
    ],
  },
  {
    title: '6. Payments & Commissions',
    content: [
      "All transactions are processed through ArtBazaar's secure payment system",
      'ArtBazaar deducts a platform commission before disbursing seller earnings',
      'Payouts are processed within 5 to 7 business days after order completion',
      'ArtBazaar is not responsible for delays caused by banking institutions',
      'All prices on the platform are listed in Pakistani Rupees (PKR)',
    ],
  },
  {
    title: '7. Dispute Resolution',
    content: [
      'Disputes between buyers and sellers should first be resolved through direct communication',
      'If unresolved, users may escalate the dispute to ArtBazaar support',
      "ArtBazaar's decision in disputes is final and binding",
      'ArtBazaar reserves the right to issue refunds or hold payments pending resolution',
      'These terms are governed by the laws of Pakistan',
    ],
  },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 pt-12 pb-16 px-4">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={30} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Terms and Conditions</h1>
          <p className="text-white/80 text-base md:text-lg">
            Please read these terms carefully before using ArtBazaar.
          </p>
          <p className="text-white/60 text-sm mt-2">Last updated: December 2024</p>
        </div>
      </div>

      <main className="flex-1 py-16 px-4">
        <div className="w-full max-w-7xl mx-auto">

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              These Terms and Conditions govern your use of the ArtBazaar platform. By creating an account
              or using our services, you acknowledge that you have read, understood, and agree to these terms.
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-6 mb-10">
            <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo('tc-' + i)}
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
              <div key={i} id={'tc-' + i} className="border border-gray-100 rounded-2xl p-6 hover:border-purple-200 transition">
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

          <div className="mt-10 p-5 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm text-yellow-800 leading-relaxed">
            <strong>Note:</strong> For questions or concerns contact us at <strong>legal@artbazaar.pk</strong>
          </div>

        </div>
      </main>

      <StaticFooter />
    </div>
  );
}