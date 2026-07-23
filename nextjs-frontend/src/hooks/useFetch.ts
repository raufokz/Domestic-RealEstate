"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api";

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useFetch<T>(path: string, enabled: boolean = true): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGet<T>(path);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [path, fetchKey, enabled]);

  return { data, error, loading, refetch };
}
