import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PayDental | Dental Practice Management & Payments',
  description: 'Modernize your dental clinic with PayDental. Seamless insurance processing, patient portals, and secure checkouts.',
};

export default function DentalLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      {/* JSON-LD Structured Data for Dental SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PayDental",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "Modern dental practice management, insurance processing, and secure patient checkouts.",
            "url": "https://paysurity.com/dental"
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            The Modern OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">Dental Clinics</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            PayDental consolidates patient financing, insurance claims processing, and tap-to-pay checkouts into one seamless front-desk experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Speak to a Specialist
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
