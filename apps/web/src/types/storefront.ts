/**
 * PaySurity Unified Storefront Type System
 * 
 * Vertical-agnostic definitions for highly-branded merchant microsites.
 * Shared between Layout components and individual tenant configurations.
 */

export interface CarouselSlide {
  /** Emoji or icon string */
  icon: string;
  /** Primary title of the category/service */
  title: string;
  /** Branded subtitle e.g. "Signature", "Premium" */
  subtitle: string;
  /** Detailed description of the offering */
  desc: string;
  /** Target navigation URL */
  href: string;
  /** Optional high-resolution background image URL from DB */
  imageUrl?: string;
}

/** Structured knowledge object for the tenant's AI assistant */
export interface BotKnowledge {
  businessName: string;
  description: string;
  menuHighlights?: string[];
  hours?: string;
  address?: string;
  phone?: string;
  halal?: boolean;
  specialties?: string[];
  cateringInfo?: string;
  faqs?: { q: string; a: string }[];
}

export interface StorefrontProps {
  /** The business vertical (used for dynamic styling/templating) */
  tenantType: 'Restaurant' | 'Grocery' | 'Tobacco' | 'Retail';
  /** Display name of the business */
  name: string;
  /** Short tagline/descriptor shown in hero */
  tagline: string;
  /** 
   * Dynamic headline template for the Hero section.
   * e.g. "Stunning Outfits at [Name]" 
   */
  headlineTemplate?: string;
  /** Extended description of the brand/vertical */
  description: string;
  /** Hero background/atmosphere image URL */
  heroImageUrl: string;
  /** Opacity override for the hero gradient overlay */
  heroOverlayOpacity?: number;
  /** Primary brand accent hex (Navbar, primary borders) */
  accentColor: string;
  /** High-contrast text color for use on accent background */
  accentTextColor: string;
  /** Secondary highlight/action hex (Badges, primary CTA) */
  highlightColor: string;
  /** Primary navigation links */
  navLinks: { label: string; href: string }[];
  /** Primary call-to-action */
  primaryCTA: { label: string; href: string };
  /** Promotional/Urgency banner configuration */
  promo: {
    badge: string;
    headline: string;
    body: string;
    cta1: { label: string; href: string };
    cta2: { label: string; href: string };
  };
  /** The "Concept Sketch" carousel of offerings */
  carousel: CarouselSlide[];
  /** Physical contact & legal details */
  address: string;
  phone: string;
  email: string;
  /** Branded AI Assistant display name e.g. "Biryani Bot", "Style Advisor" */
  botName: string;
  /** 
   * The core specialty of the business for dynamic bot naming.
   * e.g. "Paan", "Smoke", "Grocery"
   */
  specialty?: string;
  /** 
   * Structured knowledge for the tenant AI bot.
   * Used by TenantBot to answer context-specific questions accurately.
   */
  botKnowledge: BotKnowledge;
  /**
   * The CTA label to use for the cart action.
   * Restaurant/Grocery → "Cart", Retail/Apparel → "Bag", Tobacco → "Cart"
   * Defaults to "Cart" if not provided.
   */
  /** Label for the cart action */
  cartLabel?: 'Cart' | 'Bag' | 'Order';
  /** External link for starting a group order */
  groupOrderLink?: string;
  /** Whether to show the search bar in the storefront */
  allowSearch?: boolean;
  /** 
   * Elite Tier UX Theme Selection
   * VIBRANT_SPICE: Orange/Stone (Tawakkul)
   * MINIMALIST_ARTISANAL: Black/White (HOB)
   */
  theme?: 'VIBRANT_SPICE' | 'MINIMALIST_ARTISANAL' | 'CORE_DARK';
}

/** @deprecated alias for backward compatibility during migration */
export type TenantConfig = StorefrontProps;
