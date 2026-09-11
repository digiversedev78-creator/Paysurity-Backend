# PaySurity Platform — Aesthetic & UI/UX Design System
**Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** BINDING — every screen built by agentic AI must conform to this system.

---

## Global Design Tokens (CSS Variables — `packages/shared-ui/tokens.css`)

```css
:root {
  /* ─── Brand Colors ─── */
  --ps-primary: #0F172A;          /* Midnight slate — primary backgrounds */
  --ps-primary-light: #1E293B;    /* Slate 800 — card backgrounds */
  --ps-accent: #3B82F6;           /* Electric blue — CTAs, links, active states */
  --ps-accent-hover: #2563EB;     /* Blue 600 — hover state */
  --ps-accent-glow: rgba(59, 130, 246, 0.15);  /* Subtle glow for focused elements */
  --ps-success: #10B981;          /* Emerald — payments, confirmations */
  --ps-warning: #F59E0B;          /* Amber — alerts, pending states */
  --ps-danger: #EF4444;           /* Red — errors, critical alerts, voids */
  --ps-info: #8B5CF6;             /* Violet — informational, AI accent */

  /* ─── Neutrals ─── */
  --ps-bg-page: #09090B;          /* Near-black — page background (dark mode) */
  --ps-bg-card: #18181B;          /* Zinc 900 — card/panel surfaces */
  --ps-bg-input: #27272A;         /* Zinc 800 — input/select backgrounds */
  --ps-border: #3F3F46;           /* Zinc 700 — borders, dividers */
  --ps-border-focus: var(--ps-accent);
  --ps-text-primary: #FAFAFA;     /* White — headings, primary text */
  --ps-text-secondary: #A1A1AA;   /* Zinc 400 — subtext, labels */
  --ps-text-muted: #71717A;       /* Zinc 500 — placeholder, disabled */

  /* ─── Light Mode Overrides ─── */
  --ps-bg-page-light: #F8FAFC;    /* Slate 50 */
  --ps-bg-card-light: #FFFFFF;
  --ps-bg-input-light: #F1F5F9;   /* Slate 100 */
  --ps-border-light: #E2E8F0;     /* Slate 200 */
  --ps-text-primary-light: #0F172A;
  --ps-text-secondary-light: #64748B; /* Slate 500 */

  /* ─── Typography ─── */
  --ps-font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --ps-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --ps-font-size-xs: 0.75rem;     /* 12px — metadata */
  --ps-font-size-sm: 0.875rem;    /* 14px — body small */
  --ps-font-size-base: 1rem;      /* 16px — body */
  --ps-font-size-lg: 1.125rem;    /* 18px — subheadings */
  --ps-font-size-xl: 1.5rem;      /* 24px — section headers */
  --ps-font-size-2xl: 2rem;       /* 32px — page titles */
  --ps-font-size-3xl: 2.5rem;     /* 40px — hero text */
  --ps-font-weight-normal: 400;
  --ps-font-weight-medium: 500;
  --ps-font-weight-semibold: 600;
  --ps-font-weight-bold: 700;

  /* ─── Spacing (8px grid) ─── */
  --ps-space-1: 0.25rem;  /* 4px */
  --ps-space-2: 0.5rem;   /* 8px */
  --ps-space-3: 0.75rem;  /* 12px */
  --ps-space-4: 1rem;     /* 16px */
  --ps-space-5: 1.25rem;  /* 20px */
  --ps-space-6: 1.5rem;   /* 24px */
  --ps-space-8: 2rem;     /* 32px */
  --ps-space-10: 2.5rem;  /* 40px */
  --ps-space-12: 3rem;    /* 48px */
  --ps-space-16: 4rem;    /* 64px */

  /* ─── Corners ─── */
  --ps-radius-sm: 6px;
  --ps-radius-md: 10px;
  --ps-radius-lg: 16px;
  --ps-radius-xl: 24px;
  --ps-radius-full: 9999px;

  /* ─── Shadows ─── */
  --ps-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --ps-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --ps-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --ps-shadow-glow: 0 0 20px var(--ps-accent-glow);

  /* ─── Transitions ─── */
  --ps-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --ps-transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --ps-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ─── Z-Index Scale ─── */
  --ps-z-dropdown: 50;
  --ps-z-sticky: 100;
  --ps-z-modal-backdrop: 200;
  --ps-z-modal: 300;
  --ps-z-toast: 400;
  --ps-z-tooltip: 500;
}
```

