"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { BusinessId } from "@/lib/data";
import { navItems } from "@/lib/data";
import { Icon } from "./Brand";
import { IconSearch, IconArrow } from "./icons";

interface ContactResult {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface SearchGroup {
  label: string;
  items: SearchItem[];
}

interface SearchItem {
  id: string;
  label: string;
  sub?: string;
  icon?: string;
  action: () => void;
}

const QUICK_ACTIONS: Omit<SearchItem, "action">[] = [
  { id: "q-dashboard", label: "Go to Dashboard", icon: "dashboard" },
  { id: "q-sales", label: "Open Sales Tracker", icon: "sales" },
  { id: "q-client", label: "Open Client Portal", icon: "client" },
  { id: "q-staff", label: "Open Staff Portal", icon: "staff" },
  { id: "q-settings", label: "Settings", icon: "settings" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
  businessId: BusinessId;
}

export function CommandPalette({ open, onClose, onNavigate, businessId }: Props) {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setContacts([]);
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // GHL contact search (debounced)
  const searchContacts = useCallback(
    async (q: string) => {
      if (q.length < 2) { setContacts([]); return; }
      setSearching(true);
      try {
        const res = await fetch(`/api/ghl/search?q=${encodeURIComponent(q)}&business=${businessId}`);
        const json = await res.json();
        if (json.ok) setContacts(json.contacts ?? []);
      } catch {}
      finally { setSearching(false); }
    },
    [businessId]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchContacts(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchContacts]);

  // Close on Escape / backdrop click
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? onClose() : undefined;
        if (!open) document.dispatchEvent(new CustomEvent("nxps:openSearch"));
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Build groups
  const moduleItems: SearchItem[] = navItems
    .filter((n) => !query || n.label.toLowerCase().includes(query.toLowerCase()))
    .map((n) => ({
      id: `nav-${n.key}`,
      label: n.label,
      icon: n.icon,
      action: () => { onNavigate(n.key); onClose(); },
    }));

  const contactItems: SearchItem[] = contacts.map((c) => ({
    id: `contact-${c.id}`,
    label: c.name,
    sub: c.email || c.phone,
    action: () => { onClose(); },
  }));

  const quickItems: SearchItem[] = !query
    ? QUICK_ACTIONS.map((a) => ({
        ...a,
        action: () => {
          const key = a.id.replace("q-", "");
          if (key === "settings") { window.location.href = "/settings"; }
          else { onNavigate(key); }
          onClose();
        },
      }))
    : [];

  const groups: SearchGroup[] = [
    ...(quickItems.length ? [{ label: "Quick actions", items: quickItems }] : []),
    ...(contactItems.length ? [{ label: "Contacts (GHL)", items: contactItems }] : []),
    ...(moduleItems.length ? [{ label: "Navigate", items: moduleItems }] : []),
  ];

  const allItems = groups.flatMap((g) => g.items);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && allItems[cursor]) { allItems[cursor].action(); }
  };

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[600px] rise">
        <div className="card overflow-hidden shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
            {searching ? (
              <span className="w-4 h-4 rounded-full border-2 border-line border-t-gold animate-spin shrink-0" />
            ) : (
              <IconSearch width={17} height={17} className="text-muted shrink-0" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search modules, contacts, settings…"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-faint outline-none"
            />
            <kbd className="hidden sm:inline text-[11px] text-faint border border-line px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto py-2">
            {groups.length === 0 && query ? (
              <p className="px-4 py-8 text-center text-[13px] text-muted">
                No results for "{query}"
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-faint">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const idx = globalIdx++;
                    const active = cursor === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setCursor(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${active ? "bg-white/[0.06]" : ""}`}
                      >
                        {item.icon && (
                          <span className={`shrink-0 ${active ? "text-gold" : "text-muted"}`}>
                            <Icon name={item.icon} width={17} height={17} />
                          </span>
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13.5px] text-ink-soft truncate">{item.label}</span>
                          {item.sub && (
                            <span className="block text-[11.5px] text-faint truncate">{item.sub}</span>
                          )}
                        </span>
                        {active && <IconArrow width={14} height={14} className="text-gold shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-line px-4 py-2 flex items-center gap-4 text-[11px] text-faint">
            <span><kbd className="border border-line px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="border border-line px-1 rounded">↵</kbd> select</span>
            <span><kbd className="border border-line px-1 rounded">⌘K</kbd> toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
