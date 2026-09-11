import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LumbarPay | Chiropractic Practice Management & Payments',
  description: 'Streamline your chiropractic clinic with LumbarPay. Integrated payment processing, HIPAA-compliant patient management, and seamless checkouts.',
};

export default function ChiropracticLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      {/* JSON-LD Structured Data for Chiropractic SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "LumbarPay",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "Custom",
              "priceCurrency": "USD"
            },
            "description": "Integrated payment processing and practice management for Chiropractic clinics.",
            "url": "https://paysurity.com/chiropractic"
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Built Specifically for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">Chiropractic Clinics</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            LumbarPay is the ultimate payment and practice management solution designed to streamline your front desk, guarantee HIPAA compliance, and accelerate your cash flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Request a Callback
            </Link>
            <Link href="https://dashboard.paysurity.com/signup" className="px-8 py-4 border border-[#8b5cf6] text-[#8b5cf6] rounded-md hover:bg-[#8b5cf6] hover:text-white transition-all text-lg font-bold">
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Feature Grid Placeholder */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-[#0a0a0f] p-8 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-4">HIPAA Compliant</h3>
            <p className="text-gray-400">Secure patient data and billing ledgers with enterprise-grade encryption.</p>
          </div>
          <div className="bg-[#0a0a0f] p-8 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-4">Automated Billing</h3>
            <p className="text-gray-400">Set up recurring care plans and automated invoicing with zero manual entry.</p>
          </div>
          <div className="bg-[#0a0a0f] p-8 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-4">Seamless Checkout</h3>
            <p className="text-gray-400">Integrate digital wallets and tap-to-pay for a frictionless patient exit.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
