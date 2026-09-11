const fs = require('fs');
const path = require('path');

const pages = {
  'careers': {
    title: 'Careers',
    heading: 'Join Our <span className="text-blue-500">Mission</span>',
    content: 
        <p className="text-xl text-zinc-400 mb-12">Help us build the future of financial infrastructure for merchants.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          <p className="text-zinc-500 mb-6">We are currently updating our job board. Please check back soon or send your resume to careers@paysurity.com.</p>
          <div className="flex gap-4">
             <a href="mailto:careers@paysurity.com" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors">Email Resume</a>
          </div>
        </div>
    
  },
  'press': {
    title: 'Press',
    heading: 'Press & <span className="text-blue-500">Media</span>',
    content: 
        <p className="text-xl text-zinc-400 mb-12">Latest news, announcements, and media resources for PaySurity.</p>
        <div className="grid gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl hover:bg-zinc-900/50 transition-colors">
            <span className="text-blue-400 text-sm font-bold tracking-wider uppercase mb-2 block">Press Release</span>
            <h3 className="text-xl font-bold text-white mb-2">PaySurity Announces Next-Gen POS System</h3>
            <p className="text-zinc-500">Our revolutionary cloud-based point of sale system is now entering Phase 2 rollout.</p>
          </div>
        </div>
    
  },
  'support': {
    title: 'Support Center',
    heading: 'How can we <span className="text-blue-500">help?</span>',
    content: 
        <p className="text-xl text-zinc-400 mb-12">Search our knowledge base or contact our 24/7 merchant support team.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
          <p className="text-zinc-400 mb-4">For immediate assistance with your POS or merchant account, please reach out to us:</p>
          <ul className="text-zinc-300 space-y-2 font-medium">
            <li>Email: support@paysurity.com</li>
            <li>Phone: 1-800-PAY-SURE</li>
          </ul>
        </div>
    
  },
  'privacy': {
    title: 'Privacy Policy',
    heading: 'Privacy Policy',
    content: 
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information to provide better services to our users. This includes account details, payment transaction data, and usage metrics on our platforms.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p>The data collected is strictly used to operate, maintain, and improve the PaySurity ecosystem. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>We implement industry-standard encryption and security protocols to protect your sensitive financial information.</p>
          </section>
          <p className="text-sm text-zinc-600 mt-12 pt-8 border-t border-zinc-800">Last updated: Q3 2026</p>
        </div>
    
  },
  'terms': {
    title: 'Terms of Service',
    heading: 'Terms of Service',
    content: 
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using PaySurity services, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Modifications</h2>
            <p>We reserve the right to modify or discontinue the service with or without notice to the user.</p>
          </section>
          <p className="text-sm text-zinc-600 mt-12 pt-8 border-t border-zinc-800">Last updated: Q3 2026</p>
        </div>
    
  },
  'security': {
    title: 'Security',
    heading: 'Enterprise-Grade <span className="text-blue-500">Security</span>',
    content: 
        <p className="text-xl text-zinc-400 mb-12">Your data and transactions are protected by bank-level encryption.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">PCI-DSS Compliant</h3>
            <p className="text-zinc-400">Our payment infrastructure exceeds Level 1 PCI compliance requirements.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
            <p className="text-zinc-400">All data is encrypted in transit and at rest using AES-256 protocols.</p>
          </div>
        </div>
    
  },
  'faqs': {
    title: 'FAQs',
    heading: 'Frequently Asked <span className="text-blue-500">Questions</span>',
    content: 
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">How long does it take to get approved?</h3>
            <p className="text-zinc-400">Most merchant accounts are approved instantly or within 24 hours.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Is there a setup fee?</h3>
            <p className="text-zinc-400">No, there are zero setup fees and zero hidden costs.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Do you provide hardware?</h3>
            <p className="text-zinc-400">Yes, we provide fully integrated POS terminals for our merchants.</p>
          </div>
        </div>
    
  },
  'pos': {
    title: 'POS System',
    heading: 'Next-Gen <span className="text-blue-500">POS System</span>',
    content: 
        <p className="text-xl text-zinc-400 mb-12">Lightning-fast, intuitive, and built for your industry.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4">Hardware meets Software</h2>
            <p className="text-zinc-400 mb-6">Our point of sale system integrates perfectly with your kitchen displays, online ordering, and back-office management. No extra tablets needed.</p>
            <a href="/savings-estimator" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors inline-block">Calculate Savings</a>
          </div>
          <div className="flex-1 bg-black rounded-xl aspect-video border border-zinc-800 flex items-center justify-center">
             <span className="text-zinc-600 font-mono text-sm">[POS Demo Graphic]</span>
          </div>
        </div>
    
  }
};

const template = (title, heading, content) => \import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '\ | PaySurity',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight" dangerouslySetInnerHTML={{ __html: '\' }}></h1>
        \
      </div>
    </main>
  );
}
\;

for (const [slug, data] of Object.entries(pages)) {
  const filePath = path.join(__dirname, 'apps', 'web', 'src', 'app', slug, 'page.tsx');
  fs.writeFileSync(filePath, template(data.title, data.heading, data.content));
  console.log('Created:', filePath);
}
