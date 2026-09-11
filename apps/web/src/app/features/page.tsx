'use client';
import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react'; // Explicit import needed if using JSX features that rely on React scope

// Define PaySurity brand colors and fonts
const COLORS = {
  darkBg: '#050508',
  blueGradient: '#3b82f6',
  purpleGradient: '#8b5cf6',
  accentGreen: '#10b981',
  orange: '#f97316',
  textLight: '#e2e8f0', // A light grey for text
  textMuted: '#94a3b8', // A slightly darker grey for secondary text
  border: '#1f2937', // A dark grey for borders
  cardBg: '#0f172a', // A slightly lighter dark for cards
  shadowPrimary: 'rgba(59, 130, 246, 0.4)', // Shadow for primary blue
  shadowDark: 'rgba(0, 0, 0, 0.1)',
  shadowDarkStrong: 'rgba(0, 0, 0, 0.2)',
};

const FONT_FAMILY = 'Inter, sans-serif';

// --- Reusable Components ---

const SectionTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2
    style={{
      fontSize: '2.5rem', // Base mobile font size
      fontWeight: 700,
      color: COLORS.textLight,
      marginBottom: '1rem',
      textAlign: 'center',
      fontFamily: FONT_FAMILY,
      lineHeight: '1.2',
      background: `linear-gradient(to right, ${COLORS.blueGradient}, ${COLORS.purpleGradient})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      paddingBottom: '0.5rem',
    }}
    className={`section-title ${className}`}
  >
    {children}
  </h2>
);

const SectionSubtitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p
    style={{
      fontSize: '1.125rem', // Base mobile font size
      color: COLORS.textMuted,
      marginBottom: '3rem',
      textAlign: 'center',
      maxWidth: '768px',
      margin: '0 auto 3rem auto',
      fontFamily: FONT_FAMILY,
      lineHeight: '1.6',
    }}
    className={`section-subtitle ${className}`}
  >
    {children}
  </p>
);

const FeatureCard = ({ icon, title, description, animationDelay }: { icon: string; title: string; description: string; animationDelay: string }) => (
  <div
    style={{
      background: COLORS.cardBg,
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: `0 4px 6px ${COLORS.shadowDark}, 0 10px 15px ${COLORS.shadowDark}`,
      border: `1px solid ${COLORS.border}`,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity: 0, // Initial state for fade-in animation
      transform: 'translateY(20px)', // Initial state for fade-in animation
      animation: `fadeInUp 0.7s ease-out forwards ${animationDelay}`,
    }}
    className="feature-card"
  >
    <div
      style={{
        background: `linear-gradient(45deg, ${COLORS.blueGradient}, ${COLORS.purpleGradient})`,
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        fontSize: '1.75rem',
        color: COLORS.textLight,
        fontWeight: 'bold',
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: COLORS.textLight,
        marginBottom: '0.75rem',
        fontFamily: FONT_FAMILY,
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: '1rem',
        color: COLORS.textMuted,
        fontFamily: FONT_FAMILY,
        lineHeight: '1.6',
      }}
    >
      {description}
    </p>
  </div>
);

const Button = ({ children, href, primary = true, className = '' }: { children: React.ReactNode; href: string; primary?: boolean; className?: string }) => (
  <Link href={href} passHref>
    <button
      style={{
        padding: '0.85rem 2rem',
        borderRadius: '9999px', // Full pill shape
        fontWeight: 600,
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: FONT_FAMILY,
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none', // Ensure button doesn't look like a link if wrapped
        ...(primary
          ? {
              background: `linear-gradient(to right, ${COLORS.blueGradient}, ${COLORS.purpleGradient})`,
              color: COLORS.textLight,
              boxShadow: `0 4px 15px ${COLORS.shadowPrimary}`,
            }
          : {
              background: 'transparent',
              color: COLORS.textLight,
              border: `1px solid ${COLORS.border}`,
            }),
      }}
      className={`${primary ? 'primary-button' : 'secondary-button'} ${className}`}
    >
      {children}
    </button>
  </Link>
);

const FeatureSection = ({
  children,
  title,
  subtitle,
  reverse = false,
  imageSrc,
  imageAlt,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  reverse?: boolean;
  imageSrc: string;
  imageAlt: string;
}) => (
  <section
    style={{
      padding: '6rem 1rem',
      backgroundColor: COLORS.darkBg,
      fontFamily: FONT_FAMILY,
    }}
  >
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column', // Mobile default
        alignItems: 'center',
        gap: '4rem',
      }}
      className={`feature-section-content ${reverse ? 'feature-section-reverse' : ''}`}
    >
      <div
        style={{
          flex: 1,
          textAlign: 'center', // Mobile default
        }}
        className="feature-text-content"
      >
        <h3
          style={{
            fontSize: '2rem', // Base mobile font size
            fontWeight: 700,
            color: COLORS.textLight,
            marginBottom: '1rem',
            lineHeight: '1.2',
            background: `linear-gradient(to right, ${COLORS.blueGradient}, ${COLORS.purpleGradient})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: FONT_FAMILY,
          }}
          className="feature-section-h3"
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '1.125rem', // Base mobile font size
            color: COLORS.textMuted,
            marginBottom: '2rem',
            lineHeight: '1.6',
            fontFamily: FONT_FAMILY,
          }}
          className="feature-section-p"
        >
          {subtitle}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center', // Mobile default
          }}
          className="feature-list-wrapper"
        >
          {children}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: `0 10px 30px ${COLORS.shadowDarkStrong}`,
          border: `1px solid ${COLORS.border}`,
          maxWidth: '100%',
        }}
        className="feature-image-wrapper"
      >
        <div
          style={{
            width: '100%',
            paddingTop: '60%', // Aspect ratio 5:3
            background: `linear-gradient(45deg, ${COLORS.blueGradient}22, ${COLORS.purpleGradient}22), url(${imageSrc}) center center / cover`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: COLORS.textLight,
            position: 'relative',
            borderRadius: '1rem',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '1rem 2rem',
              backgroundColor: `${COLORS.darkBg}d0`,
              borderRadius: '0.5rem',
              textAlign: 'center',
            }}
          >
            {imageAlt}
          </span>
        </div>
      </div>
    </div>
  </section>
);

