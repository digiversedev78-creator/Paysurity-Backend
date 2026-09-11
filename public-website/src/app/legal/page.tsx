import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PayFidavit | Legal Practice Management & Trust Accounting',
  description: 'PayFidavit provides secure trust accounting, billing, and practice management exclusively for Law Firms.',
};

export default function LegalLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      {/* JSON-LD Structured Data for Legal SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PayFidavit",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "Secure trust accounting, billing, and practice management software exclusively for Law Firms.",
            "url": "https://paysurity.com/legal"
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Trust Accounting, Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">Law Firms</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            PayFidavit ensures 100% compliant trust accounting, effortless hourly billing, and secure client payment portals—so you can focus on winning cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
