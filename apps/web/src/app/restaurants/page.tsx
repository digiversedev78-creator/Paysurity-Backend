'use client';
import type { Metadata } from 'next';
import Link from 'next/link';

// Define core colors and styles as constants for reusability and clarity
const colors = {
  background: '#050508',
  primaryBlue: '#3b82f6',
  primaryPurple: '#8b5cf6',
  accentGreen: '#10b981',
  accentOrange: '#f97316',
  white: '#ffffff',
  lightGray: '#e0e7ff1a', // A subtle light gray for cards/borders on dark bg
  textLight: '#e2e8f0', // For general text on dark background
  textMuted: '#94a3b8', // For secondary text
  footerBg: '#000000',
};

const gradientText = `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryPurple})`;
const gradientBg = `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryPurple})`;

const RestaurantPage = () => {
  // Keyframes for subtle animations and hover states for elements, embedded in a style tag.
  // This is a pragmatic workaround for "inline styles" and needing advanced CSS features
  // like keyframes and pseudo-classes (e.g., :hover) within a server component.
  const globalStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
      opacity: 0; /* Hidden by default until animation starts */
    }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-800 { animation-delay: 0.8s; }
    .animate-delay-1000 { animation-delay: 1s; }

    /* Button hover states */
    .button-primary {
      background: ${gradientBg};
      background-size: 200% auto;
      transition: all 0.3s ease-in-out;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .button-primary:hover {
      background-position: right center; /* Shift background for gradient effect */
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      transform: translateY(-2px);
    }

    .button-outline {
      border: 1px solid ${colors.primaryBlue};
      color: ${colors.primaryBlue};
      transition: all 0.3s ease-in-out;
    }
    .button-outline:hover {
      background-color: ${colors.primaryBlue};
      color: ${colors.white};
      border-color: ${colors.primaryPurple};
      transform: translateY(-2px);
    }

    .card-hover {
        transition: all 0.3s ease-in-out;
    }
    .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    /* Footer link hover states */
    .footer-link {
        color: ${colors.textMuted};
        text-decoration: none;
        transition: color 0.3s ease-in-out;
    }
    .footer-link:hover {
        color: ${colors.primaryBlue};
    }

    /* Responsive adjustments for headings and paragraphs */
    @media (max-width: 768px) {
        h1 { font-size: 8vw !important; }
        h2 { font-size: 7vw !important; }
        h3 { font-size: 6vw !important; }
        p { font-size: 4vw !important; }
        .hero-subheader { font-size: 4.5vw !important; }
        .button-primary, .button-outline {
            padding: 12px 24px !important;
            font-size: 16px !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-bottom: 20px;
        }
        .hero-cta-group {
            flex-direction: column;
            align-items: center;
        }
        .section-padding { padding: 60px 5% !important; }
        .feature-card, .pos-card, .testimonial-card {
            flex: 1 1 100% !important;
            min-width: unset !important;
        }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
        h1 { font-size: 5vw !important; }
        h2 { font-size: 4vw !important; }
        h3 { font-size: 3.5vw !important; }
        p { font-size: 2.5vw !important; }
        .hero-subheader { font-size: 2.8vw !important; }
        .button-primary, .button-outline {
            padding: 14px 28px !important;
            font-size: 17px !important;
        }
        .feature-card, .pos-card, .testimonial-card {
            flex: 1 1 calc(50% - 30px) !important;
        }
    }
  `;

  const sectionStyle: any = {
    padding: '80px 5%',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
    color: colors.textLight,
  };

  const gradientTextStyle: any = {
    background: gradientText,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent', // Fallback for browsers not supporting background-clip
  };

  const primaryButtonStyle: any = {
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    color: colors.white,
  };

  const featureCardStyle: any = {
    flex: '1 1 calc(33.33% - 40px)', // For larger screens, 3 cards per row with gap
    minWidth: '280px', // Minimum width for mobile to allow stacking
    backgroundColor: '#1a1a20',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: `1px solid ${colors.lightGray}`,
  };

  const posCardStyle: any = {
    flex: '1 1 calc(33.33% - 30px)', // 3 cards per row, accounting for gap
    minWidth: '300px', // Minimum width for mobile
    backgroundColor: '#1a1a20',
    borderRadius: '16px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    border: `1px solid ${colors.lightGray}`,
    overflow: 'hidden',
    position: 'relative',
  };

  const testimonialCardStyle: any = {
    flex: '1 1 calc(33.33% - 30px)',
    minWidth: '300px',
    backgroundColor: '#1a1a20',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    border: `1px solid ${colors.lightGray}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <div style={{
      backgroundColor: colors.background,
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: colors.textLight,
      lineHeight: '1.6',
      overflowX: 'hidden',
    }}>
      {/* Embedded style block for keyframes and hover states */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* Hero Section */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '100px',
        paddingBottom: '100px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background gradient blob animation */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${colors.primaryBlue} 0%, transparent 70%)`,
          opacity: '0.15',
          filter: 'blur(100px)',
          animation: 'gradientShift 15s ease-in-out infinite alternate',
          zIndex: 0,
        }} />
         <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          width: '350px',
          height: '350px',
          background: `radial-gradient(circle, ${colors.primaryPurple} 0%, transparent 70%)`,
          opacity: '0.15',
          filter: 'blur(100px)',
          animation: 'gradientShift 18s ease-in-out infinite alternate-reverse',
          zIndex: 0,
        }} />

        <h1 className="animate-fadeIn" style={{
          fontSize: '3.5vw',
          minWidth: '300px',
          maxWidth: '900px',
          fontWeight: '800',
          marginBottom: '20px',
          lineHeight: '1.2',
          letterSpacing: '-1px',
          zIndex: 1,
          ...gradientTextStyle,
        }}>
          The Restaurant Management Platform That <span style={{ color: colors.accentGreen }}>Boosts Revenue</span>
        </h1>
        <p className="animate-fadeIn animate-delay-200 hero-subheader" style={{
          fontSize: '1.3vw',
          minWidth: '280px',
          maxWidth: '700px',
          color: colors.textMuted,
          marginBottom: '40px',
          zIndex: 1,
        }}>
          PaySurity provides an all-in-one POS solution designed specifically for restaurants,
          streamlining operations from table management to online orders,
          and ensuring every customer interaction is seamless.
        </p>
        <div className="animate-fadeIn animate-delay-400 hero-cta-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
          <Link href="/contact" className="button-primary" style={primaryButtonStyle}>
            Get Your Restaurant Online in 24 Hours
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}>
        <h2 style={{
          fontSize: '2.5vw',
          minWidth: '280px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '60px',
          ...gradientTextStyle,
        }}>
          Key Features Designed for <span style={{ color: colors.accentOrange }}>Modern Restaurants</span>
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div className="animate-fadeIn animate-delay-200 card-hover feature-card" style={featureCardStyle}>
            <div style={{
              backgroundColor: `${colors.primaryBlue}20`,
              padding: '15px',
              borderRadius: '50%',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '60px',
              height: '60px',
            }}>
              {/* Placeholder Icon: QR Code */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={colors.primaryBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h7v7h-7z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', color: colors.white }}>QR Code Table Pay</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px' }}>
              Enable customers to view menus, order, and pay directly from their table via QR codes, reducing wait times and freeing staff.
            </p>
          </div>

          <div className="animate-fadeIn animate-delay-400 card-hover feature-card" style={featureCardStyle}>
            <div style={{
              backgroundColor: `${colors.accentGreen}20`,
              padding: '15px',
              borderRadius: '50%',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '60px',
              height: '60px',
            }}>
              {/* Placeholder Icon: Online Ordering */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={colors.accentGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', color: colors.white }}>Integrated Online Ordering</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px' }}>
              Seamlessly manage online orders, takeout, and delivery with a fully integrated platform that syncs with your POS.
            </p>
          </div>

          <div className="animate-fadeIn animate-delay-600 card-hover feature-card" style={featureCardStyle}>
            <div style={{
              backgroundColor: `${colors.primaryPurple}20`,
              padding: '15px',
              borderRadius: '50%',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '60px',
              height: '60px',
            }}>
              {/* Placeholder Icon: Restaurant Modes */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={colors.primaryPurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v5a2 2 0 0 0 2 2h4l4-4h2"></path><path d="M21 21v-5a2 2 0 0 0-2-2h-4l-4 4h-2"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', color: colors.white }}>Dine-in, Takeout & Delivery</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px' }}>
              Handle all service models from a single system. Optimize order flow and kitchen efficiency for every channel.
            </p>
          </div>
        </div>
      </section>

      {/* POS Interface Section (Screenshots) */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '100px',
        paddingBottom: '100px',
      }}>
        <h2 style={{
          fontSize: '2.5vw',
          minWidth: '280px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '20px',
          ...gradientTextStyle,
        }}>
          Meet <span style={{ color: colors.accentOrange }}>BistroBeast</span> POS: Intuitive & Powerful
        </h2>
        <p style={{
          fontSize: '1.2vw',
          minWidth: '280px',
          textAlign: 'center',
          color: colors.textMuted,
          maxWidth: '800px',
          margin: '0 auto 60px auto',
        }}>
          Our state-of-the-art interface is designed for speed and ease of use, ensuring your team can focus on customers, not complex systems.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* POS Card 1 */}
          <div className="animate-fadeIn animate-delay-200 card-hover pos-card" style={posCardStyle}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              backgroundColor: `${colors.primaryBlue}10`,
              borderRadius: '50%',
              filter: 'blur(20px)',
            }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', color: colors.white }}>Order Management</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px', marginBottom: '25px' }}>
              Streamlined order entry, modification, and kitchen ticket printing. Effortlessly manage complex orders.
            </p>
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#2a2a30',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: colors.textMuted,
              fontSize: '14px',
              border: `1px dashed ${colors.lightGray}`,
              backgroundImage: `linear-gradient(45deg, ${colors.primaryBlue}10 25%, transparent 25%, transparent 75%, ${colors.primaryBlue}10 75%, ${colors.primaryBlue}10), linear-gradient(45deg, ${colors.primaryBlue}10 25%, transparent 25%, transparent 75%, ${colors.primaryBlue}10 75%, ${colors.primaryBlue}10)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}>
              <span style={{color: colors.primaryBlue}}>Order Interface Placeholder</span>
            </div>
          </div>

          {/* POS Card 2 */}
          <div className="animate-fadeIn animate-delay-400 card-hover pos-card" style={posCardStyle}>
             <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '100px',
              height: '100px',
              backgroundColor: `${colors.accentGreen}10`,
              borderRadius: '50%',
              filter: 'blur(20px)',
            }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', color: colors.white }}>Table Layout & Capacity</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px', marginBottom: '25px' }}>
              Visually manage your restaurant floor plan, assign tables, and track their status in real-time.
            </p>
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#2a2a30',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: colors.textMuted,
              fontSize: '14px',
              border: `1px dashed ${colors.lightGray}`,
              backgroundImage: `linear-gradient(45deg, ${colors.accentGreen}10 25%, transparent 25%, transparent 75%, ${colors.accentGreen}10 75%, ${colors.accentGreen}10), linear-gradient(45deg, ${colors.accentGreen}10 25%, transparent 25%, transparent 75%, ${colors.accentGreen}10 75%, ${colors.accentGreen}10)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}>
              <span style={{color: colors.accentGreen}}>Table Layout Placeholder</span>
            </div>
          </div>

          {/* POS Card 3 */}
          <div className="animate-fadeIn animate-delay-600 card-hover pos-card" style={posCardStyle}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '-20px',
              width: '80px',
              height: '80px',
              backgroundColor: `${colors.primaryPurple}10`,
              borderRadius: '50%',
              filter: 'blur(15px)',
            }} />
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px', color: colors.white }}>Real-time Analytics</h3>
            <p style={{ color: colors.textMuted, fontSize: '16px', marginBottom: '25px' }}>
              Gain insights into sales performance, popular dishes, staff efficiency, and inventory levels to make data-driven decisions.
            </p>
            <div style={{
              width: '100%',
              height: '180px',
              backgroundColor: '#2a2a30',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: colors.textMuted,
              fontSize: '14px',
              border: `1px dashed ${colors.lightGray}`,
              backgroundImage: `linear-gradient(45deg, ${colors.primaryPurple}10 25%, transparent 25%, transparent 75%, ${colors.primaryPurple}10 75%, ${colors.primaryPurple}10), linear-gradient(45deg, ${colors.primaryPurple}10 25%, transparent 25%, transparent 75%, ${colors.primaryPurple}10 75%, ${colors.primaryPurple}10)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}>
              <span style={{color: colors.primaryPurple}}>Analytics Dashboard Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '100px',
        paddingBottom: '100px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <h2 style={{
          fontSize: '2.5vw',
          minWidth: '280px',
          fontWeight: '700',
          marginBottom: '20px',
          ...gradientTextStyle,
        }}>
          Success Story: <span style={{ color: colors.accentGreen }}>Real Results</span> for Restaurants
        </h2>
        <p style={{
          fontSize: '1.2vw',
          minWidth: '280px',
          color: colors.textMuted,
          maxWidth: '800px',
          marginBottom: '60px',
        }}>
          See how PaySurity transformed operations and boosted profits for a thriving local business.
        </p>

        <div style={{
          backgroundColor: '#1a1a20',
          borderRadius: '16px',
          padding: '50px',
          maxWidth: '900px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          border: `1px solid ${colors.lightGray}`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${colors.primaryPurple}10, transparent, ${colors.primaryBlue}10)`,
            backgroundSize: '200% 200%',
            animation: 'gradientShift 20s ease-in-out infinite',
            opacity: '0.1',
            zIndex: 0,
          }} />
          <h3 style={{
            fontSize: '3vw',
            minWidth: '280px',
            fontWeight: '800',
            marginBottom: '20px',
            lineHeight: '1.2',
            color: colors.white,
            zIndex: 1,
          }}>
            House of Biryani increased orders by <span style={{ color: colors.accentGreen }}>40%</span> in 3 months
          </h3>
          <p style={{
            fontSize: '1.2vw',
            minWidth: '280px',
            color: colors.textMuted,
            marginBottom: '30px',
            maxWidth: '700px',
            zIndex: 1,
          }}>
            By implementing PaySurity's integrated online ordering and QR table pay, House of Biryani saw a dramatic increase in order volume and a significant reduction in operational costs. Their customers love the convenience, and their staff appreciates the streamlined workflow.
          </p>
          <Link href="/case-studies/house-of-biryani" className="button-primary" style={primaryButtonStyle}>
            Read the Full Case Study
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '100px',
        paddingBottom: '100px',
      }}>
        <h2 style={{
          fontSize: '2.5vw',
          minWidth: '280px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '20px',
          ...gradientTextStyle,
        }}>
          What Our Restaurant Owners Say
        </h2>
        <p style={{
          fontSize: '1.2vw',
          minWidth: '280px',
          textAlign: 'center',
          color: colors.textMuted,
          maxWidth: '800px',
          margin: '0 auto 60px auto',
        }}>
          Hear directly from business owners who have transformed their operations with PaySurity.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* Testimonial Card 1 */}
          <div className="animate-fadeIn animate-delay-200 card-hover testimonial-card" style={testimonialCardStyle}>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              marginBottom: '25px',
              fontStyle: 'italic',
              color: colors.white,
            }}>
              "PaySurity revolutionized our service. QR table pay alone increased our efficiency by 30%, and online orders are booming. It's truly a complete platform!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: colors.primaryBlue,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: colors.white,
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '15px',
              }}>JD</div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '18px', color: colors.white }}>Jane Doe</p>
                <p style={{ fontSize: '14px', color: colors.textMuted }}>Owner, The Urban Spoon</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 2 */}
          <div className="animate-fadeIn animate-delay-400 card-hover testimonial-card" style={testimonialCardStyle}>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              marginBottom: '25px',
              fontStyle: 'italic',
              color: colors.white,
            }}>
              "Managing dine-in, takeout, and delivery used to be a headache. PaySurity's system brought it all under one roof, making our daily operations incredibly smooth."
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: colors.accentGreen,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: colors.white,
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '15px',
              }}>RP</div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '18px', color: colors.white }}>Robert Patel</p>
                <p style={{ fontSize: '14px', color: colors.textMuted }}>Manager, Spice Route Bistro</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 3 */}
          <div className="animate-fadeIn animate-delay-600 card-hover testimonial-card" style={testimonialCardStyle}>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              marginBottom: '25px',
              fontStyle: 'italic',
              color: colors.white,
            }}>
              "The analytics dashboard is a game-changer. We've optimized our menu and staff schedules based on real data, directly impacting our bottom line. Highly recommend!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: colors.primaryPurple,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: colors.white,
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '15px',
              }}>AS</div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '18px', color: colors.white }}>Anna Schmidt</p>
                <p style={{ fontSize: '14px', color: colors.textMuted }}>Owner, The Daily Grind Cafe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding" style={{
        ...sectionStyle,
        paddingTop: '80px',
        paddingBottom: '80px',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}>
        <h2 style={{
          fontSize: '2.8vw',
          minWidth: '280px',
          fontWeight: '700',
          marginBottom: '25px',
          ...gradientTextStyle,
        }}>
          Ready to Elevate Your Restaurant?
        </h2>
        <p style={{
          fontSize: '1.3vw',
          minWidth: '280px',
          color: colors.textMuted,
          maxWidth: '800px',
          margin: '0 auto 40px auto',
        }}>
          Join hundreds of restaurants across the USA transforming their business with PaySurity.
          Get started today and experience the future of restaurant management.
        </p>
        <div className="hero-cta-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/contact" className="button-primary" style={primaryButtonStyle}>
                Get Your Restaurant Online in 24 Hours
            </Link>
            <Link href="/demo" className="button-outline" style={{
                ...primaryButtonStyle,
                background: 'none',
                color: colors.primaryBlue,
                border: `1px solid ${colors.primaryBlue}`,
                marginLeft: '0', // Overridden for mobile-first stacking
                boxShadow: 'none',
            }}>
                Request a Demo
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: colors.footerBg,
        padding: '50px 5%',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            fontSize: '28px',
            fontWeight: '800',
            marginBottom: '20px',
            textDecoration: 'none',
            ...gradientTextStyle,
            display: 'inline-block',
          }}>
            PaySurity
          </Link>
          <p style={{ marginBottom: '15px' }}>
            &copy; {new Date().getFullYear()} PaySurity. All rights reserved. The Complete Payment & Business Platform.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>
            <Link href="/contact" className="footer-link">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantPage;