'use client';

import TenantStorefrontLayout from '../../../components/TenantStorefrontLayout';
import { StorefrontProps } from '../../../types/storefront';

const config: StorefrontProps = {
  name: 'GrocerEase',
  tenantType: 'Grocery',
  tagline: 'Fresh Groceries · Delivered Fresh · EBT Accepted',
  description:
    'Your neighborhood grocery partner. We provide the freshest organic produce, premium meats, and everyday essentials with lightning-fast local delivery.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
  heroOverlayOpacity: 0.1,
  accentColor: '#065f46',
  accentTextColor: '#ffffff',
  highlightColor: '#fbbf24',
  headlineTemplate: 'Freshly Picked for You by [Name]',
  cartLabel: 'Cart',
  navLinks: [
    { label: 'Home', href: '/grocery/grocerease' },
    { label: 'Departments', href: '/grocery/grocerease/departments' },
    { label: 'Weekly Ad', href: '/grocery/grocerease/deals' },
    { label: 'Order Online', href: '/grocery/grocerease/order' },
  ],
  primaryCTA: { label: 'Start Shopping', href: '/grocery/grocerease/order' },
  promo: {
    badge: '🛒 FREE DELIVERY ON ORDERS OVER $50',
    headline: 'Freshness Guaranteed or Your Money Back.',
    body: 'We source directly from local farms and trusted partners to bring you the highest quality groceries every single day. Shop with confidence.',
    cta1: { label: 'Shop Produce', href: '/grocery/grocerease/order' },
    cta2: { label: 'View Weekly Deals', href: '/grocery/grocerease/deals' },
  },
  carousel: [
    {
      icon: '🍎',
      title: 'Fresh Produce',
      subtitle: 'Organic & Local',
      desc: 'Seasonal fruits and vegetables picked at the peak of ripeness.',
      href: '/grocery/grocerease/order',
    },
    {
      icon: '🥩',
      title: 'Butcher Shop',
      subtitle: 'Premium Cuts',
      desc: 'High-quality meats, poultry, and seafood prepared to your preference.',
      href: '/grocery/grocerease/order',
    },
    {
      icon: '🥛',
      title: 'Dairy & Eggs',
      subtitle: 'Farm Fresh',
      desc: 'Fresh milk, artisanal cheeses, and farm-fresh eggs delivered daily.',
      href: '/grocery/grocerease/order',
    },
    {
      icon: '🍞',
      title: 'Bakery',
      subtitle: 'Baked Today',
      desc: 'Artisan breads, pastries, and custom cakes baked in-house.',
      href: '/grocery/grocerease/order',
    },
    {
      icon: '🥤',
      title: 'Beverages',
      subtitle: 'Thirst Quenchers',
      desc: 'Refreshing juices, sodas, sparkling water, and craft coffee beans.',
      href: '/grocery/grocerease/order',
    },
    {
      icon: '🧼',
      title: 'Household',
      subtitle: 'Daily Essentials',
      desc: 'Everything you need for your home, from cleaning supplies to personal care.',
      href: '/grocery/grocerease/order',
    },
  ],
  address: '123 Grocery Way, Chicago, IL 60601',
  phone: '(555) 987-6543',
  email: 'hello@grocerease.food',
  botName: 'GrocerEase Helper',
  botKnowledge: {
    businessName: 'GrocerEase',
    description: 'Neighborhood grocery store at 123 Grocery Way, Chicago. Fresh produce, premium meats, dairy, and household essentials. EBT/SNAP accepted. Free delivery on orders over $50.',
    halal: undefined,
    address: '123 Grocery Way, Chicago, IL 60601',
    phone: '(555) 987-6543',
    hours: 'Daily 7 AM – 10 PM',
    menuHighlights: ['Organic Avocados', 'Fresh Salmon', 'Farm Eggs', 'Artisan Sourdough', 'Local Honey', 'Grass-Fed Beef'],
    specialties: ['organic', 'produce', 'delivery', 'ebt', 'snap', 'fresh', 'local'],
    cateringInfo: 'GrocerEase offers bulk ordering and event provisioning for parties and corporate events. Call (555) 987-6543 or email hello@grocerease.food to discuss your needs.',
    faqs: [
      { q: 'Do you accept EBT?', a: 'Yes! GrocerEase accepts EBT/SNAP for eligible items both in-store and online. 🛒' },
      { q: 'Do you deliver?', a: 'Yes — free delivery on orders over $50 within our local delivery zone. Orders typically arrive within 2 hours.' },
      { q: 'Do you have organic produce?', a: 'Absolutely! We carry a full range of USDA-certified organic produce sourced from local farms. Look for the green "Organic" label in-store and online.' },
      { q: 'What are your hours?', a: 'We are open Daily from 7 AM to 10 PM, including weekends and most holidays.' },
      { q: 'Can I return items?', a: 'Yes — freshness is guaranteed. If you are not satisfied, we will replace or refund any item, no questions asked.' },
    ],
  },
  allowSearch: true,
  groupOrderLink: 'https://grocerease.food/group-order',
};

export default function GrocerEaseHomePage() {
  return <TenantStorefrontLayout config={config} />;
}
