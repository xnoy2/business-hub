"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrow } from "./icons";

/* Sites that use server-side CSRF protection (Laravel, PHP, Rails, Django)
   will show a 419 / 403 / CSRF error when a login form is submitted inside
   an iframe, because SameSite=Lax session cookies are not sent on cross-site
   POSTs. We detect these origins and show the "log in via new tab" banner
   immediately rather than waiting for a timeout. */
const CSRF_PROTECTED_ORIGINS = [
  "portal.bespokegardenroomsballycastle.co.uk",
  "staff.bespokegardenroomsballycastle.co.uk",
  "bcf-dashboard.onrender.com",
];

function isCsrfProtected(url: string) {
  return CSRF_PROTECTED_ORIGINS.some((o) => url.includes(o));
}

type EmbedStatus = "loading" | "ready" | "needs-login";

export function EmbeddedView({
  title,
  url,
  businessName,
}: {
  title: string;
  url: string;
  businessName: string;
}) {
  const [nonce, setNonce] = useState(0);
  const [status, setStatus] = useState<EmbedStatus>("loading");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const csrfSite = isCsrfProtected(url);

  useEffect(() => {
    setStatus("loading");

    // For CSRF-protected PHP/Laravel sites show the sign-in banner immediately
    // (they'll always require a direct browser session for form submission).
    // For other sites give a longer grace period before surfacing the banner.
    const delay = csrfSite ? 1800 : 6000;
    const t = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "needs-login" : s));
    }, delay);

    return () => clearTimeout(t);
  }, [nonce, url, csrfSite]);

  const onFrameLoad = () => {
    // onLoad fires even on error pages — keep "needs-login" if already set.
    setStatus((s) => (s === "loading" ? "ready" : s));
  };

  const reload = () => {
    setNonce((n) => n + 1);
  };

  return (
    <div className="rise flex flex-col h-[calc(100vh-68px-3.5rem)] min-h-[520px]">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 rounded-t-2xl border border-line bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="chip bg-pos/12 text-pos">
            <span className="w-1.5 h-1.5 rounded-full bg-pos pulse-soft" /> Live
          </span>
          <span className="text-sm font-medium text-ink truncate">{title}</span>
          <span className="text-faint">·</span>
          <span className="text-[12px] text-muted truncate">{businessName}</span>
        </div>

        <div className="flex-1" />

        <span className="hidden md:inline text-[11px] text-faint truncate max-w-[260px]">
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </span>

        <button
          onClick={reload}
          className="grid place-items-center w-8 h-8 rounded-lg border border-line text-muted hover:text-ink hover:border-line-strong transition"
          title="Reload"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 4v5h-5" />
          </svg>
        </button>

        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1.5">
          Open in new tab <IconArrow width={14} height={14} />
        </a>
      </div>

      {/* ── Frame area ── */}
      <div className="relative flex-1 rounded-b-2xl border border-t-0 border-line overflow-hidden bg-surface-2">

        {/* Loading spinner — hidden once frame fires onLoad */}
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center z-10">
            <div className="flex flex-col items-center gap-3 text-muted">
              <span className="w-8 h-8 rounded-full border-2 border-line border-t-gold animate-spin" />
              <span className="text-[13px]">Loading {title}…</span>
            </div>
          </div>
        )}

        {/* Login-required banner */}
        {status === "needs-login" && (
          <div className="absolute inset-x-0 top-0 z-20 p-4">
            <div className="mx-auto max-w-xl card border-warn/30 px-5 py-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5 shrink-0">🔐</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink">
                    Sign in required in a new tab
                  </p>
                  {csrfSite ? (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      <strong className="text-ink-soft">{title}</strong> uses server-side
                      security (CSRF) that prevents login forms from working inside an
                      embedded frame — this is a browser restriction, not an error.
                      <br />
                      <strong className="text-ink-soft">Fix:</strong> open the site in a new
                      tab, sign in once, then come back here — the Hub will load it
                      directly into your session.
                    </p>
                  ) : (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      This site is taking longer than expected, or your session may have
                      expired. Open it in a new tab to sign in, then return here.
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold py-2 text-[13px]"
                    >
                      Sign in — open {title} ↗
                    </a>
                    <button
                      onClick={reload}
                      className="btn-ghost py-2 text-[13px]"
                    >
                      Reload embed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={nonce}
          ref={frameRef}
          src={url}
          title={title}
          onLoad={onFrameLoad}
          className="w-full h-full bg-white"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation allow-downloads"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
