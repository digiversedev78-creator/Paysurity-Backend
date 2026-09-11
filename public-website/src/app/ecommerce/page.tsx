import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PaySurity E-Commerce | Global Payment Gateways',
  description: 'Convert more shoppers globally. Developer-friendly APIs, hosted checkout pages, and advanced fraud prevention for E-Commerce brands.',
};

export default function EcommerceLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PaySurity E-Commerce",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Global payment gateways and developer-friendly e-commerce checkout APIs.",
            "url": "https://paysurity.com/ecommerce"
          })
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Global Payments for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">E-Commerce</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Maximize your conversion rate with our optimized hosted checkout pages, seamless API integrations, and robust fraud prevention AI. Build for scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://dashboard.paysurity.com/signup" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