const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      fontSize: '1rem',
      color: COLORS.textLight,
      fontFamily: FONT_FAMILY,
      lineHeight: '1.5',
      maxWidth: '500px', // Prevent text from being too wide
    }}
    className="feature-list-item"
  >
    <span
      style={{
        color: COLORS.accentGreen,
        fontSize: '1.25rem',
        lineHeight: 1,
        marginTop: '0.125rem',
      }}
    >
      ✔
    </span>
    <span>{children}</span>
  </div>
);

// Metadata for SEO
// Main Page Component
export default function FeaturesPage() {
  return (
    <div style={{ backgroundColor: COLORS.darkBg, minHeight: '100vh', fontFamily: FONT_FAMILY, color: COLORS.textLight }}>
      {/* Global CSS for responsiveness and animations */}
      <style jsx global>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          html, body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            scroll-behavior: smooth;
          }

          body {
            font-family: ${FONT_FAMILY};
            background-color: ${COLORS.darkBg};
            color: ${COLORS.textLight};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Keyframe Animations */
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          /* Button Hover States */
          .primary-button {
            background-size: 200% auto;
            background-image: linear-gradient(to right, ${COLORS.blueGradient} 0%, ${COLORS.purpleGradient} 50%, ${COLORS.blueGradient} 100%);
          }

          .primary-button:hover {
            background-position: right center; /* Change the direction of the change on hover */
            box-shadow: 0 8px 25px ${COLORS.shadowPrimary};
            transform: translateY(-2px);
          }

          .secondary-button:hover {
            border-color: ${COLORS.blueGradient};
            color: ${COLORS.blueGradient};
            transform: translateY(-2px);
            box-shadow: 0 4px 15px ${COLORS.shadowPrimary}33; /* Lighter shadow */
          }

          /* Feature Card Hover States */
          .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top left, ${COLORS.blueGradient}1A 0%, transparent 70%); /* Subtle blue-purple glow */
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
          }

          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 12px ${COLORS.shadowDarkStrong}, 0 16px 24px ${COLORS.shadowDarkStrong};
            border-color: ${COLORS.blueGradient}; /* Highlight border on hover */
          }
          .feature-card:hover::before {
            opacity: 1;
          }

          /* Responsive Typography & Layout */
          /* Mobile-first: Default styles are for screens up to 639px */

          .hero-section-h1 {
              font-size: 3rem; /* Mobile default */
          }
          .section-title {
              font-size: 2.5rem; /* Mobile default */
          }
          .feature-section-h3 {
              font-size: 2rem; /* Mobile default */
          }
          .section-subtitle, .feature-section-p {
              font-size: 1.125rem; /* Mobile default */
          }

          /* Small screens (min-width: 640px) */
          @media (min-width: 640px) {
            .feature-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .hero-section-h1 {
                font-size: 3.5rem !important;
            }
            .section-title {
                font-size: 3rem !important;
            }
            .feature-section-h3 {
                font-size: 2.25rem !important;
            }
          }

          /* Medium screens (min-width: 768px) */
          @media (min-width: 768px) {
            .feature-section-content {
              flex-direction: row !important;
              align-items: center !important;
              gap: 6rem !important;
            }
            .feature-section-reverse.feature-section-content {
              flex-direction: row-reverse !important;
            }
            .feature-text-content {
              text-align: left !important;
            }
            .feature-section-reverse .feature-text-content {
              text-align: right !important;
            }
            .feature-list-wrapper {
              align-items: flex-start !important;
            }
            .feature-section-reverse .feature-list-wrapper {
              align-items: flex-end !important;
            }
            .feature-image-wrapper {
              max-width: 50% !important;
            }
            .hero-section-h1 {
                font-size: 4rem !important;
            }
            .section-title {
                font-size: 3.5rem !important;
            }
            .feature-section-h3 {
                font-size: 2.5rem !important;
            }
            .section-subtitle, .feature-section-p {
                font-size: 1.25rem !important;
            }
          }

          /* Large screens (min-width: 1024px) */
          @media (min-width: 1024px) {
            .feature-grid {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            .hero-section-h1 {
                font-size: 5rem !important;
            }
          }

          /* Extra large screens (min-width: 1280px) */
          @media (min-width: 1280px) {
            .hero-section-h1 {
                font-size: 5.5rem !important;
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <section
        style={{
          padding: '8rem 1rem 6rem',
          backgroundColor: COLORS.darkBg,
          textAlign: 'center',
          background: `radial-gradient(ellipse at bottom, ${COLORS.darkBg} 0%, ${COLORS.cardBg} 100%)`, // Subtle radial gradient
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '3rem', // Base mobile font size
              fontWeight: 800,
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              background: `linear-gradient(to right, ${COLORS.blueGradient}, ${COLORS.purpleGradient})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: FONT_FAMILY,
            }}
            className="hero-section-h1"
          >
            Unlock Your Business Potential with PaySurity Features
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: COLORS.textMuted,
              maxWidth: '680px',
              margin: '0 auto 2.5rem auto',
              fontFamily: FONT_FAMILY,
              lineHeight: '1.6',
            }}
          >
            PaySurity is the complete payment & business platform, designed to empower restaurant owners, retailers, and small businesses with tools to thrive. Explore how our integrated solutions streamline operations, enhance customer experience, and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button href="/contact">Get Started Today</Button>
            <Button href="/solutions" primary={false}>Explore Solutions</Button>
          </div>
        </div>
      </section>

      {/* Feature Overview Grid */}
      <section
        style={{
          padding: '6rem 1rem',
          backgroundColor: COLORS.cardBg,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle>All-in-One Business Management at Your Fingertips</SectionTitle>
          <SectionSubtitle>
            From the front desk to the back office, PaySurity integrates every aspect of your business operations into one powerful, intuitive platform.
          </SectionSubtitle>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr', // Mobile default
              gap: '2rem',
            }}
            className="feature-grid"
          >
            <FeatureCard
              icon="🛒"
              title="Advanced POS System"
              description="Modern, intuitive, and feature-rich Point-of-Sale for efficient transactions and robust management."
              animationDelay="0s"
            />
            <FeatureCard
              icon="📱"
              title="Seamless Online Ordering"
              description="Empower your customers to order directly from your branded microsite for pickup or delivery."
              animationDelay="0.1s"
            />
            <FeatureCard
              icon="💳"
              title="Fluid Payment Processing"
              description="Secure, multi-currency processing with instant settlements through our FluidPay gateway."
              animationDelay="0.2s"
            />
            <FeatureCard
              icon="💸"
              title="Integrated Payroll Management"
              description="Simplify payroll, automate calculations, and ensure timely, accurate payments for your team."
              animationDelay="0.3s"
            />
            <FeatureCard
              icon="⭐"
              title="Dynamic Loyalty Engine"
              description="Build customer loyalty with customizable rewards programs that keep them coming back."
              animationDelay="0.4s"
            />
            <FeatureCard
              icon="📊"
              title="Centralized Admin Dashboard"
              description="Gain real-time insights and comprehensive control over all your business operations from one hub."
              animationDelay="0.5s"
            />
          </div>
        </div>
      </section>

      {/* Detailed Feature Sections */}

      {/* POS System */}
      <FeatureSection
        title="Streamlined Point-of-Sale for Every Transaction"
        subtitle="Our cutting-edge POS system is built for speed, reliability, and comprehensive control, adapting to your unique business needs."
        imageSrc="https://picsum.photos/seed/pos/800/500" // Placeholder image
        imageAlt="PaySurity POS System Interface"
      >
        <FeatureListItem>
          **Intuitive Order Management:** Swiftly process orders, split bills, and manage tables with an easy-to-use interface.
        </FeatureListItem>
        <FeatureListItem>
          **Robust Inventory Control:** Track stock in real-time, manage suppliers, and automate reordering to prevent shortages.
        </FeatureListItem>
        <FeatureListItem>
          **Employee & Shift Management:** Monitor performance, manage shifts, and simplify time tracking for your staff.
        </FeatureListItem>
        <FeatureListItem>
          **Customizable Interface:** Tailor your POS screens, menus, and discounts to match your brand and workflow perfectly.
        </FeatureListItem>
        <FeatureListItem>
          **Detailed Reporting:** Access comprehensive sales data, profit margins, and peak hour analysis to make informed decisions.
        </FeatureListItem>
      </FeatureSection>

      {/* Online Ordering / Microsite */}
      <FeatureSection
        title="Expand Your Reach with Seamless Online Presence"
        subtitle="Empower your customers to order directly, anytime, anywhere. Your custom microsite extends your brand online without hefty third-party commissions."
        reverse
        imageSrc="https://picsum.photos/seed/onlineorder/800/500" // Placeholder image
        imageAlt="PaySurity Online Ordering Platform"
      >
        <FeatureListItem>
          **Branded Microsite:** A fully customizable, mobile-responsive online storefront reflecting your brand identity.
        </FeatureListItem>
        <FeatureListItem>
          **Direct Order Integration:** Orders flow directly into your POS, streamlining kitchen operations and fulfillment.
        </FeatureListItem>
        <FeatureListItem>
          **Flexible Fulfillment:** Offer convenient options for pickup, delivery (with integrated tools), or curbside.
        </FeatureListItem>
        <FeatureListItem>
          **Easy Menu Management:** Update your online menu, prices, and specials instantly from your admin dashboard.
        </FeatureListItem>
        <FeatureListItem>
          **Zero Third-Party Fees:** Keep more of your revenue by owning your online ordering channel.
        </FeatureListItem>
      </FeatureSection>

      {/* Payment Processing */}
      <FeatureSection
        title="Secure, Fast, and Flexible Payment Solutions"
        subtitle="Experience frictionless transactions with our integrated payment processing, powered by FluidPay, ensuring security and efficiency."
        imageSrc="https://picsum.photos/seed/payment/800/500" // Placeholder image
        imageAlt="PaySurity Payment Processing Gateway"
      >
        <FeatureListItem>
          **FluidPay Gateway Integration:** Benefit from a robust, reliable, and secure payment processing engine.
        </FeatureListItem>
        <FeatureListItem>
          **Multi-Currency Support:** Accept payments from international customers with ease, simplifying global transactions.
        </FeatureListItem>
        <FeatureListItem>
          **Instant Settlements:** Get your funds faster with near real-time settlement options.
        </FeatureListItem>
        <FeatureListItem>
          **PCI Compliance:** Built-in security features to protect sensitive customer data and ensure regulatory compliance.
        </FeatureListItem>
        <FeatureListItem>
          **Diverse Payment Methods:** Support for credit/debit cards, mobile payments, contactless, and more.
        </FeatureListItem>
      </FeatureSection>

      {/* Payroll */}
      <FeatureSection
        title="Simplify Payroll, Empower Your Team"
        subtitle="Take the complexity out of payroll. PaySurity helps you manage wages, taxes, and employee benefits with precision and ease."
        reverse
        imageSrc="https://picsum.photos/seed/payroll/800/500" // Placeholder image
        imageAlt="PaySurity Payroll Management"
      >
        <FeatureListItem>
          **Automated Calculations:** Accurate wage, overtime, and deduction calculations ensure error-free payroll runs.
        </FeatureListItem>
        <FeatureListItem>
          **Direct Deposit:** Seamlessly pay your employees via direct deposit for convenience and speed.
        </FeatureListItem>
        <FeatureListItem>
          **Tax Filing & Compliance:** Integrated tools help manage tax withholdings and ensure compliance with federal and state regulations.
        </FeatureListItem>
        <FeatureListItem>
          **Time Tracking Integration:** Connects directly with employee time clock data for streamlined payroll processing.
        </FeatureListItem>
        <FeatureListItem>
          **Employee Portals:** Secure access for employees to view pay stubs, tax documents, and personal information.
        </FeatureListItem>
      </FeatureSection>

      {/* Loyalty Engine */}
      <FeatureSection
        title="Build Lasting Customer Relationships with Smart Loyalty"
        subtitle="Transform first-time buyers into loyal advocates with PaySurity’s powerful and customizable loyalty program engine."
        imageSrc="https://picsum.photos/seed/loyalty/800/500" // Placeholder image
        imageAlt="PaySurity Loyalty Program Engine"
      >
        <FeatureListItem>
          **Customizable Programs:** Design loyalty schemes that fit your business, from points-based to tiered rewards.
        </FeatureListItem>
        <FeatureListItem>
          **Automated Rewards:** Automatically issue points, discounts, or freebies based on customer spending habits.
        </FeatureListItem>
        <FeatureListItem>
          **Customer Profiles:** Access detailed customer purchase history and preferences for personalized engagement.
        </FeatureListItem>
        <FeatureListItem>
          **Targeted Marketing:** Use loyalty data to create effective marketing campaigns and promotions.
        </FeatureListItem>
        <FeatureListItem>
          **Integrated with POS & Online:** Seamlessly apply and redeem loyalty rewards across all sales channels.
        </FeatureListItem>
      </FeatureSection>

      {/* Admin Dashboard */}
      <FeatureSection
        title="Centralized Control, Unrivaled Insights"
        subtitle="Your comprehensive command center. The PaySurity Admin Dashboard provides real-time data and tools to manage your entire operation efficiently."
        reverse
        imageSrc="https://picsum.photos/seed/dashboard/800/500" // Placeholder image
        imageAlt="PaySurity Admin Dashboard"
      >
        <FeatureListItem>
          **Real-time Analytics:** Monitor sales, inventory, and employee performance with live data dashboards.
        </FeatureListItem>
        <FeatureListItem>
          **Comprehensive Reporting:** Generate detailed reports on every aspect of your business, from profit & loss to customer trends.
        </FeatureListItem>
        <FeatureListItem>
          **User & Role Management:** Control access and permissions for different staff roles across your platform.
        </FeatureListItem>
        <FeatureListItem>
          **Multi-Location Support:** Easily manage multiple business locations from a single, unified interface.
        </FeatureListItem>
        <FeatureListItem>
          **Settings & Integrations:** Configure your system settings and connect with essential third-party tools.
        </FeatureListItem>
      </FeatureSection>

      {/* Feature Comparison Table */}
      <section
        style={{
          padding: '6rem 1rem',
          backgroundColor: COLORS.darkBg,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <SectionTitle>Compare PaySurity Plans</SectionTitle>
          <SectionSubtitle>
            Find the perfect PaySurity plan that aligns with your business size and needs.
          </SectionSubtitle>

          <div
            style={{
              overflowX: 'auto',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '0.75rem',
              boxShadow: `0 8px 30px ${COLORS.shadowDarkStrong}`,
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '700px', // Ensure table doesn't get too small on mobile
                borderCollapse: 'separate',
                borderSpacing: 0,
                fontFamily: FONT_FAMILY,
              }}
            >
              <thead style={{ background: COLORS.cardBg }}>
                <tr>
                  <th
                    style={{
                      padding: '1.5rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: COLORS.textLight,
                      borderBottom: `1px solid ${COLORS.border}`,
                      borderRight: `1px solid ${COLORS.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Feature
                  </th>
                  <th
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: COLORS.textLight,
                      borderBottom: `1px solid ${COLORS.border}`,
                      borderRight: `1px solid ${COLORS.border}`,
                      whiteSpace: 'nowrap',
                      background: `linear-gradient(to right, ${COLORS.blueGradient}20, ${COLORS.purpleGradient}20)`,
                    }}
                  >
                    Standard Plan
                  </th>
                  <th
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: COLORS.textLight,
                      borderBottom: `1px solid ${COLORS.border}`,
                      whiteSpace: 'nowrap',
                      background: `linear-gradient(to right, ${COLORS.orange}20, ${COLORS.accentGreen}20)`,
                    }}
                  >
                    Premium Plan
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'POS System', standard: true, premium: true },
                  { feature: 'Online Ordering / Microsite', standard: true, premium: true },
                  { feature: 'Payment Processing (FluidPay)', standard: true, premium: true },
                  { feature: 'Multi-Currency Payments', standard: false, premium: true },
                  { feature: 'Instant Settlements', standard: 'Add-on', premium: true },
                  { feature: 'Inventory Management', standard: 'Basic', premium: 'Advanced' },
                  { feature: 'Employee Management', standard: true, premium: true },
                  { feature: 'Basic Reporting', standard: true, premium: false },
                  { feature: 'Advanced Analytics & Reporting', standard: false, premium: true },
                  { feature: 'Payroll Management', standard: 'Add-on', premium: true },
                  { feature: 'Loyalty Engine', standard: 'Basic', premium: 'Advanced' },
                  { feature: 'Admin Dashboard', standard: true, premium: true },
                  { feature: '24/7 Priority Support', standard: false, premium: true },
                  { feature: 'Dedicated Account Manager', standard: false, premium: true },
                ].map((row, index) => (
                  <tr key={row.feature} style={{ background: index % 2 === 0 ? COLORS.darkBg : COLORS.cardBg }}>
                    <td
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: `1px solid ${COLORS.border}`,
                        borderRight: `1px solid ${COLORS.border}`,
                        color: COLORS.textLight,
                        fontWeight: 500,
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={{
                        padding: '1.25rem 1.5rem',
                        textAlign: 'center',
                        borderBottom: `1px solid ${COLORS.border}`,
                        borderRight: `1px solid ${COLORS.border}`,
                        color: typeof row.standard === 'boolean' && row.standard ? COLORS.accentGreen : COLORS.textMuted,
                      }}
                    >
                      {typeof row.standard === 'boolean'
                        ? row.standard ? '✔' : '—'
                        : row.standard}
                    </td>
                    <td
                      style={{
                        padding: '1.25rem 1.5rem',
                        textAlign: 'center',
                        borderBottom: `1px solid ${COLORS.border}`,
                        color: typeof row.premium === 'boolean' && row.premium ? COLORS.accentGreen : COLORS.textMuted,
                      }}
                    >
                      {typeof row.premium === 'boolean'
                        ? row.premium ? '✔' : '—'
                        : row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            style={{
              fontSize: '0.9rem',
              color: COLORS.textMuted,
              textAlign: 'center',
              marginTop: '2rem',
              fontFamily: FONT_FAMILY,
            }}
          >
            *Custom enterprise solutions available upon request.
          </p>
        </div>
      </section>

      {/* Call to Action at the bottom */}
      <section
        style={{
          padding: '4rem 1rem',
          backgroundColor: COLORS.cardBg,
          textAlign: 'center',
        }}
      >
        <SectionTitle className="!mb-4">Ready to Transform Your Business?</SectionTitle>
        <SectionSubtitle className="!mb-6">
          Join hundreds of satisfied business owners who trust PaySurity for their complete payment and business needs.
        </SectionSubtitle>
        <Button href="/contact">Request a Demo</Button>
      </section>
    </div>
  );
}