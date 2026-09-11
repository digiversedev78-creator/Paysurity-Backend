'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Define interfaces for API data
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface RestaurantData {
  name: string;
  slug: string;
  heroImageUrl: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  menuCategories: MenuCategory[];
  brandingColors?: {
    primary?: string; // e.g., for restaurant accent color
    secondary?: string;
  };
}

// PaySurity brand colors and styles
const PAY_SURITY_BRAND = {
  bgColor: '#050508',
  gradientFrom: '#3b82f6', // Blue
  gradientTo: '#8b5cf6',   // Purple
  accentGreen: '#10b981',
  accentOrange: '#f97316',
  textColor: '#e0e0e0', // Light grey for general text on dark background
  lightTextColor: '#f8f8f8', // Even lighter for headings
  borderColor: '#333338',
};

export default function RestaurantMicrositePage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchRestaurantData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Bridge to Live NestJS Backend (Sovereign Engine)
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const response = await fetch(`${API_URL}/api/microsite/settings?slug=${slug}`, { cache: 'no-store' });
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Restaurant not found. Please check the URL.');
            }
            throw new Error(`Failed to fetch restaurant data: ${response.statusText}`);
          }
          const data: RestaurantData = await response.json();
          setRestaurantData(data);
          // Update document title for client-side SEO
          document.title = `${data.name} - Powered by PaySurity`;
          // You could also add dynamic meta description here, though generateMetadata is preferred for SSR.
          // const metaDescriptionTag = document.querySelector("meta[name='description']");
          // if (metaDescriptionTag) {
          //   metaDescriptionTag.setAttribute('content', data.description || `Discover delicious food and order online from ${data.name}.`);
          // }
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred while fetching restaurant details.');
          console.error('Error fetching restaurant data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurantData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PAY_SURITY_BRAND.bgColor,
        color: PAY_SURITY_BRAND.textColor,
        fontFamily: inter.style.fontFamily,
        fontSize: '1.2rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${PAY_SURITY_BRAND.gradientFrom}`,
            borderBottomColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s cubic-bezier(0.5, 0.0, 0.5, 1.0) infinite',
          }}></div>
          <span>Loading restaurant details...</span>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PAY_SURITY_BRAND.bgColor,
        color: PAY_SURITY_BRAND.textColor,
        fontFamily: inter.style.fontFamily,
        fontSize: '1.2rem',
        padding: '2rem',
        textAlign: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ color: PAY_SURITY_BRAND.accentOrange, marginBottom: '1rem' }}>Error Loading Page</h1>
        <p>{error}</p>
        <p>It seems we couldn't fetch the restaurant information. Please verify the URL or try again later.</p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          background: `linear-gradient(90deg, ${PAY_SURITY_BRAND.gradientFrom}, ${PAY_SURITY_BRAND.gradientTo})`,
          color: '#ffffff',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }} onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.4)';
          }} onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
          }}>
          Go to PaySurity Home
        </Link>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PAY_SURITY_BRAND.bgColor,
        color: PAY_SURITY_BRAND.textColor,
        fontFamily: inter.style.fontFamily,
        fontSize: '1.2rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        No restaurant data found for this slug.
      </div>
    );
  }

  // Determine accent color for this specific restaurant, fallback to PaySurity brand gradient start
  const restaurantAccentColor = restaurantData.brandingColors?.primary || PAY_SURITY_BRAND.gradientFrom;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: PAY_SURITY_BRAND.bgColor,
      color: PAY_SURITY_BRAND.textColor,
      fontFamily: inter.style.fontFamily,
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden', // Prevent horizontal scroll from animations
    }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '60vh', // Mobile
        maxHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
        overflow: 'hidden',
      }}>
        <img
          src={restaurantData.heroImageUrl || 'https://via.placeholder.com/1920x1080/050508/8b5cf6?text=Restaurant+Hero'}
          alt={`${restaurantData.name} hero image`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.5)',
            zIndex: 1,
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right, ${PAY_SURITY_BRAND.gradientFrom}11, transparent 20%, transparent 80%, ${PAY_SURITY_BRAND.gradientTo}11)`, // Subtle gradient overlay
          zIndex: 2,
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          background: 'rgba(5, 5, 8, 0.7)', // Slightly transparent dark background for readability
          backdropFilter: 'blur(5px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          animation: 'fadeInUp 0.8s ease-out forwards',
        }}>
          <h1 style={{
            fontSize: '2.8rem', // Mobile
            fontWeight: '800',
            color: PAY_SURITY_BRAND.lightTextColor,
            letterSpacing: '-0.05em',
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          }}>
            {restaurantData.name}
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: PAY_SURITY_BRAND.textColor,
            maxWidth: '600px',
            lineHeight: '1.6',
            opacity: 0.9,
          }}>
            {restaurantData.description}
          </p>
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column', // Stack on mobile
            gap: '1rem',
            width: '100%',
            maxWidth: '400px',
          }}>
            <Link
              href={`/restaurants/${slug}/menu`}
              style={{
                display: 'block', // Occupy full width
                padding: '0.9rem 2rem',
                borderRadius: '0.6rem',
                background: `linear-gradient(45deg, ${PAY_SURITY_BRAND.gradientFrom}, ${PAY_SURITY_BRAND.gradientTo})`,
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                textAlign: 'center',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
              }}
            >
              View Full Menu
            </Link>
            <Link
              href={`/restaurants/${slug}/order`}
              style={{
                display: 'block', // Occupy full width
                padding: '0.9rem 2rem',
                borderRadius: '0.6rem',
                backgroundColor: PAY_SURITY_BRAND.accentGreen,
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                textAlign: 'center',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.backgroundColor = '#15cd92'; // Slightly lighter green
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.backgroundColor = PAY_SURITY_BRAND.accentGreen;
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
              }}
            >
              Order Online Now
            </Link>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (min-width: 768px) {
            section {
              min-height: 70vh;
            }
            h1 {
              font-size: 4rem !important; /* Larger on desktop */
            }
            p {
              font-size: 1.25rem !important;
            }
            div > div > div { /* Action buttons container */
                flex-direction: row !important; /* Side-by-side on desktop */
                max-width: none !important;
                justify-content: center;
            }
            div > div > div > a { /* Action buttons */
                max-width: 250px; /* Limit width */
            }
          }
        `}</style>
      </section>

      {/* About Section - Using restaurant description */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        animation: 'fadeIn 1s ease-out forwards 0.3s', // Delay fade-in
        opacity: 0,
      }}>
        <h2 style={{
          fontSize: '2.5rem', // Mobile
          fontWeight: '700',
          color: restaurantAccentColor,
          marginBottom: '1rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          Welcome to {restaurantData.name}
        </h2>
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: PAY_SURITY_BRAND.textColor,
          maxWidth: '700px',
          margin: '0 auto',
          opacity: 0.9,
        }}>
          {restaurantData.description} At {restaurantData.name}, we are committed to delivering an unforgettable culinary experience, blending tradition with innovative flavors. Join us for a journey of taste and discover why we are a beloved spot in the community.
        </p>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (min-width: 768px) {
            h2 {
              font-size: 3.5rem !important;
            }
            p {
              font-size: 1.25rem !important;
            }
          }
        `}</style>
      </section>

      {/* Menu Categories Section */}
      {restaurantData.menuCategories && restaurantData.menuCategories.length > 0 && (
        <section style={{
          padding: '4rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          animation: 'fadeIn 1s ease-out forwards 0.5s', // Delay fade-in
          opacity: 0,
        }}>
          <h2 style={{
            fontSize: '2.2rem', // Mobile
            fontWeight: '700',
            color: PAY_SURITY_BRAND.lightTextColor,
            textAlign: 'center',
            marginBottom: '2.5rem',
          }}>
            Explore Our Menu
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem', // Mobile
            padding: '0 1rem', // Padding for small screens
          }}>
            {restaurantData.menuCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/restaurants/${slug}/menu#${category.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  backgroundColor: '#1a1a1e', // Darker background for cards
                  borderRadius: '0.8rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: PAY_SURITY_BRAND.lightTextColor,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
                  border: `1px solid ${PAY_SURITY_BRAND.borderColor}`,
                  transform: 'translateY(15px)', // Initial position for animation
                  opacity: 0, // Initial opacity for animation
                  animation: `cardFadeInUp 0.6s ease-out forwards ${0.1 * (index + 1) + 0.5}s`,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.6)';
                  e.currentTarget.style.backgroundColor = '#2a2a30'; // Slightly lighter on hover
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
                  e.currentTarget.style.backgroundColor = '#1a1a1e';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  color: restaurantAccentColor,
                  marginBottom: '1rem',
                }}>
                  {/* Icon placeholder - In a real app, use an icon library */}
                  {index % 3 === 0 && '🍽️'}
                  {index % 3 === 1 && '🍝'}
                  {index % 3 === 2 && '🥂'}
                </div>
                <h3 style={{
                  fontSize: '1.6rem',
                  fontWeight: '600',
                  color: PAY_SURITY_BRAND.lightTextColor,
                  marginBottom: '0.5rem',
                }}>
                  {category.name}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: PAY_SURITY_BRAND.textColor,
                  opacity: 0.8,
                }}>
                  Explore our exquisite selection of {category.name.toLowerCase()} dishes.
                </p>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href={`/restaurants/${slug}/menu`}
              style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                borderRadius: '0.5rem',
                background: PAY_SURITY_BRAND.accentOrange,
                color: '#ffffff',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = '#ff8c3a'; // Lighter orange
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = PAY_SURITY_BRAND.accentOrange;
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
              }}
            >
              See All Menu Items
            </Link>
          </div>
          <style jsx>{`
            @keyframes cardFadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media (min-width: 768px) {
              section > h2 {
                font-size: 3rem !important;
              }
              section > div { /* Grid container */
                  gap: 2rem !important;
                  padding: 0 !important;
              }
            }
          `}</style>
        </section>
      )}

      {/* Contact & Location Section */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        animation: 'fadeIn 1s ease-out forwards 0.7s',
        opacity: 0,
      }}>
        <h2 style={{
          fontSize: '2.2rem', // Mobile
          fontWeight: '700',
          color: PAY_SURITY_BRAND.lightTextColor,
          marginBottom: '2rem',
        }}>
          Visit Us Today
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          backgroundColor: '#1a1a1e',
          padding: '2.5rem',
          borderRadius: '0.8rem',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${PAY_SURITY_BRAND.borderColor}`,
        }}>
          <p style={{ fontSize: '1.1rem', color: PAY_SURITY_BRAND.textColor }}>
            <strong style={{ color: restaurantAccentColor }}>Address:</strong> {restaurantData.address || '123 Main St, Anytown, USA 12345'}
          </p>
          <p style={{ fontSize: '1.1rem', color: PAY_SURITY_BRAND.textColor }}>
            <strong style={{ color: restaurantAccentColor }}>Phone:</strong> <a href={`tel:${restaurantData.phone}`} style={{ color: PAY_SURITY_BRAND.gradientFrom, textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientTo} onMouseLeave={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientFrom}>{restaurantData.phone || '(555) 123-4567'}</a>
          </p>
          <p style={{ fontSize: '1.1rem', color: PAY_SURITY_BRAND.textColor }}>
            <strong style={{ color: restaurantAccentColor }}>Email:</strong> <a href={`mailto:${restaurantData.email}`} style={{ color: PAY_SURITY_BRAND.gradientFrom, textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientTo} onMouseLeave={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientFrom}>{restaurantData.email || 'info@restaurant.com'}</a>
          </p>
          {/* A simple map placeholder would go here */}
          <div style={{
            height: '250px',
            backgroundColor: '#28282e',
            borderRadius: '0.5rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: PAY_SURITY_BRAND.textColor,
            fontSize: '1rem',
            border: `1px solid ${PAY_SURITY_BRAND.borderColor}`,
          }}>
            Map Placeholder
          </div>
        </div>
        <style jsx>{`
          @media (min-width: 768px) {
            section > h2 {
              font-size: 3rem !important;
            }
          }
        `}</style>
      </section>


      {/* PaySurity Branding Footer */}
      <footer style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#101015',
        marginTop: 'auto', // Push footer to bottom
        borderTop: `1px solid ${PAY_SURITY_BRAND.borderColor}`,
        animation: 'fadeIn 1s ease-out forwards 0.9s',
        opacity: 0,
      }}>
        <p style={{
          fontSize: '0.9rem',
          color: PAY_SURITY_BRAND.textColor,
          opacity: 0.7,
        }}>
          Powered by <Link href="https://paysurity.com" style={{
            fontWeight: '600',
            textDecoration: 'none',
            color: PAY_SURITY_BRAND.gradientFrom,
            transition: 'all 0.3s ease',
          }} onMouseEnter={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientTo} onMouseLeave={(e: React.MouseEvent<HTMLElement>) => e.currentTarget.style.color = PAY_SURITY_BRAND.gradientFrom}>PaySurity</Link> - The Complete Payment & Business Platform
        </p>
      </footer>
    </div>
  );
}

