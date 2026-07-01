"use client";

import { useEffect, useRef } from "react";
import { IconArrow } from "./icons";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Open search / command palette" },
  { keys: ["Escape"], desc: "Close any panel or modal" },
  { keys: ["1-7"], desc: "Jump to module (press number key)" },
];

const MODULES = [
  { name: "Client Portal", status: "live" },
  { name: "Staff Portal", status: "live" },
  { name: "Sales Tracker", status: "live" },
  { name: "Garden Room Configurator", status: "live" },
  { name: "BCF Configurator", status: "live" },
  { name: "CEO Dashboard", status: "live" },
  { name: "Marketing AI", status: "live" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelpPanel({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-[400px] z-50 bg-elevated border-l border-line shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[15px] font-semibold text-ink">Help & Support</h2>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg border border-line text-muted hover:text-ink transition">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Getting started */}
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-3">Getting started</h3>
            <div className="card px-4 py-4 space-y-3">
              <Step n={1} text="Log in once — your Hub session covers all modules." />
              <Step n={2} text="Switch businesses using the top-centre dropdown." />
              <Step n={3} text='Click any module card or sidebar item, then "Open in new tab" if the embed asks you to sign in.' />
              <Step n={4} text="Connect GHL in Settings to enable live KPI data." />
            </div>
          </section>

          {/* Keyboard shortcuts */}
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-3">Keyboard shortcuts</h3>
            <div className="card divide-y divide-line">
              {SHORTCUTS.map((s) => (
                <div key={s.desc} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-ink-soft">{s.desc}</span>
                  <div className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="text-[11px] text-muted border border-line px-1.5 py-0.5 rounded">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Module status */}
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-3">Module status</h3>
            <div className="card divide-y divide-line">
              {MODULES.map((m) => (
                <div key={m.name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-ink-soft">{m.name}</span>
                  <span className="chip bg-pos/12 text-pos">
                    <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Live
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] text-ink-soft">GHL KPI data</span>
                <span className="chip bg-warn/12 text-warn">
                  <span className="w-1.5 h-1.5 rounded-full bg-warn" /> Needs API key
                </span>
              </div>
            </div>
          </section>

          {/* CSRF note */}
          <section>
            <div className="card px-4 py-4 border-warn/30">
              <p className="text-[12px] font-semibold text-warn mb-1">&#x1F510; Login inside embed showing 419?</p>
              <p className="text-[12px] text-muted leading-relaxed">
                This is expected for Laravel/PHP-based portals. Click{" "}
                <strong className="text-ink-soft">&quot;Open in new tab&quot;</strong> in the toolbar, sign in there,
                then return &mdash; the Hub will load you directly into your session.
              </p>
            </div>
          </section>

          {/* Support */}
          <section>
            <h3 className="text-[12px] uppercase tracking-wider text-muted mb-3">Support</h3>
            <a
              href="mailto:info@bespokegardenroomsballycastle.co.uk"
              className="btn-gold w-full justify-center"
            >
              Contact support <IconArrow width={15} height={15} />
            </a>
          </section>
        </div>
      </div>
    </>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[11px] font-bold shrink-0 mt-0.5">
        {n}
      </span>
      <span className="text-[13px] text-ink-soft leading-relaxed">{text}</span>
    </div>
  );
}
