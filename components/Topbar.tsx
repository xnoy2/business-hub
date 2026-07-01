"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { businesses, type Business, type BusinessId } from "@/lib/data";
import { signOut, type Session } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { BusinessMark } from "./Brand";
import { IconBell, IconCheck, IconChevron, IconHelp, IconSearch } from "./icons";

export function Topbar({
  current,
  onSwitch,
  session,
  onNotifications,
  onHelp,
  onSearch,
  onProfile,
  unreadCount = 0,
}: {
  current: Business;
  onSwitch: (id: BusinessId) => void;
  session: Session;
  onNotifications?: () => void;
  onHelp?: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
  unreadCount?: number;
}) {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = session.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 glass border-b border-line">
      <div className="flex items-center gap-4 px-5 lg:px-8 h-[68px]">
        {/* Search — click opens command palette */}
        <button
          onClick={onSearch}
          className="hidden md:flex items-center gap-2.5 w-[260px] lg:w-[320px] rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-muted hover:border-line-strong hover:bg-surface-2/80 transition text-left shrink-0"
        >
          <IconSearch width={16} height={16} className="shrink-0" />
          <span className="flex-1 text-sm text-faint truncate whitespace-nowrap">Search…</span>
          <kbd className="hidden lg:inline text-[10px] border border-line px-1.5 py-0.5 rounded opacity-60 shrink-0">⌘K</kbd>
        </button>

        <div className="flex-1" />

        {/* Business switcher */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/70 pl-3 pr-2.5 py-2 hover:border-line-strong transition"
          >
            <BusinessMark kind={current.monogram} size={18} />
            <span className="text-sm font-medium text-ink max-w-[180px] truncate">
              {current.name}
            </span>
            <IconChevron
              width={16}
              height={16}
              className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[300px] rounded-2xl border border-line bg-elevated shadow-2xl overflow-hidden rise">
              <p className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-wider text-muted">
                Switch Business
              </p>
              <div className="pb-2">
                {businesses.map((b) => {
                  const selected = b.id === current.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => { onSwitch(b.id); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition text-left"
                    >
                      <span className="grid place-items-center w-9 h-9 rounded-lg border border-line bg-surface">
                        <BusinessMark kind={b.monogram} size={18} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-ink truncate">{b.name}</span>
                        <span className="block text-[11px] text-faint">{b.tag}</span>
                      </span>
                      {selected && <IconCheck width={17} height={17} className="text-gold" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-line px-4 py-3">
                <button className="text-xs text-muted hover:text-gold-bright transition">
                  + Add / manage businesses
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <button
          onClick={onNotifications}
          className="relative grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface-2/60 text-muted hover:text-ink hover:border-line-strong transition"
          title="Notifications"
        >
          <IconBell width={18} height={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface-2/60 text-muted hover:text-ink hover:border-line-strong transition"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          )}
        </button>

        {/* Help */}
        <button
          onClick={onHelp}
          className="grid place-items-center w-10 h-10 rounded-xl border border-line bg-surface-2/60 text-muted hover:text-ink hover:border-line-strong transition"
          title="Help & support"
        >
          <IconHelp width={18} height={18} />
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 pl-1 pr-1.5 py-1 rounded-xl hover:bg-white/[0.03] transition"
          >
            <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-gold-bright to-gold-dim text-base font-semibold text-[#0a0a0c]">
              {initial}
            </span>
            <div className="hidden sm:block leading-tight text-left">
              <div className="text-sm font-medium text-ink">{session.name}</div>
              <div className="text-[11px] text-muted">{session.role}</div>
            </div>
            <IconChevron
              width={16}
              height={16}
              className={`text-muted transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[240px] rounded-2xl border border-line bg-elevated shadow-2xl overflow-hidden rise">
              <div className="px-4 py-3 border-b border-line">
                <div className="text-sm font-medium text-ink truncate">{session.name}</div>
                <div className="text-[12px] text-muted truncate">{session.email}</div>
              </div>
              <div className="py-1.5">
                <button
                  onClick={() => { setProfileOpen(false); onProfile?.(); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-ink-soft hover:bg-white/[0.04] transition"
                >
                  Profile & account
                </button>
                <button
                  onClick={() => { setProfileOpen(false); onNotifications?.(); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-ink-soft hover:bg-white/[0.04] transition"
                >
                  Notifications
                </button>
                <button
                  onClick={() => { setProfileOpen(false); router.push("/settings"); }}
                  className="w-full text-left px-4 py-2 text-[13px] text-ink-soft hover:bg-white/[0.04] transition"
                >
                  Settings
                </button>
              </div>
              <div className="border-t border-line py-1.5">
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
                    signOut();
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-neg hover:bg-neg/10 transition"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
