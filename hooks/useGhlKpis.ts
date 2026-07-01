"use client";

import { useCallback, useEffect, useState } from "react";
import type { BusinessId } from "@/lib/data";
import type { KpiPayload } from "@/app/api/ghl/kpis/route";

interface UseGhlKpisResult {
  data: KpiPayload | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  lastUpdated: Date | null;
  refetch: () => void;
}

export function useGhlKpis(businessId: BusinessId): UseGhlKpisResult {
  const [data, setData] = useState<KpiPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ghl/kpis?business=${businessId}`);
      const json = await res.json();
      if (json.ok) {
        setData(json as KpiPayload);
        setConfigured(true);
        setLastUpdated(new Date());
      } else {
        setConfigured(json.configured ?? false);
        setError(json.error ?? "GHL API error");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, configured, lastUpdated, refetch: load };
}

// ── Value formatters used by the dashboard ──────────────────────
export function fmtGBP(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `£${Math.round(n / 1_000).toLocaleString("en-GB")}K`;
  return `£${n.toLocaleString("en-GB")}`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-GB");
}