---

## Per-Vertical Aesthetic Specifications

### POSR — Restaurant POS Terminal

| Aspect | Specification |
|---|---|
| **Theme** | Dark mode ONLY (bright restaurants hurt eyes on screens) |
| **Primary accent** | `--ps-success` (emerald) — money/payment confirmation color |
| **Grid layout** | Left 65%: order builder. Right 35%: order summary + payment |
| **Menu items** | 90×90px tiles with image, name, price. Rounded corners `--ps-radius-md` |
| **Category tabs** | Horizontal scroll. Active tab: accent underline `3px solid var(--ps-accent)` |
| **KDS station** | Black background. Order tickets: white cards on black. Timer color fades: green→yellow→red→purple per config thresholds |
| **Font size** | Larger than default: base body = 18px (cashiers stand 2-3 feet from screen) |
| **Touch targets** | Minimum 48×48px. No close-together buttons. |
| **Animations** | Order items slide in from right (200ms). Payment success: confetti burst (lottie 1.5s) |
| **Sound** | New order: bell chime. KDS ticket done: success chime. Error: subtle buzz |

### POSG — Grocery POS Terminal

| Aspect | Specification |
|---|---|
| **Theme** | Dark mode ONLY (same reasoning as POSR) |
| **Primary accent** | `--ps-accent` (blue) — neutral, fast, professional |
| **Layout** | Full-width single column. Scanned items list on left 60%. Totals on right 40% |
| **Speed priority** | NO animations on item add (instant render). Animations only on checkout success |
| **Font size** | 20px body (grocery cashiers glance; no time to read small text) |
| **EBT split** | Green section = EBT-eligible items. White section = non-EBT. Split visible as items scan |
| **Age verification** | Full-screen overlay, large text, 3 large buttons (Scan ID / Enter DOB / Over 40) |
| **Scale integration** | Tare prompt: centered modal, 80% screen width. Weight readout: 72px bold number |

### ECO — E-Commerce Storefront (Consumer-Facing)

| Aspect | Specification |
|---|---|
| **Theme** | Light mode default. Dark mode toggle available |
| **Brand** | Merchant's own brand colors from `storefronts.theme_config` JSON |
| **Layout** | Full-width hero banner → menu grid → checkout flow |
| **Menu items** | Card with photo (16:9 aspect), name, price, "Add to Cart" button |
| **Cart** | Slide-in drawer from right. Items list, promo code input, subtotal, tax, total |
| **Checkout** | 3-step: Fulfillment → Payment (FluidPay iframe) → Confirmation |
| **Order tracking** | Real-time status page with animated step indicator |
| **Mobile-first** | Designed for 375px first; scales up |
| **Animations** | Cart count badge bounce on add. Step transitions slide left 300ms |

### WEB — Public Website (paysurity.com)

| Aspect | Specification |
|---|---|
| **Theme** | Dark mode default. Gradient hero sections |
| **Hero** | Full-viewport gradient `linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)` |
| **Typography** | Display font: Inter 700. Hero text size: 56px desktop, 32px mobile |
| **CTAs** | Rounded pill buttons (`--ps-radius-full`). Primary: solid blue. Secondary: outline/ghost |
| **Glassmorphism** | Feature cards: `backdrop-filter: blur(12px); background: rgba(255,255,255,0.05)` |
| **Animations** | Scroll-triggered fade-in (intersection observer). Hero gradient subtle shift |
| **Pricing page** | Toggle: Monthly/Annual. Plan cards side-by-side. Most popular: highlighted border |
| **Social proof** | Client logo strip. Testimonial carousel. Trust badges (PCI, SOC 2, NACHA) |

### MOB — Consumer Mobile App

