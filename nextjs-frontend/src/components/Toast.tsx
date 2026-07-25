"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import Link from "next/link";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  /** Optional “how to fix” line shown under the message */
  fix?: string | null;
  /** In-app path for fixing the issue (e.g. /admin/email-settings) */
  actionUrl?: string | null;
  actionLabel?: string | null;
  /** Inline retry handler. Rendered as a button; the toast closes after it fires. */
  onRetry?: (() => void | Promise<void>) | null;
  retryLabel?: string | null;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "message" | "type">> {
  id: number;
  title?: string;
  fix?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  onRetry?: (() => void | Promise<void>) | null;
  retryLabel?: string | null;
  duration: number;
  /** Identity used to collapse repeat toasts instead of stacking duplicates. */
  dedupeKey: string;
  /** How many times this same toast has fired while still on screen. */
  count: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  toast: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  warning: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  info: (message: string) => void;
  /** Parse any thrown API/error and show a branded, plain-language toast */
  notifyError: (
    err: unknown,
    fallback?: string,
    onRetry?: () => void | Promise<void>
  ) => void;
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {},
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  notifyError: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_STYLES: Record<
  ToastType,
  { bar: string; iconBg: string; icon: string; title: string }
> = {
  success: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-700",
    icon: "✓",
    title: "Success",
  },
  error: {
    bar: "bg-red-600",
    iconBg: "bg-red-50 text-red-700",
    icon: "!",
    title: "Something needs attention",
  },
  warning: {
    bar: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-800",
    icon: "⚠",
    title: "Please note",
  },
  info: {
    bar: "bg-gold",
    iconBg: "bg-gold-50 text-navy",
    icon: "i",
    title: "Domestic Real Estate",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const type = options.type ?? "info";
    const dedupeKey = `${type}|${options.title ?? ""}|${options.message}`;

    setToasts((prev) => {
      // Collapse a repeat of an on-screen toast into a counter rather than
      // stacking identical cards (spec: "avoid duplicate repeated toasts").
      const existing = prev.find((t) => t.dedupeKey === dedupeKey);
      if (existing) {
        return prev.map((t) =>
          t.dedupeKey === dedupeKey
            ? { ...t, count: t.count + 1, id: Date.now() + Math.floor(Math.random() * 1000) }
            : t
        );
      }

      const item: ToastItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        message: options.message,
        type,
        title: options.title,
        fix: options.fix ?? null,
        actionUrl: options.actionUrl ?? null,
        actionLabel: options.actionLabel ?? (options.actionUrl ? "Fix this" : null),
        onRetry: options.onRetry ?? null,
        retryLabel: options.retryLabel ?? "Retry",
        duration: options.duration ?? (type === "error" ? 9000 : 5500),
        dedupeKey,
        count: 1,
      };
      return [...prev.slice(-4), item];
    });
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      toast({ message, type });
    },
    [toast]
  );

  const success = useCallback(
    (message: string, title?: string) => toast({ message, type: "success", title }),
    [toast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) =>
      toast({ ...options, message, type: "error" }),
    [toast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) =>
      toast({ ...options, message, type: "warning" }),
    [toast]
  );

  const info = useCallback(
    (message: string) => toast({ message, type: "info" }),
    [toast]
  );

  const notifyError = useCallback(
    (
      err: unknown,
      fallback = "Something went wrong. Please try again.",
      onRetry?: () => void | Promise<void>
    ) => {
      const parsed = parseApiError(err, fallback);
      toast({
        type: "error",
        title: parsed.title,
        message: parsed.message,
        fix: parsed.fix,
        actionUrl: parsed.actionUrl,
        actionLabel: parsed.actionLabel,
        onRetry: onRetry ?? null,
        duration: 10000,
      });
    },
    [toast]
  );

  return (
    <ToastContext.Provider
      value={{ addToast, toast, success, error, warning, info, notifyError }}
    >
      {children}
      {/*
        Top-right, not bottom-right: the chat widget is fixed bottom-6 right-6
        (z-50) and toasts sit at z-200, so anchoring here would render every
        toast on top of the chat launcher and panel.

        Two live regions because a single element cannot switch politeness
        reliably mid-announcement: errors/warnings interrupt (assertive),
        success/info wait for a pause (polite).
      */}
      <div className="fixed top-4 right-4 z-[200] flex w-[min(100vw-1.5rem,24rem)] flex-col gap-3 pointer-events-none">
        <div aria-live="assertive" aria-relevant="additions" className="contents">
          {toasts
            .filter((t) => t.type === "error" || t.type === "warning")
            .map((t) => (
              <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
            ))}
        </div>
        <div aria-live="polite" aria-relevant="additions" className="contents">
          {toasts
            .filter((t) => t.type !== "error" && t.type !== "warning")
            .map((t) => (
              <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
            ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const style = TYPE_STYLES[item.type];
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Re-runs when item.id changes, so a deduped repeat restarts the timer.
    const timer = setTimeout(onClose, item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, onClose]);

  async function handleRetry() {
    if (!item.onRetry) return;
    setRetrying(true);
    try {
      await item.onRetry();
    } finally {
      setRetrying(false);
      onClose();
    }
  }

  return (
    <div
      role="status"
      className="pointer-events-auto overflow-hidden rounded-xl border border-navy/10 bg-white shadow-premium-lg animate-[slideInRight_0.3s_ease-out]"
    >
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${style.bar}`} />
        <div className="flex flex-1 gap-3 p-3.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${style.iconBg}`}
            aria-hidden
          >
            {style.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-heading text-sm font-semibold text-navy">
                {item.title || style.title}
                {item.count > 1 ? (
                  <span
                    className="ml-2 rounded-full bg-navy/10 px-1.5 py-0.5 text-[10px] font-bold text-navy"
                    aria-label={`Occurred ${item.count} times`}
                  >
                    ×{item.count}
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-navy"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
            <p className="mt-0.5 text-sm leading-snug text-slate-700">{item.message}</p>
            {item.fix ? (
              <p className="mt-1.5 text-xs leading-snug text-slate-500">
                <span className="font-semibold text-navy">How to fix: </span>
                {item.fix}
              </p>
            ) : null}
            {(item.onRetry || item.actionUrl) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {item.onRetry ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-600 disabled:opacity-60"
                  >
                    {retrying ? "Retrying…" : item.retryLabel || "Retry"}
                  </button>
                ) : null}
                {item.actionUrl ? (
                  <Link
                    href={item.actionUrl}
                    onClick={onClose}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      item.onRetry
                        ? "border border-navy/20 text-navy hover:bg-navy/5"
                        : "bg-navy text-white hover:bg-navy-600"
                    }`}
                  >
                    {item.actionLabel || "Fix this"} →
                  </Link>
                ) : null}
              </div>
            )}
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-gold-700">
              Domestic Real Estate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared parser — also exported for non-React usage */
export function parseApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): {
  title: string;
  message: string;
  fix?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
} {
  if (!err) {
    return { title: "Error", message: fallback };
  }

  if (typeof err === "string") {
    return { title: "Error", message: err };
  }

  // ApiError from lib/api
  const anyErr = err as {
    name?: string;
    message?: string;
    data?: Record<string, unknown>;
    status?: number;
  };

  const data = (anyErr.data && typeof anyErr.data === "object"
    ? anyErr.data
    : null) as Record<string, unknown> | null;

  if (data) {
    const message =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      fallback;

    const feature = typeof data.feature === "string" ? data.feature : null;
    const reason = typeof data.reason === "string" ? data.reason : null;
    const fix = typeof data.fix === "string" ? data.fix : null;
    const actionUrl =
      typeof data.action_url === "string" ? data.action_url : null;
    const actionLabel =
      typeof data.action_label === "string" ? data.action_label : null;

    let title = "Something needs attention";
    if (feature) {
      title = `${feature} unavailable`;
    } else if (data.code === "validation_error") {
      title = "Check your form";
    } else if (data.code === "unauthenticated") {
      title = "Sign in required";
    } else if (reason) {
      title = "Feature not working";
    }

    // Prefer full plain-language message from API; if only reason exists, compose it
    let body = message;
    if (feature && reason && !message.toLowerCase().includes("because")) {
      body = `${feature} is not working because ${reason}.`;
    }

    return { title, message: body, fix, actionUrl, actionLabel };
  }

  if (anyErr.message && !anyErr.message.startsWith("API error")) {
    return { title: "Error", message: anyErr.message };
  }

  if (anyErr.status === 401) {
    return {
      title: "Sign in required",
      message: "Please sign in again to continue.",
      fix: "Your session may have expired.",
      actionUrl: "/admin/login",
      actionLabel: "Sign in",
    };
  }

  if (anyErr.status === 403) {
    return {
      title: "Access denied",
      message: "You do not have permission to do this.",
    };
  }

  if (anyErr.status === 404) {
    return {
      title: "Not found",
      message: "We could not find what you asked for.",
    };
  }

  return { title: "Error", message: fallback };
}
