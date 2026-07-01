"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { NxpsLogo } from "@/components/Brand";
import { IconArrow, IconCheck } from "@/components/icons";

const unified = [
  "Client & Staff Portals",
  "Sales Tracker (GoHighLevel)",
  "Garden Room & BCF Configurators",
  "CEO Dashboard & Marketing AI",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const { name, role } = await res.json();
        signIn(email, name, role); // persist display info to localStorage
        router.push("/");
        router.refresh();
      } else {
        const { error: msg } = await res.json().catch(() => ({ error: "Sign in failed" }));
        setError(msg ?? "Invalid email or password");
        setBusy(false);
      }
    } catch {
      setError("Network error — please try again");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-line">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(700px 480px at 20% 10%, rgba(201,162,75,0.14), transparent 60%), radial-gradient(600px 500px at 90% 90%, rgba(96,165,250,0.06), transparent 55%)",
          }}
        />
        <NxpsLogo />

        <div className="max-w-md">
          <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-ink">
            One Login.
            <br />
            <span className="text-gold-bright">All Your Business.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            The unified operating system for Bespoke Garden Rooms, Ballycastle
            Climbing Frames and the NXPS Group — every system, one secure
            entry point.
          </p>

          <ul className="mt-8 space-y-3">
            {unified.map((u) => (
              <li key={u} className="flex items-center gap-3 text-[14px] text-ink-soft">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-gold/15 text-gold">
                  <IconCheck width={13} height={13} />
                </span>
                {u}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[12px] text-faint">
          © 2026 NXPS. Secured with SSO · MFA · role-based access.
        </p>
      </div>

      {/* Login card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] rise">
          <div className="lg:hidden mb-8">
            <NxpsLogo />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Sign in to your Hub
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Welcome back. Enter your credentials to continue.
          </p>

          {/* Google SSO — placeholder until OAuth is configured */}
          <button
            type="button"
            disabled
            title="Google Workspace SSO coming soon"
            className="mt-7 w-full flex items-center justify-center gap-3 rounded-xl border border-line bg-surface-2/40 px-4 py-3 text-sm text-faint cursor-not-allowed opacity-60"
          >
            <GoogleMark />
            Continue with Google Workspace
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] text-faint">
            <span className="h-px flex-1 bg-line" />
            OR SIGN IN WITH EMAIL
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email address">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@nxps.group"
                className="field-input"
                autoComplete="email"
                required
              />
            </Field>

            <Field
              label="Password"
              aside={
                <button
                  type="button"
                  onClick={() => setShowForgot((v) => !v)}
                  className="text-[12px] text-gold-bright hover:underline"
                >
                  Forgot password?
                </button>
              }
            >
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className={`field-input pr-12 ${error ? "border-red-500/60" : ""}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted hover:text-ink-soft"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {showForgot && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-[12.5px] text-muted leading-relaxed">
                Contact your admin to reset your password:{" "}
                <a
                  href="mailto:info@bespokegardenroomsballycastle.co.uk"
                  className="text-gold-bright hover:underline"
                >
                  info@bespokegardenroomsballycastle.co.uk
                </a>
              </div>
            )}

            {error && (
              <p className="text-[12.5px] text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </p>
            )}

            <label className="flex items-center gap-2.5 text-[13px] text-muted cursor-pointer select-none">
              <span
                onClick={() => setRemember((r) => !r)}
                className={`grid place-items-center w-[18px] h-[18px] rounded-[6px] border transition ${
                  remember ? "bg-gold border-gold text-[#0a0a0c]" : "border-line-strong text-transparent"
                }`}
              >
                <IconCheck width={12} height={12} />
              </span>
              Keep me signed in on this device
            </label>

            <button type="submit" disabled={busy} className="btn-gold w-full justify-center py-3 mt-2">
              {busy ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#0a0a0c]/30 border-t-[#0a0a0c] animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to NXPS Hub <IconArrow width={16} height={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-faint">
            Protected by multi-factor authentication. Need access?{" "}
            <button className="text-gold-bright hover:underline">Contact your admin</button>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] text-ink-soft">{label}</span>
        {aside}
      </span>
      {children}
    </label>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.3 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
