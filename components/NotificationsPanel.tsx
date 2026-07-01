"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessId } from "@/lib/data";
import type { ActivityItem } from "@/app/api/ghl/activity/route";
import { IconArrow } from "./icons";

const kindIcon: Record<ActivityItem["kind"], string> = {
  lead: "🔵",
  won: "🟢",
  pipeline: "🟡",
  event: "🟠",
};

interface Props {
  open: boolean;
  onClose: () => void;
  businessId: BusinessId;
}

export function NotificationsPanel({ open, onClose, businessId }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [configured, setConfigured] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ghl/activity?business=${businessId}`);
      const json = await res.json();
      setConfigured(json.configured ?? false);
      if (json.ok && Array.isArray(json.items)) {
        setItems(json.items);
      }
    } catch {}
    finally { setLoading(false); }
  }, [businessId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const unread = items.filter((i) => !read.has(i.id)).length;
  const markAll = () => setRead(new Set(items.map((i) => i.id)));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-[380px] z-50 bg-elevated border-l border-line shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
            {unread > 0 && (
              <p className="text-[12px] text-muted">{unread} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAll} className="text-[12px] text-gold-bright hover:underline">
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="grid place-items-center w-8 h-8 rounded-lg border border-line text-muted hover:text-ink transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!configured ? (
            <EmptyState
              icon="🔗"
              title="Connect GoHighLevel"
              body="Add your GHL API key and location IDs to see live notifications from your accounts."
              action={{ label: "Open Settings", href: "/settings" }}
            />
          ) : loading && items.length === 0 ? (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-2 h-2 mt-2 rounded-full bg-line shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-line rounded w-3/4" />
                    <div className="h-2.5 bg-line rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon="🔔" title="All caught up" body="No recent activity in your GHL accounts." />
          ) : (
            <ul>
              {items.map((item) => {
                const isRead = read.has(item.id);
                return (
                  <li
                    key={item.id}
                    onClick={() => setRead((s) => new Set([...s, item.id]))}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-line/50 cursor-pointer transition hover:bg-white/[0.03] ${isRead ? "opacity-60" : ""}`}
                  >
                    <span className="text-base mt-0.5 shrink-0">{kindIcon[item.kind]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-ink-soft leading-snug">{item.text}</p>
                      {item.sub && (
                        <p className="text-[11.5px] text-gold mt-0.5">{item.sub}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-faint whitespace-nowrap mt-0.5">{item.time}</span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {configured && (
          <div className="px-5 py-3 border-t border-line">
            <button onClick={load} className="btn-ghost w-full justify-center text-[12.5px]">
              Refresh <IconArrow width={14} height={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({
  icon, title, body, action,
}: {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-16 gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="text-[12.5px] text-muted leading-relaxed">{body}</p>
      {action && (
        <a href={action.href} className="btn-ghost mt-2 text-[12.5px]">
          {action.label} <IconArrow width={14} height={14} />
        </a>
      )}
    </div>
  );
}
