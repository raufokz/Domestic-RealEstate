import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Real Estate Assistant | 24/7 Property Search & Market Analysis',
  description: 'Your 24/7 AI Real Estate Assistant. Get instant property searches, market analysis, neighborhood insights, and mortgage help powered by artificial intelligence.',
};

const FEATURES = [
  { title: 'Property Search', description: 'Find your perfect home with AI-powered search that understands your preferences, lifestyle, and budget. Get personalized recommendations in seconds.', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
  { title: 'Market Analysis', description: 'Get real-time market insights, price predictions, and investment analysis. Our AI analyzes thousands of data points to keep you ahead of the market.', icon: 'M3 3v18h18M9 17V9m4 8V5m4 12v-4' },
  { title: 'Neighborhood Info', description: 'Discover everything about neighborhoods — schools, crime rates, demographics, walkability scores, and local amenities, all powered by AI.', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z' },
  { title: 'Mortgage Help', description: 'Calculate payments, compare rates, and get pre-qualified instantly. Our AI guides you through the entire mortgage process with personalized advice.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const STEPS = [
  { step: '01', title: 'Ask a Question', description: 'Type your question or request in natural language. Ask about properties, neighborhoods, market trends, or anything real estate.', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { step: '02', title: 'AI Analyzes', description: 'Our AI instantly processes your request, pulling data from MLS, public records, and market databases to compile relevant information.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { step: '03', title: 'Get Insights', description: 'Receive comprehensive, easy-to-understand answers with data, charts, and actionable recommendations tailored to your needs.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const CHAT_MESSAGES = [
  { role: 'user', text: 'What are the best neighborhoods in LA for a young family?' },
  { role: 'assistant', text: 'Great question! Based on school ratings, safety data, family-friendly amenities, and affordability, here are my top recommendations:\n\n1. **Pasadena** — Excellent schools (9/10), low crime, beautiful parks\n2. **Sherman Oaks** — Great public schools, family community, close to nature\n3. **Torrance** — Affordable, diverse, strong school district\n4. **Glendale** — Safe, good schools, family-oriented activities\n\nWould you like detailed information about any of these neighborhoods?' },
];

export default function AIAssistantPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-[#0A2647] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#C9A227] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#C9A227] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">AI-Powered Real Estate</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Your 24/7 AI Real Estate Assistant</h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Get instant answers to all your real estate questions. Powered by advanced AI, available anytime, anywhere.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            Try It Free
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Powerful AI Features</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Everything you need to make informed real estate decisions, powered by artificial intelligence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center">
                <div className="w-14 h-14 bg-[#0A2647] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-[#C9A227]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-[#0A2647] text-lg mb-3">{f.title}</h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Try the AI Assistant</h2>
            <p className="font-body text-gray-600">Experience the power of AI-driven real estate assistance.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#0A2647] px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C9A227] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0A2647]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0" /></svg>
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-white">AI Assistant</p>
                <p className="font-body text-xs text-white/60">Online · Ready to help</p>
              </div>
            </div>
            <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              <div className="flex justify-center mb-4">
                <span className="bg-gray-100 text-gray-500 font-body text-xs px-3 py-1 rounded-full">Today</span>
              </div>
              {CHAT_MESSAGES.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#0A2647] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <p className="font-body text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask about properties, neighborhoods, market trends..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 font-body text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                  readOnly
                />
                <button className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center hover:bg-[#C9A227]/90 transition-colors">
                  <svg className="w-4 h-4 text-[#0A2647]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">How It Works</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Get started in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#C9A227]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="font-heading text-2xl font-bold text-[#C9A227]">{s.step}</span>
                </div>
                <h3 className="font-heading font-bold text-[#0A2647] text-lg mb-3">{s.title}</h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0A2647]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience AI Real Estate?</h2>
          <p className="font-body text-white/70 text-lg mb-8 max-w-xl mx-auto">Join our network of users who have found their dream homes with the help of our AI assistant.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-xl hover:bg-[#C9A227]/90 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/contact" className="border border-white/30 text-white font-heading font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
