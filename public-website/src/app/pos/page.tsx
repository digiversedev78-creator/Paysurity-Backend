import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PaySurity POS | Point of Sale for Restaurant & Retail',
  description: 'Enterprise point-of-sale systems built for speed. Cloud-synced KDS, inventory management, and offline vector clocks for zero downtime.',
};

export default function POSLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PaySurity POS",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web, Android, iOS",
            "description": "Enterprise POS systems for restaurants, grocery, and retail.",
            "url": "https://paysurity.com/pos"
          })
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Point of Sale for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">High-Volume Merchants</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Whether you run a high-traffic Restaurant, a multi-lane Grocery store, or a boutique Retail chain, our unified POS handles complex inventory, KDS routing, and offline payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Request a Demo
            </Link>
            <Link href="https://dashboard.paysurity.com/signup" className="px-8 py-4 border border-[#8b5cf6] text-[#8b5cf6] rounded-md hover:bg-[#8b5cf6] hover:text-white transition-all text-lg font-bold">
              View Hardware
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
