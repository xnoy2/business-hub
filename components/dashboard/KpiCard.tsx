import type { Kpi } from "@/lib/data";
import { Icon } from "../Brand";
import { IconArrow } from "../icons";

interface Props {
  kpi: Kpi;
  index: number;
  liveValue?: string;        // real value from GHL when configured
  liveDelta?: string;        // real delta e.g. "+32%"
  liveTrend?: "up" | "down";
  loading?: boolean;         // skeleton while fetching
  demo?: boolean;            // no GHL configured — showing mock values
}

export function KpiCard({ kpi, index, liveValue, liveDelta, liveTrend, loading, demo }: Props) {
  const isTask = kpi.icon === "tasks";
  const value = liveValue ?? kpi.value;
  const delta = liveDelta ?? kpi.delta;
  const trend = liveTrend ?? kpi.trend;

  if (loading) {
    return (
      <div className="card p-5 rise" style={{ animationDelay: `${index * 60}ms` }}>
        <div className="flex items-start justify-between">
          <div className="h-3 w-20 rounded bg-line animate-pulse" />
          <div className="h-4 w-4 rounded bg-line animate-pulse" />
        </div>
        <div className="mt-4 h-8 w-28 rounded bg-line animate-pulse" />
        <div className="mt-3 h-3 w-32 rounded bg-line animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="card card-hover p-5 rise relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {demo && (
        <span className="absolute top-2.5 right-2.5 chip bg-warn/12 text-warn text-[9px] tracking-wider">
          DEMO
        </span>
      )}

      <div className="flex items-start justify-between">
        <span className="text-sm text-muted">{kpi.label}</span>
        {!demo && (
          <span className="text-gold/80">
            <Icon name={kpi.icon} width={18} height={18} />
          </span>
        )}
      </div>

      <div className="mt-3 text-[28px] font-semibold tracking-tight text-ink leading-none">
        {value}
      </div>

      {isTask ? (
        <button className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold-bright hover:gap-2.5 transition-all">
          {delta} <IconArrow width={15} height={15} />
        </button>
      ) : (
        <div className="mt-2 flex items-center gap-1.5 text-sm flex-wrap">
          {delta && delta !== "—" && (
            <span className="text-pos">
              {trend === "up" ? "↑" : "↓"} {delta}
            </span>
          )}
          {kpi.caption && (
            <span className="text-faint text-[12px]">{kpi.caption}</span>
          )}
        </div>
      )}
    </div>
  );
}