// NOTE: For full SEO with <meta name="description"> and structured data,
// you would typically use Next.js's `generateMetadata` function.
// However, `generateMetadata` runs on the server, while this page is marked `'use client'`.
// In a production setup, the `layout.tsx` for `restaurants/[slug]` or `page.tsx` itself (if it weren't client-side)
// would include a `generateMetadata` function to pre-fetch the restaurant data on the server
// and populate the <head> tags for initial render and search engine crawlers.
// The `document.title` update in `useEffect` handles the title client-side for dynamic changes.

/*
// Example of how generateMetadata would look for server-side SEO:
import type { Metadata } from 'next';
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  let restaurantName = 'Restaurant';
  let description = 'Discover delicious food and order online with PaySurity.';
  let heroImageUrl = 'https://via.placeholder.com/1200x630/050508/8b5cf6?text=Restaurant'; // Default

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/microsite/settings?slug=${slug}`);
    if (response.ok) {
      const data: RestaurantData = await response.json();
      restaurantName = data.name;
      description = data.description || description;
      heroImageUrl = data.heroImageUrl || heroImageUrl;
    }
  } catch (error) {
    console.error('Failed to fetch data for metadata:', error);
  }

  return {
    title: `${restaurantName} - Powered by PaySurity`,
    description: description,
    openGraph: {
      title: `${restaurantName} - Powered by PaySurity`,
      description: description,
      url: `https://yourdomain.com/restaurants/${slug}`, // Replace with your actual domain
      siteName: 'PaySurity',
      images: [
        {
          url: heroImageUrl,
          width: 1200,
          height: 630,
          alt: `${restaurantName} hero image`,
        },
      ],
      locale: 'en_US',
      type: 'website', // or 'restaurant' if a specific schema is used
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurantName} - Powered by PaySurity`,
      description: description,
      images: [heroImageUrl],
    },
    // Structured Data (JSON-LD) for Restaurant schema
    // This would typically be rendered via a <script type="application/ld+json"> tag
    // which can be done via next/head or by a dedicated component.
    // However, the Metadata API doesn't directly support JSON-LD objects.
    // For premium pages, you might use a dedicated component that injects JSON-LD.
  };
}
*/
