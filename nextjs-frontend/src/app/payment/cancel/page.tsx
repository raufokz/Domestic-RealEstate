import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Cancelled | Domestic Real Estate',
  description: 'Your payment was cancelled. No charges were made to your account.',
};

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Payment Cancelled</h1>
        <p className="font-body text-gray-600 mb-8">
          Your payment was not processed. No charges have been made to your account. You can try again or contact our support team for help.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/properties" className="flex-1 bg-[#0A2647] text-white font-heading font-semibold py-3.5 rounded-xl hover:bg-[#0A2647]/90 transition-colors text-center">
            Try Again
          </Link>
          <Link href="/" className="flex-1 border border-gray-300 text-[#0A2647] font-heading font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-center">
            Go Back
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <p className="font-body text-sm text-gray-500 mb-2">Need help?</p>
          <Link href="/contact" className="font-heading text-sm font-semibold text-[#C9A227] hover:underline">Contact our support team</Link>
        </div>
      </div>
    </main>
  );
}