| Aspect | Specification |
|---|---|
| **Theme** | System preference (follow OS dark/light mode) |
| **Navigation** | Bottom tab bar: Home, Loyalty, Wallet, Orders, Profile |
| **Cards** | Rounded `16px`, subtle shadow. Loyalty card has balance prominent (32px bold) |
| **Touch targets** | Minimum 44×44pt (Apple HIG minimum) |
| **Animations** | Page transitions: horizontal slide. Pull-to-refresh: custom branded spinner |
| **Haptics** | Success: light impact. Error: notification. Payment: heavy impact |

### Merchant Dashboard (Shared: OPS, PAY, FRN, LOY, MER)

| Aspect | Specification |
|---|---|
| **Theme** | Dark mode default. Light mode toggle |
| **Sidebar** | Collapsible, 280px expanded, 60px collapsed. Vertical icon labels |
| **Data tables** | Zebra-striped. Sortable columns. Hover: row highlight. Click: row detail |
| **Charts** | Recharts library. Colors from `--ps-accent`, `--ps-success`, `--ps-warning`, `--ps-danger` |
| **Metric cards** | Top strip of 4-6 cards: value (32px bold), label (14px muted), trend arrow (green/red) |
| **Date picker** | Preset: Today, Last 7, Last 30, This Month, Custom Range |
| **Empty states** | Illustrated SVG + message + CTA button. Never a blank page |
| **Toast notifications** | Top-right corner. Auto-dismiss 5s. Error: persist until dismissed |

### AI Chat (Consumer-Facing)

| Aspect | Specification |
|---|---|
| **Theme** | Dark floating bubble. Merchant brand accent color |
| **Bubble** | 60×60px circle, positioned bottom-right 16px from edges. Animated pulse on new message |
| **Chat window** | 400×600px max. Rounded corners 16px. Glass background |
| **Messages** | AI: left-aligned, semi-transparent card. User: right-aligned, accent-colored |
| **Typing indicator** | 3-dot bounce animation (standard chat UX) |
| **Quick replies** | Horizontal scroll chip buttons below AI message |
| **Order summary** | Inline card in chat showing items + total. "Confirm Order" CTA |

### PaySurity Admin (Internal: PAYSURITY_ADMIN, SUPER_ADMIN)

| Aspect | Specification |
|---|---|
| **Theme** | Dark mode ONLY (no light mode, internal tool). Compact density |
| **Layout** | Full-width data tables. Side panel for record detail (no page navigation) |
| **Critical alerts** | Red blinking badge on sidebar icon. Click → alert center |
| **Application queue** | Kanban board: STARTED → INFO_SUBMITTED → KYB_IN_PROGRESS → APPROVED/REJECTED |
| **Security events** | Log viewer with severity-colored rows. Filter by type, date, risk score |

---

## Component Library Checklist

Every new screen MUST use these shared components (never re-implement):

| Component | Package Path | Usage |
|---|---|---|
| `<Button>` | `packages/shared-ui/components/Button` | All clickable actions |
| `<Input>` | `packages/shared-ui/components/Input` | Text, email, phone (with E.164 mask) |
| `<Select>` | `packages/shared-ui/components/Select` | Dropdown selectors |
| `<DataTable>` | `packages/shared-ui/components/DataTable` | All list/table views |
| `<MetricCard>` | `packages/shared-ui/components/MetricCard` | Dashboard KPI strips |
| `<Toast>` | `packages/shared-ui/components/Toast` | All user notifications |
| `<Modal>` | `packages/shared-ui/components/Modal` | Confirmation dialogs |
| `<Skeleton>` | `packages/shared-ui/components/Skeleton` | Loading states |
| `<EmptyState>` | `packages/shared-ui/components/EmptyState` | No-data states |
| `<StatusBadge>` | `packages/shared-ui/components/StatusBadge` | Order/payment/subscription status pills |
| `<Chart>` | `packages/shared-ui/components/Chart` | Recharts wrappers |
| `<PhoneInput>` | `packages/shared-ui/components/PhoneInput` | E.164 enforced phone field |
| `<CurrencyDisplay>` | `packages/shared-ui/components/CurrencyDisplay` | Cents → formatted $XX.XX |
