"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, type Session } from "@/lib/auth";
import { IconArrow } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  session: Session;
  onUpdate: (s: Session) => void;
}

export function ProfileModal({ open, onClose, session, onUpdate }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(session.name);
  const [role, setRole] = useState(session.role);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(session.name);
    setRole(session.role);
  }, [session]);

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

  const save = () => {
    const updated = { ...session, name: name.trim() || session.name, role: role.trim() || session.role };
    signIn(updated.email); // re-save with updated name via the auth helper
    // Manually patch to keep custom name/role
    try {
      localStorage.setItem("nxps_session", JSON.stringify(updated));
    } catch {}
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    signOut();
    router.push("/login");
  };

  const initial = (name || session.name).charAt(0).toUpperCase();
  const sinceDate = new Date(session.since).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-[380px] z-50 bg-elevated border-l border-line shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[15px] font-semibold text-ink">Profile & Account</h2>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg border border-line text-muted hover:text-ink transition">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-bright to-gold-dim text-2xl font-semibold text-[#0a0a0c]">
              {initial}
            </span>
            <div>
              <p className="text-[15px] font-semibold text-ink">{session.name}</p>
              <p className="text-[12px] text-muted">{session.email}</p>
              <p className="text-[12px] text-faint mt-0.5">Session started {sinceDate}</p>
            </div>
          </div>

          {/* Edit form */}
          <div className="space-y-4">
            <h3 className="text-[12px] uppercase tracking-wider text-muted">Edit profile</h3>

            <label className="block">
              <span className="text-[12.5px] text-ink-soft block mb-1.5">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="Your name"
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-soft block mb-1.5">Role</span>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="field-input"
                placeholder="e.g. CEO"
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-soft block mb-1.5">Email address</span>
              <input
                value={session.email}
                disabled
                className="field-input opacity-50 cursor-not-allowed"
              />
              <p className="text-[11.5px] text-faint mt-1">Email is managed by your identity provider.</p>
            </label>

            <button
              onClick={save}
              className={`btn-gold w-full justify-center ${saved ? "opacity-80" : ""}`}
            >
              {saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>

          {/* Session info */}
          <div className="space-y-3">
            <h3 className="text-[12px] uppercase tracking-wider text-muted">Session</h3>
            <div className="card px-4 py-4 space-y-2.5">
              <Row label="Signed in as" value={session.email} />
              <Row label="Role" value={session.role} />
              <Row label="Session since" value={sinceDate} />
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <a href="/settings" className="btn-ghost w-full justify-between">
              <span>Settings</span>
              <IconArrow width={14} height={14} />
            </a>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5 py-4 border-t border-line">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-neg/30 bg-neg/8 px-4 py-3 text-[13px] font-medium text-neg hover:bg-neg/15 transition"
          >
            Sign out of NXPS Hub
          </button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className="text-[12.5px] text-ink-soft">{value}</span>
    </div>
  );
}
