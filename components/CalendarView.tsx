"use client";

import { useCallback, useEffect, useState } from "react";
import type { BusinessId } from "@/lib/data";
import type { CeoAppointmentsData } from "@/lib/ceo";

interface Props {
  businessId: BusinessId;
}

interface FetchState {
  data: CeoAppointmentsData | null;
  loading: boolean;
  error: string | null;
  generatedAt: string | null;
}

const STAT_CONFIGS = [
  { key: "upcoming",  label: "Upcoming",   colour: "text-gold-bright", border: "border-gold/30",  icon: "📅" },
  { key: "showed",    label: "Showed",     colour: "text-pos",         border: "border-pos/20",   icon: "✅" },
  { key: "no_show",   label: "No Shows",   colour: "text-neg",         border: "border-neg/20",   icon: "❌" },
  { key: "total",     label: "Total",      colour: "text-ink",         border: "border-line",     icon: "📊" },
] as const;

function fmtGenerated(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export function CalendarView({ businessId }: Props) {
  const [state, setState] = useState<FetchState>({
    data: null, loading: true, error: null, generatedAt: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/ceo/appointments?business=${businessId}`);
      const json = await res.json();
      if (json.ok && json.data) {
        setState({
          data: json.data as CeoAppointmentsData,
          loading: false,
          error: null,
          generatedAt: json.meta?.generated_at ?? null,
        });
      } else {
        setState({ data: null, loading: false, error: json.error ?? "No data returned", generatedAt: null });
      }
    } catch (e) {
      setState({ data: null, loading: false, error: e instanceof Error ? e.message : "Network error", generatedAt: null });
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  if (state.loading) return <CalendarSkeleton />;

  if (state.error) {
    return (
      <div className="rise">
        <PageHeader title="Calendar" />
        <div className="card px-5 py-10 text-center mt-6">
          <p className="text-neg text-sm">{state.error}</p>
          <button onClick={load} className="btn-gold mt-4">Retry</button>
        </div>
      </div>
    );
  }

  const d = state.data!;
  const showRate = d.total > 0 ? Math.round((d.showed / d.total) * 100) : 0;
  const noShowRate = d.total > 0 ? Math.round((d.no_show / d.total) * 100) : 0;

  return (
    <div className="rise">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink">Calendar</h1>
          <p className="text-sm text-muted mt-0.5">
            Appointment summary from GoHighLevel
            {state.generatedAt && (
              <span className="text-faint"> · refreshed {fmtGenerated(state.generatedAt)}</span>
            )}
          </p>
        </div>
        <button onClick={load} className="btn-ghost text-xs">Refresh</button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CONFIGS.map(({ key, label, colour, border, icon }) => (
          <div key={key} className={`card p-5 border ${border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">{label}</span>
              <span className="text-lg">{icon}</span>
            </div>
            <div className={`text-[32px] font-semibold tracking-tight leading-none ${colour}`}>
              {d[key as keyof CeoAppointmentsData] as number}
            </div>
          </div>
        ))}
      </div>

      {/* Show rate bar */}
      {d.total > 0 && (
        <div className="card px-5 py-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-ink-soft">Appointment outcome breakdown</p>
            <p className="text-xs text-muted">{d.total} total appointments</p>
          </div>

          {/* Stacked bar */}
          <div className="flex rounded-full overflow-hidden h-3 bg-surface-2">
            {showRate > 0 && (
              <div
                className="bg-pos transition-all"
                style={{ width: `${showRate}%` }}
                title={`Showed: ${showRate}%`}
              />
            )}
            {noShowRate > 0 && (
              <div
                className="bg-neg transition-all"
                style={{ width: `${noShowRate}%` }}
                title={`No show: ${noShowRate}%`}
              />
            )}
          </div>

          <div className="flex items-center gap-5 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pos" /> Showed {showRate}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neg" /> No show {noShowRate}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gold" /> Upcoming {d.upcoming}
            </span>
          </div>
        </div>
      )}

      {/* Scope warning */}
      {d.scope_missing && (
        <div className="card px-4 py-3.5 mt-4 border-warn/30">
          <p className="text-xs text-warn">
            Some GHL calendar scopes are missing — appointment data may be incomplete.
          </p>
        </div>
      )}

      {/* Quick tips */}
      <div className="card px-5 py-5 mt-6">
        <p className="text-[12px] uppercase tracking-wider text-muted mb-3">View appointments</p>
        <p className="text-[13px] text-ink-soft leading-relaxed">
          Individual appointment details are managed in GoHighLevel. Use the{" "}
          <button
            onClick={() => window.location.hash = "sales"}
            className="text-gold-bright hover:underline"
          >
            Sales Tracker
          </button>{" "}
          or open GHL directly to view, reschedule or cancel individual bookings.
        </p>
      </div>
    </div>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h1>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="rise space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-36 rounded bg-line animate-pulse" />
        <div className="h-4 w-56 rounded bg-line animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-3.5 w-20 rounded bg-line animate-pulse" />
            <div className="h-9 w-14 rounded bg-line animate-pulse" />
          </div>
        ))}
      </div>
      <div className="card p-5 space-y-3">
        <div className="h-3 w-48 rounded bg-line animate-pulse" />
        <div className="h-3 rounded bg-line animate-pulse" />
      </div>
    </div>
  );
}
