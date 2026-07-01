"use client";

import { useEffect, useState } from "react";
import { IconArrow, IconHelp } from "../icons";

/* ── GoHighLevel Integration Card ───────────────────────────── */
interface GhlStatus {
  configured: boolean;
  bgr: boolean;
  bcf: boolean;
  group: boolean;
}

export function IntegrationCard() {
  const [ghl, setGhl]       = useState<GhlStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => { setGhl(d.ghl ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const connected = ghl?.configured ?? false;

  return (
    <div className="card p-5">
      <h3 className="text-[15px] font-semibold text-ink">GoHighLevel Integration</h3>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-gold-bright to-gold text-[#0a0a0c] text-xs font-bold">
            ↑↑
          </span>
          <span className="text-[15px] font-semibold text-ink">HighLevel</span>
        </div>

        {loading ? (
          <span className="chip bg-line text-faint">Checking…</span>
        ) : connected ? (
          <span className="chip bg-pos/12 text-pos flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pos pulse-soft" /> Connected
          </span>
        ) : (
          <span className="chip bg-warn/12 text-warn">Not connected</span>
        )}
      </div>

      {connected ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <LocationPill label="BGR" ok={ghl?.bgr ?? false} />
            <LocationPill label="BCF" ok={ghl?.bcf ?? false} />
            <LocationPill label="Group" ok={ghl?.group ?? false} optional />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Leads, contacts, pipelines and appointments synced live every 5 min.
          </p>
          <a
            href="https://app.gohighlevel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-4 w-full justify-center"
          >
            Open GoHighLevel <IconArrow width={15} height={15} />
          </a>
        </>
      ) : (
        <>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
            Connect GoHighLevel to see live KPIs, activity and pipeline data.
          </p>
          <a href="/settings" className="btn-gold mt-4 w-full justify-center">
            Connect now <IconArrow width={15} height={15} />
          </a>
        </>
      )}
    </div>
  );
}

function LocationPill({ label, ok, optional }: { label: string; ok: boolean; optional?: boolean }) {
  return (
    <div className={`rounded-lg px-2.5 py-1.5 text-center border ${ok ? "border-pos/20 bg-pos/8" : "border-line bg-surface-2/40"}`}>
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className={`text-[10px] mt-0.5 ${ok ? "text-pos" : optional ? "text-faint" : "text-warn"}`}>
        {ok ? "Active" : optional ? "—" : "Missing"}
      </p>
    </div>
  );
}

/* ── Help Card ──────────────────────────────────────────────── */
export function HelpCard({ onHelp }: { onHelp?: () => void }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 text-gold/10">
        <IconHelp width={120} height={120} />
      </div>
      <h3 className="text-[15px] font-semibold text-ink relative">Need Help?</h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted relative max-w-[230px]">
        Keyboard shortcuts, module guides, and GHL setup — all in one place.
      </p>
      <div className="mt-4 flex flex-col gap-2 relative">
        <button onClick={onHelp} className="btn-gold w-full justify-center">
          Help & Shortcuts <IconArrow width={15} height={15} />
        </button>
        <a
          href="mailto:info@bespokegardenroomsballycastle.co.uk"
          className="btn-ghost w-full justify-center text-[12.5px]"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
