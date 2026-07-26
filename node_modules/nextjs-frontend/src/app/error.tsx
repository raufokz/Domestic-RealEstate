'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the technical detail to developers via the console only —
    // never render raw error messages or stack traces to end users.
    console.error(error);
  }, [error]);

  return (
    <main className="bg-[#0A2647] min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">
          System Error
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
          Something Went Wrong
        </h1>
        <p className="font-body text-white/70 text-lg mb-4">
          An unexpected error occurred. Our team has been notified and is working to resolve it.
          Please try again in a moment.
        </p>
        {error.digest && (
          <p className="font-body text-white/40 text-sm mb-8">
            Reference ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-block bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block border border-white/30 text-white font-heading font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Return Home
          </Link>
          <Link
            href="/contact"
            className="inline-block border border-white/30 text-white font-heading font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
