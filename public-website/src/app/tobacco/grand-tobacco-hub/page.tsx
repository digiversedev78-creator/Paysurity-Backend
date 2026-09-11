'use client';

import React from 'react';
import TenantStorefrontLayout from '@/components/TenantStorefrontLayout';
import { StorefrontProps } from '../../../types/storefront';

export default function GrandTobaccoHub() {
  const config: StorefrontProps = {
    name: 'Grand Tobacco Hub',
    tenantType: 'Tobacco',
    tagline: 'Premium Tobacco · Cigars · Vapes',
    headlineTemplate: 'Authentic Quality, Premium Taste by [Name]',
    description: 'Curated selection of cigars, vapes, cigarettes, and accessories. All age-restricted products require ZKP verification at checkout.',
    heroImageUrl: 'https://images.unsplash.com/photo-1541692641319-981cc79ee10a?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#1a0a00',
    accentTextColor: '#ffffff',
    highlightColor: '#fbbf24',
    navLinks: [
      { label: 'Home', href: '/tobacco/grand-tobacco-hub' },
      { label: 'Cigars', href: '/tobacco/grand-tobacco-hub/cigars' },
      { label: 'Vapes', href: '/tobacco/grand-tobacco-hub/vapes' },
    ],
    primaryCTA: { label: 'Shop Premium', href: '/tobacco/grand-tobacco-hub/shop' },
    promo: {
      badge: '🔞 AGE-VERIFIED RETAIL',
      headline: 'Authenticity Guaranteed.',
      body: 'Every cigar in our humidor is verified for quality and origin. 21+ only.',
      cta1: { label: 'Browse Humidor', href: '/tobacco/grand-tobacco-hub/cigars' },
      cta2: { label: 'ZKP Info', href: '/tobacco/grand-tobacco-hub/zkp' },
    },
    carousel: [
      {
        icon: '💎',
        title: 'Rare Vintage',
        subtitle: 'The $100+ Collection',
        desc: 'Authenticated rare and aged cigars for the ultimate collector.',
        href: '/tobacco/grand-tobacco-hub/catalog?cat=rare',
        imageUrl: 'https://images.unsplash.com/photo-1541692641319-981cc79ee10a?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '🇳🇮',
        title: 'Nicaraguan Bold',
        subtitle: 'Robust & Spicy',
        desc: 'Rich, full-bodied selections from the volcanic soils of Estelí.',
        href: '/tobacco/grand-tobacco-hub/catalog?cat=nicaraguan',
        imageUrl: 'https://images.unsplash.com/photo-1510442650500-93217e634e4c?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '🌑',
        title: 'Maduro Rich',
        subtitle: 'Sweet & Dark',
        desc: 'Aged Maduro wrappers offering complex notes of cocoa and espresso.',
        href: '/tobacco/grand-tobacco-hub/catalog?cat=maduro',
        imageUrl: 'https://images.unsplash.com/photo-1606114123279-3768e6f125bc?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '👑',
        title: 'Davidoff Suite',
        subtitle: 'The White Label',
        desc: 'Unparalleled luxury and sophistication for the refined palate.',
        href: '/tobacco/grand-tobacco-hub/catalog?brand=davidoff',
        imageUrl: 'https://images.unsplash.com/photo-1594911771101-098e9860b72f?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '⚙️',
        title: 'ST Dupont Gear',
        subtitle: 'Accessories',
        desc: 'Precision lighters and leather travel humidors.',
        href: '/tobacco/grand-tobacco-hub/accessories',
        imageUrl: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=800&q=80',
      },
    ],
    address: 'Grand Tobacco Suites · Downtown',
    phone: '1-800-TOBACCO',
    email: 'info@grandtobacco.com',
    specialty: 'Smoke',
    botName: 'Smoke Shop Bot',
    cartLabel: 'Cart',
    botKnowledge: {
      businessName: 'Grand Tobacco Hub',
      description: 'Premium tobacco retailer specializing in cigars, vapes, cigarettes, and accessories. All age-restricted products require 21+ ZKP verification.',
      address: 'Grand Tobacco Suites · Downtown',
      phone: '1-800-TOBACCO',
      specialties: ['cigar', 'humidor', 'maduro', 'davidoff', 'nicaraguan', 'vape', 'lighter'],
      faqs: [
        { q: 'Do I need to verify my age?', a: 'Yes — all tobacco and age-restricted products require ZKP age verification (21+) at checkout. This is enforced at the platform level.' },
        { q: 'Do you have humidors?', a: 'Yes! We carry travel humidors, desktop humidors, and the full ST Dupont accessory line. Ask about our membership program for collector discounts.' },
        { q: 'What cigars do you recommend?', a: 'For a bold experience: our Nicaraguan Bold collection from Estelí. For a refined palate: Davidoff White Label. For something dark & complex: our Maduro collection. 🎩' },
      ],
    },
    allowSearch: true,
    groupOrderLink: 'https://grandtobacco.com/group-order',
  };


  return <TenantStorefrontLayout config={config} />;
}
