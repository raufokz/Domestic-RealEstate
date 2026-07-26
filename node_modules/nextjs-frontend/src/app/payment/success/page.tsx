import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Successful | Domestic Real Estate',
  description: 'Your payment has been processed successfully. Thank you for your purchase.',
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Payment Successful!</h1>
        <p className="font-body text-gray-600 mb-8">
          Thank you for your purchase. Your payment has been processed and a confirmation email has been sent to your inbox.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
          <h2 className="font-heading text-lg font-bold text-[#0A2647] mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="font-body text-sm text-gray-500">Order ID</span>
              <span className="font-heading text-sm font-semibold text-[#0A2647]">#ORD-2026-001</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="font-body text-sm text-gray-500">Item</span>
              <span className="font-heading text-sm font-semibold text-[#0A2647]">Premium Listing</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="font-body text-sm text-gray-500">Amount</span>
              <span className="font-heading text-sm font-semibold text-[#0A2647]">$299.00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-body text-sm text-gray-500">Status</span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">Completed</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/buyer/dashboard" className="flex-1 bg-[#0A2647] text-white font-heading font-semibold py-3.5 rounded-xl hover:bg-[#0A2647]/90 transition-colors text-center">
            Go to Dashboard
          </Link>
          <Link href="/properties" className="flex-1 border border-gray-300 text-[#0A2647] font-heading font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-center">
            Continue Browsing
          </Link>
        </div>
      </div>
    </main>
  );
}
