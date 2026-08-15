export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Generic failed-request state. Always the honest alternative to rendering
 * fabricated/fallback data when an API call fails — see
 * [[working-style-audit-not-rebuild]]: never silently mock on catch.
 */
export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-red-200 bg-red-50/60 px-6 py-14 ${className}`}
    >
      <span className="text-4xl mb-3" aria-hidden="true">
        ⚠️
      </span>
      <h3 className="font-heading text-base font-bold text-[#0A2647] mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0A2647] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3366] transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
