"use client";

import { useCallback, useEffect, useState } from "react";
import type { BusinessId } from "@/lib/data";
import type { ActivityItem } from "@/app/api/ghl/activity/route";
import { IconArrow } from "../icons";

const dot: Record<ActivityItem["kind"], string> = {
  lead:     "bg-info",
  won:      "bg-pos",
  pipeline: "bg-gold",
  event:    "bg-[#c084fc]",
};

const kindLabel: Record<ActivityItem["kind"], string> = {
  lead:     "Lead",
  won:      "Won",
  pipeline: "Pipeline",
  event:    "Event",
};

interface Props {
  businessId: BusinessId;
}

export function ActivityFeed({ businessId }: Props) {
  const [items, setItems]         = useState<ActivityItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [configured, setConfigured] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/ghl/activity?business=${businessId}`);
      const json = await res.json();
      setConfigured(json.configured ?? false);
      if (json.ok && Array.isArray(json.items)) setItems(json.items);
    } catch {}
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-ink">Recent Activity</h3>
        {!loading && configured && (
          <button onClick={load} className="text-[11px] text-faint hover:text-muted transition">
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <ul className="space-y-3.5">
          {[...Array(5)].map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-line animate-pulse shrink-0" />
              <span className="flex-1 h-3 rounded bg-line animate-pulse" />
              <span className="w-10 h-3 rounded bg-line animate-pulse" />
            </li>
          ))}
        </ul>
      ) : !configured ? (
        <div className="py-4 text-center">
          <p className="text-[12.5px] text-muted">Connect GoHighLevel to see live activity.</p>
          <a href="/settings#integrations" className="text-[12px] text-gold-bright mt-1.5 inline-block hover:underline">
            Go to Settings &rarr;
          </a>
        </div>
      ) : items.length === 0 ? (
        <p className="text-[12.5px] text-muted py-4 text-center">No recent activity found.</p>
      ) : (
        <ul className="space-y-3.5">
          {items.slice(0, 8).map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot[a.kind]}`} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] text-ink-soft truncate">{a.text}</span>
                {a.sub && (
                  <span className="block text-[11px] text-faint truncate">{a.sub}</span>
                )}
              </span>
              <span className="text-[11px] text-faint whitespace-nowrap">{a.time}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && configured && items.length > 0 && (
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-gold-bright hover:gap-2.5 transition-all"
        >
          View all activity <IconArrow width={15} height={15} />
        </button>
      )}
    </div>
  );
}
