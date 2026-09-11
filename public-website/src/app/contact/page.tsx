'use client';
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [intent, setIntent] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    document.title = "Contact PaySurity | Secure Merchant Services Leads";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Contact PaySurity for 0% markup processing and tailored ERP software solutions.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Contact PaySurity for 0% markup processing and tailored ERP software solutions.';
      document.head.appendChild(meta);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/merchant-onboarding/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone, company, monthlyVolume, intent, notes, source: 'ContactForm'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit contact lead', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen relative z-10 flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[#050508] -z-10" />

      <div className="max-w-4xl w-full mx-auto" data-analytics-id="contact-page-container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" itemProp="name">
            Contact PaySurity
          </h1>
          <p className="text-lg text-gray-400" itemProp="description">
            Let our merchant solutions experts help optimize your business. Please provide some information so we can route you to the correct team.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#10b981]/10 border border-[#10b981]/30 p-12 rounded-2xl text-center max-w-2xl mx-auto animation-fade-in shadow-[0_0_30px_rgba(16,185,129,0.2)]" data-analytics-id="contact-success-modal">
            <h2 className="text-3xl font-bold text-[#10b981] mb-4">Message Received!</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Thank you for reaching out. A PaySurity Merchant Executive has been immediately assigned to your inquiry and will contact you directly within 24 hours.
            </p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setCompany(''); setNotes('');
              }}
              data-analytics-id="btn-submit-another"
              className="px-6 py-2 border border-[#3b82f6] text-[#3b82f6] rounded-md hover:bg-[#3b82f6] hover:text-white transition-all"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-[#1e293b]/40 backdrop-blur-md border border-[#3b82f6]/20 p-8 md:p-12 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" data-analytics-id="contact-lead-form">
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="firstName">First Name</label>
                <input id="firstName" value={firstName} onChange={e=>setFirstName(e.target.value)} required type="text" className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" placeholder="Jane" data-analytics-id="input-first-name" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="lastName">Last Name</label>
                <input id="lastName" value={lastName} onChange={e=>setLastName(e.target.value)} required type="text" className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" placeholder="Doe" data-analytics-id="input-last-name" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="email">Business Email</label>
                <input id="email" value={email} onChange={e=>setEmail(e.target.value)} required type="email" className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" placeholder="jane@company.com" data-analytics-id="input-email" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="phone">Phone Number</label>
                <input id="phone" value={phone} onChange={e=>setPhone(e.target.value)} required type="tel" className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" placeholder="(555) 123-4567" data-analytics-id="input-phone" />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Business Profile</h3>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="company">Legal Business Name</label>
                <input id="company" value={company} onChange={e=>setCompany(e.target.value)} required type="text" className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" placeholder="Grand Commerce LLC" data-analytics-id="input-company" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="volume">Monthly Processing Volume</label>
                <select id="volume" value={monthlyVolume} onChange={e=>setMonthlyVolume(e.target.value)} required className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] cursor-pointer" data-analytics-id="input-volume">
                  <option value="" disabled>Select an estimate</option>
                  <option value="Just Starting">Just Starting ($0)</option>
                  <option value="Under $10k">Under $10,000 /mo</option>
                  <option value="$10k-$50k">$10,000 - $50,000 /mo</option>
                  <option value="$50k-$250k">$50,000 - $250,000 /mo</option>
                  <option value="$250k+">Over $250,000 /mo target</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="intent">How can we help you today?</label>
                <select id="intent" value={intent} onChange={e=>setIntent(e.target.value)} required className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] cursor-pointer" data-analytics-id="input-intent">
                  <option value="" disabled>Select primary goal</option>
                  <option value="New Merchant Account">I want to open a brand new PaySurity merchant account.</option>
                  <option value="Switch Provider">I want to switch from my current processor to PaySurity (0% markup).</option>
                  <option value="Support Request">I am an existing Merchant and I need technical support.</option>
                  <option value="General Inquiry">General questions about product capabilities.</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="notes">Additional Details (Optional)</label>
                <textarea 
                  id="notes"
                  value={notes} onChange={e=>setNotes(e.target.value)}
                  rows={4} 
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6]" 
                  placeholder="Tell us specific integrations you need or POS hardware requirements..."
                  data-analytics-id="input-notes"
                ></textarea>
              </div>

              <div className="col-span-1 md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  data-analytics-id="btn-submit-contact"
                  className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center shadow-lg"
                >
                  {loading ? 'Submitting Application...' : 'Send Inquiry securely 🚀'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .animation-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
