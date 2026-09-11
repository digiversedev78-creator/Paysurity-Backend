import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PaySurity Digital Wallets | Embedded Finance & P2P',
  description: 'Launch your own branded digital wallet ecosystem. Peer-to-peer transfers, loyalty points, and embedded finance for your users.',
};

export default function DigitalWalletsLandingPage() {
  return (
    <main className="min-h-screen bg-[#050508] pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PaySurity Digital Wallets",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "Embedded finance and digital wallet infrastructure for businesses.",
            "url": "https://paysurity.com/digital-wallets"
          })
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mt-12 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Embed Finance with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">Digital Wallets</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Transform your customer experience by launching a branded digital wallet. Support P2P transfers, stored value, and instant payouts via our robust API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors text-lg font-bold">
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
