"use client";

import { useEffect, useState } from "react";

function getRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 ? diff : 0;
}

function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MarketplaceCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire?: () => void;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));

  useEffect(() => {
    setRemaining(getRemaining(expiresAt));
    const id = setInterval(() => setRemaining(getRemaining(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (remaining === 0 && onExpire) onExpire();
  }, [remaining, onExpire]);

  return <span>{format(remaining)}</span>;
}
