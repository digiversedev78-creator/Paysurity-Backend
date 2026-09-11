'use client';

import React from 'react';
import TenantStorefrontLayout from '@/components/TenantStorefrontLayout';
import { StorefrontProps } from '../../../types/storefront';

export default function AshianaCollections() {
  const config: StorefrontProps = {
    name: 'Ashiana Collections',
    tenantType: 'Retail',
    tagline: 'Bridal · Day Wear · Accessories',
    headlineTemplate: 'Stunning Outfits at [Name]',
    description: 'Handcrafted fashion from South Asia. Every variant — size, color, fabric — sourced live from the database for the ultimate bespoke experience.',
    heroImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#1a0f2e',
    accentTextColor: '#ffffff',
    highlightColor: '#a78bfa',
    navLinks: [
      { label: 'Home', href: '/retail/ashiana' },
      { label: 'Catalog', href: '/retail/ashiana/catalog' },
      { label: 'Collections', href: '/retail/ashiana/collections' },
    ],
    primaryCTA: { label: 'Explore Collection', href: '/retail/ashiana/catalog' },
    promo: {
      badge: '👗 NEW ARRIVALS · SPRING 2026',
      headline: 'The Bridal Edit is Here.',
      body: 'Hand-embroidered silk and premium fabrics. Limited edition pieces available now.',
      cta1: { label: 'Shop Now', href: '/retail/ashiana/catalog' },
      cta2: { label: 'Book Consultation', href: '/retail/ashiana/consult' },
    },
    carousel: [
      {
        icon: '👑',
        title: 'Bridal Lehengas',
        subtitle: 'The Wedding Edit',
        desc: 'Hand-embroidered silk masterpieces with zardosi and mirror work.',
        href: '/retail/ashiana/catalog?cat=lehengas',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '🧵',
        title: 'Banarasi Silks',
        subtitle: 'Signature Saris',
        desc: 'Timeless hand-loomed Banarasi saris with real silver zari borders.',
        href: '/retail/ashiana/catalog?cat=sarees',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '💃',
        title: 'Anarkali Suits',
        subtitle: 'Formal Wear',
        desc: 'Flowing silhouettes in premium georgette and organza for pre-wedding events.',
        href: '/retail/ashiana/catalog?cat=anarkali',
        imageUrl: 'https://images.unsplash.com/photo-1621285853634-713b8dd6b5ee?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '💍',
        title: 'Kundan Jewelry',
        subtitle: 'Handcrafted',
        desc: 'Legacy-grade choker sets, maang tikkas, and traditional naths.',
        href: '/retail/ashiana/catalog?cat=accessories',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      },
      {
        icon: '👗',
        title: 'Silk Collection',
        subtitle: 'Bespoke Day Wear',
        desc: 'Modern tunics and fusion sets crafted from raw silk variants.',
        href: '/retail/ashiana/catalog?cat=silk',
        imageUrl: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80',
      },
    ],
    address: 'Global Fashion Hub · Ashiana',
    phone: '1-800-ASHIANA',
    email: 'concierge@ashianacollections.com',
    cartLabel: 'Bag',
    botName: 'Boutique Bot',
    botKnowledge: {
      businessName: 'Ashiana Collections',
      description: 'High-end South Asian clothing boutique specializing in Bridal Lehengas, Sarees, Sherwanis, and luxury Indo-Western apparel.',
      halal: false,
      specialties: ['lehenga', 'saree', 'sherwani', 'bridal', 'silk', 'velvet', 'kundan', 'embroidery'],
      faqs: [
        { q: 'What fabrics do you carry?', a: 'We specialize in pure Silk, Raw Silk, Velvet, Chiffon, and Georgette. All bridal collections feature hand-embroidered heritage designs. 💫' },
        { q: 'Do you do custom orders?', a: 'Yes! We accept custom orders for bridal ensembles. Please visit our store or contact us — lead time is typically 4–6 weeks.' },
        { q: 'What sizes do you have?', a: 'We carry XS through 3XL in most styles, with custom sizing available for bridal orders.' },
        { q: 'Do you have a Bridal collection?', a: 'Yes — our Bridal collection features Lehengas, Anarkalis, and heritage Sarees with Kundan and Zari embellishments. Perfect for weddings and formal events. 👰' },
      ],
    },
    allowSearch: true,
    groupOrderLink: 'https://ashianacollections.com/group-order',
  };

  return <TenantStorefrontLayout config={config} />;
}
