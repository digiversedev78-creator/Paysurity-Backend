'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SavingsCalculator from '../../components/SavingsCalculator';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SavingsEstimatorPage() {
  const [hasPassedForm, setHasPassedForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Merchant Savings Estimator | PaySurity 0% Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Instantly calculate your credit card processing savings using the PaySurity 0% markup processing estimator.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Instantly calculate your credit card processing savings using the PaySurity 0% markup processing estimator.';
      document.head.appendChild(meta);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('All fields are required.');
      return;
    }
    
    // Check rudimentary security (basic email pattern)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await fetch(`${API_BASE}/api/merchant-onboarding/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          intent: 'Savings Calculation',
          source: 'SavingsEstimator'
        })
      });
      setHasPassedForm(true);
    } catch (err) {
      console.error('Failed to secure lead data in DB:', err);
      // Fail open so marketing still shows the calculator even if DB drops
      setHasPassedForm(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen relative z-10 flex flex-col items-center justify-center">
      {/* Background styling for consistency */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#050508] -z-10" />

      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] mb-4">
            Merchant Savings Estimator
          </h1>
          <p className="text-lg text-gray-400">
            Discover exactly how much you can save every month with PaySurity's 0% markup processing.
          </p>
        </div>

        {!hasPassedForm ? (
          <div className="max-w-md mx-auto bg-[#1e293b]/40 backdrop-blur-md border border-[#3b82f6]/20 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Enter your details to calculate</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  placeholder="Appleseed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  placeholder="john@enterprise.com"
                />
              </div>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center h-12"
              >
                {loading ? 'Securing data...' : 'Launch Estimator →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="animation-fade-in flex flex-col items-center">
            <SavingsCalculator />
            
            <div className="mt-16 text-center p-8 bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to start saving?</h3>
              <p className="text-gray-300 mb-6">Create your completely free merchant portal account today and experience the difference.</p>
              <Link 
                href="http://localhost:4001/signup" 
                className="inline-block bg-[#10b981] hover:bg-[#0d9d6e] text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animation-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
