'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#050508] py-16 px-4 md:px-8 border-t border-gray-800 relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div>
          <Link href="/" className="text-2xl font-bold text-white mb-4 block">PaySurity</Link>
          <p className="text-gray-400 text-sm">
            The Complete Payment & Business Platform. Powering growth for restaurants, retailers, and small businesses across the USA.
          </p>
          <div className="flex space-x-4 mt-6">
            <Link href="https://facebook.com/paysurity" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-facebook-f text-xl"></i>
            </Link>
            <Link href="https://twitter.com/paysurity" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-twitter text-xl"></i>
            </Link>
            <Link href="https://linkedin.com/company/paysurity" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-linkedin-in text-xl"></i>
            </Link>
            <Link href="https://instagram.com/paysurity" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <i className="fab fa-instagram text-xl"></i>
            </Link>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li><Link href="/restaurant" className="text-gray-400 hover:text-white transition-colors">Restaurants</Link></li>
              <li><Link href="/retail" className="text-gray-400 hover:text-white transition-colors">Retail</Link></li>
              <li><Link href="/grocery" className="text-gray-400 hover:text-white transition-colors">Grocery</Link></li>
              <li><Link href="/pos" className="text-gray-400 hover:text-white transition-colors">POS System</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">Payment Processing</Link></li>
            </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal & Support */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Legal & Support</h4>
          <ul className="space-y-3">
            <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Support Center</Link></li>
            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
            <li><Link href="/faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        PaySurity © 2026. All rights reserved.
      </div>
    </footer>
  );
}
