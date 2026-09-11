'use client';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// SEO Metadata
// Using professional placeholder images from Unsplash since local images are missing
const teamMemberImages = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', // Alice
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', // Robert
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', // Maria
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80', // Emily
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', // Daniel
];

// Reusable gradient text component for brand consistency
const GradientText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-transparent bg-clip-text ${className}`}>
    {children}
  </span>
);

// Note: For actual animations, ensure that 'animate-fade-in-up' and 'animate-fade-in'
// along with their respective keyframes (fadeInUp, fadeIn) are defined in your
// `tailwind.config.js` file or a global CSS file (e.g., `app/globals.css`).
// Example `tailwind.config.js` setup for animations:
/*
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
    },
  },
*/

export default function AboutPage() {
  return (
    <div className={`${inter.variable} font-sans bg-[#050508] text-white antialiased`}>
      {/* Header (Simplified for this page component, would typically be in a global layout) */}
      <header className="relative z-20 w-full bg-[#050508] border-b border-gray-800 py-4 px-6 md:px-12 lg:px-24">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold" aria-label="PaySurity Home">
            <GradientText>PaySurity</GradientText>
          </Link>
          <div className="flex space-x-6 md:space-x-10 text-lg">
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors duration-200">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
              Pricing
            </Link>
            <Link href="/about" className="text-white border-b-2 border-[#3b82f6] pb-1">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>
          <Link href="/signup" className="hidden md:block px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#8b5cf6] hover:to-[#3b82f6] transition-all duration-300 shadow-lg">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 text-center overflow-hidden">
          {/* Background gradient/effect */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#050508] via-gray-950 to-purple-950 opacity-60"></div>
          <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'url("/images/abstract-pattern.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div> {/* Placeholder for subtle background pattern */}

          <div className="relative z-10 max-w-5xl mx-auto px-6 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <GradientText className="block">Revolutionizing Payments,</GradientText>
              <GradientText className="block mt-2">Empowering Your Business.</GradientText>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              At PaySurity, we believe every business, regardless of size, deserves enterprise-grade payment solutions and the robust tools to truly thrive. We&apos;re building the future of commerce, one secure transaction at a time.
            </p>
            <Link href="/features" className="inline-block px-8 py-3 rounded-full text-lg font-semibold bg-[#10b981] hover:bg-[#0e9f6e] transition-colors duration-300 shadow-md transform hover:scale-105">
              Explore Our Platform
            </Link>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 md:py-28 lg:py-36 bg-gradient-to-br from-[#050508] via-gray-950 to-[#050508] text-center px-6">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Our <GradientText>Mission</GradientText>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed font-light italic">
              &quot;Empowering every business with enterprise-grade payments,
              making sophisticated financial tools accessible, secure, and profoundly simple.&quot;
            </p>
          </div>
        </section>

        {/* Company Stats */}
        <section className="py-20 md:py-28 lg:py-36 bg-gray-950 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">
              The <GradientText>PaySurity Story</GradientText> So Far
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 rounded-xl bg-gray-800 shadow-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <span className="text-5xl font-extrabold text-[#3b82f6] block mb-3">2024</span>
                <h3 className="text-xl font-semibold text-white mb-2">Founded In</h3>
                <p className="text-gray-300">Born out of a vision to simplify complex payment landscapes for businesses across the USA.</p>
              </div>
              <div className="p-8 rounded-xl bg-gray-800 shadow-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <span className="text-5xl font-extrabold text-[#8b5cf6] block mb-3">Chicago, IL</span>
                <h3 className="text-xl font-semibold text-white mb-2">Our Roots</h3>
                <p className="text-gray-300">Proudly innovating from the vibrant tech hub of the Midwest, serving a nationwide clientele.</p>
              </div>
              <div className="p-8 rounded-xl bg-gray-800 shadow-xl border border-gray-700 transform hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <span className="text-5xl font-extrabold text-[#10b981] block mb-3">10,000+</span>
                <h3 className="text-xl font-semibold text-white mb-2">Happy Merchants</h3>
                <p className="text-gray-300">Trusted by a rapidly growing community of restaurant owners, retailers, and small businesses.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 md:py-28 lg:py-36 bg-[#050508] px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Our Core <GradientText>Values</GradientText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-700 bg-gray-900 shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white text-4xl shadow-xl">
                  {/* Icon for Security */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Security First</h3>
                <p className="text-gray-300">
                  Protecting your business, your data, and your customers is our paramount responsibility. We implement robust, industry-leading security measures at every level, ensuring peace of mind.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-700 bg-gray-900 shadow-lg animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#f97316] text-white text-4xl shadow-xl">
                  {/* Icon for Merchant-Centric */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 15V5m0 15a2 2 0 01-2-2V7a2 2 0 012-2m0 15h-2a2 2 0 01-2-2V7a2 2 0 012-2h2m0 10a2 2 0 01-2-2V7a2 2 0 012-2h2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Merchant-Centric</h3>
                <p className="text-gray-300">
                  Your success is our success. We are dedicated to understanding and serving your unique needs, providing intuitive tools and exceptional, responsive support to help your business flourish.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-700 bg-gray-900 shadow-lg animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <div className="mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#10b981] text-white text-4xl shadow-xl">
                  {/* Icon for Innovation */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6 18H4a2 2 0 01-2-2V6a2 2 0 012-2h2.553a2 2 0 011.664.89l1.442 2.884a2 2 0 001.664.89h1.776a2 2 0 001.664-.89l1.442-2.884a2 2 0 011.664-.89H20a2 2 0 012 2v10a2 2 0 01-2 2h-2.553a2 2 0 01-1.664-.89l-1.442-2.884a2 2 0 00-1.664-.89H9.663a2 2 0 00-1.664.89l-1.442 2.884a2 2 0 01-1.664.89H4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Relentless Innovation</h3>
                <p className="text-gray-300">
                  The payment landscape evolves rapidly, and so do we. We are committed to continuous improvement, bringing you cutting-edge features and solutions that keep you ahead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28 lg:py-36 bg-gray-950 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Meet Our <GradientText>Leadership Team</GradientText>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[
                { name: 'Alice Johnson', title: 'CEO & Founder', img: teamMemberImages[0] },
                { name: 'Robert Davis', title: 'CTO', img: teamMemberImages[1] },
                { name: 'Maria Rodriguez', title: 'COO', img: teamMemberImages[2] },
                { name: 'Emily White', title: 'Head of Sales', img: teamMemberImages[3] },
                { name: 'Daniel Kim', title: 'Chief Product Officer', img: teamMemberImages[4] },
              ].map((member, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${700 + index * 100}ms` }} // Staggered animation delay
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={member.img}
                      alt={`${member.name}, ${member.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                    <p className="text-gray-400 font-medium">{member.title}</p>
                    <div className="flex justify-center space-x-4 mt-4">
                      {/* Social Media Links Placeholder */}
                      <Link href="#" className="text-gray-400 hover:text-[#3b82f6] transition-colors duration-200" aria-label={`${member.name}'s LinkedIn profile`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </Link>
                      <Link href="#" className="text-gray-400 hover:text-[#3b82f6] transition-colors duration-200" aria-label={`${member.name}'s Twitter profile`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.795-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.447 0-6.248 2.915-6.248 6.518 0 .51.056 1.006.168 1.48C7.172 9.074 4.195 7.42 2.193 4.711c-.553.967-.868 2.083-.868 3.27 0 2.26.96 4.252 2.433 5.421-2.247-.072-4.102-.692-5.83-1.656v.081c0 3.551 2.85 6.516 6.64 7.186-.69.191-1.417.294-2.176.294-.532 0-1.05-.052-1.555-.148.971 3.097 3.861 5.342 7.29 5.348-2.846 2.238-6.417 3.585-10.3 3.585-.667 0-1.32-.041-1.956-.115 3.653 2.348 7.942 3.725 12.585 3.725 15.118 0 23.449-12.527 23.449-23.385 0-.356-.008-.705-.02-1.058z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hiring CTA Section */}
        <section className="py-20 md:py-28 lg:py-36 bg-gradient-to-br from-[#050508] via-gray-950 to-[#050508] text-center px-6">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Join the <GradientText>PaySurity Team</GradientText>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Are you passionate about payments, innovation, and empowering businesses to succeed? We&apos;re building a diverse team of talented individuals dedicated to shaping the future of commerce. Explore opportunities to make an impact.
            </p>
            <Link href="/careers" className="inline-block px-8 py-4 rounded-full text-xl font-semibold bg-gradient-to-r from-[#10b981] to-[#10b981] text-white hover:from-[#0e9f6e] hover:to-[#0e9f6e] transition-all duration-300 shadow-lg transform hover:scale-105">
              View Open Positions
            </Link>
          </div>
        </section>
      </main>

      {/* Footer (Simplified for this page component, would typically be in a global layout) */}
      <footer className="bg-[#050508] border-t border-gray-800 py-12 px-6 md:px-12 lg:px-24 text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 text-3xl font-bold mb-4" aria-label="PaySurity Home">
              <GradientText>PaySurity</GradientText>
            </Link>
            <p className="mb-4">
              The Complete Payment & Business Platform
            </p>
            <p>&copy; {new Date().getFullYear()} PaySurity. All rights reserved.</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition-colors duration-200">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors duration-200">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="md:col-span-1 lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-4">Connect</h3>
            <p className="mb-2">Email: <a href="mailto:info@paysurity.com" className="hover:text-white transition-colors duration-200">info@paysurity.com</a></p>
            <p className="mb-4">Phone: <a href="tel:+18001234567" className="hover:text-white transition-colors duration-200">(800) 123-4567</a></p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="PaySurity on LinkedIn">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="PaySurity on Twitter">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.795-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.447 0-6.248 2.915-6.248 6.518 0 .51.056 1.006.168 1.48C7.172 9.074 4.195 7.42 2.193 4.711c-.553.967-.868 2.083-.868 3.27 0 2.26.96 4.252 2.433 5.421-2.247-.072-4.102-.692-5.83-1.656v.081c0 3.551 2.85 6.516 6.64 7.186-.69.191-1.417.294-2.176.294-.532 0-1.05-.052-1.555-.148.971 3.097 3.861 5.342 7.29 5.348-2.846 2.238-6.417 3.585-10.3 3.585-.667 0-1.32-.041-1.956-.115 3.653 2.348 7.942 3.725 12.585 3.725 15.118 0 23.449-12.527 23.449-23.385 0-.356-.008-.705-.02-1.058z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}