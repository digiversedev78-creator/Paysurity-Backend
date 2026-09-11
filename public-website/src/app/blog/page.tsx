import Link from 'next/link';

export const metadata = {
  title: 'Blog — PaySurity Insights',
  description: 'Fintech insights, merchant success stories, payment industry trends, and PaySurity product updates.',
};

const POSTS = [
  {
    category: 'Cash Discount Program',
    date: 'March 28, 2026',
    title: 'How the Cash Discount Program Saves Your Business Thousands Per Year',
    excerpt: 'Most merchants don\'t realize they\'re paying 2–4% on every single card transaction. The Cash Discount Program legally offsets this cost — here\'s exactly how the math works and what it means for your bottom line.',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    tag: 'Savings',
  },
  {
    category: 'Restaurant Technology',
    date: 'March 21, 2026',
    title: 'Kitchen Display Systems: Why Your Restaurant Still Uses Paper Tickets (And How to Stop)',
    excerpt: 'Paper tickets slow down service, cause errors, and cost you covers. Modern KDS systems integrated directly into your POS cut ticket times by 35% on average.',
    readTime: '7 min read',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tag: 'Restaurant',
  },
  {
    category: 'Retail Insights',
    date: 'March 14, 2026',
    title: 'Loyalty Programs That Actually Work: Points vs Cashback vs Tiered Rewards',
    excerpt: 'Not all loyalty programs drive repeat business. We analyzed 500+ PaySurity merchant accounts to find out which loyalty structure leads to the highest customer return rate.',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    tag: 'Loyalty',
  },
  {
    category: 'Payment Processing',
    date: 'March 7, 2026',
    title: 'Interchange Rates Explained: What Your Processor Isn\'t Telling You',
    excerpt: 'Every card transaction has a cost set by Visa/Mastercard. Your processor marks that up — sometimes dramatically. Learn to read your statement and take back control.',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    tag: 'Payments',
  },
  {
    category: 'Grocery & Convenience',
    date: 'February 28, 2026',
    title: 'EBT & SNAP Integration: How to Accept Government Benefits at Your Store',
    excerpt: 'Accepting EBT opens your store to millions of additional customers. Here\'s the complete guide to EBT/SNAP certification, equipment requirements, and PaySurity\'s built-in EBT processing.',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    tag: 'Grocery',
  },
  {
    category: 'Business Growth',
    date: 'February 20, 2026',
    title: 'Online Ordering vs Third-Party Delivery Apps: A True Cost Analysis',
    excerpt: 'GrubHub, DoorDash, and UberEats take 15–30% per order. A branded online ordering system on PaySurity costs a fraction of that — and the customer data stays yours.',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    tag: 'Online Ordering',
  },
];

const TAG_COLORS: Record<string, string> = {
  Savings: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Restaurant: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  Loyalty: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  Payments: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  Grocery: 'bg-green-500/15 text-green-400 border border-green-500/20',
  'Online Ordering': 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
            PaySurity Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
            The Merchant&apos;s Playbook
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Payment industry insights, merchant success stories, and practical guides to growing your business.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-14 rounded-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row group hover:border-blue-500/20 transition-colors">
          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
            <img
              src={POSTS[0].img}
              alt={POSTS[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-slate-900/80 to-[#050508] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${TAG_COLORS[POSTS[0].tag]}`}>{POSTS[0].tag}</span>
              <span className="text-xs text-gray-500">{POSTS[0].date} · {POSTS[0].readTime}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">{POSTS[0].title}</h2>
            <p className="text-gray-400 leading-relaxed mb-6">{POSTS[0].excerpt}</p>
            <Link href="/savings-estimator" className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm">
              Read Article + Try the Savings Calculator →
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.slice(1).map(post => (
            <article
              key={post.title}
              className="rounded-2xl overflow-hidden border border-white/5 bg-slate-900/30 hover:border-white/10 transition-all hover:-translate-y-1 duration-300 flex flex-col group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.img} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TAG_COLORS[post.tag] || 'bg-gray-800 text-gray-400'}`}>{post.tag}</span>
                  <span className="text-xs text-gray-600">{post.readTime}</span>
                </div>
                <h3 className="font-black text-white text-base leading-snug mb-3">{post.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <p className="text-xs text-gray-600 mt-4">{post.date}</p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-10 rounded-3xl border border-white/5 bg-gradient-to-b from-white/2 to-transparent">
          <h3 className="text-2xl font-black text-white mb-3">See How Much You Could Save</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Use our free Merchant Savings Calculator to see your exact savings with PaySurity&apos;s Cash Discount Program.</p>
          <Link href="/savings-estimator" className="inline-block px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Calculate My Savings →
          </Link>
        </div>

      </div>
    </div>
  );
}
