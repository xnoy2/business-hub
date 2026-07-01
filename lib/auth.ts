"use client";

/* Client-side display session (non-sensitive).
   Real auth is the HTTP-only cookie set by /api/auth/login.
   This just stores display info (name, role) for the UI. */
const KEY = "nxps_session";

export interface Session {
  email: string;
  name: string;
  role: string;
  since: number;
}

export function signIn(email: string, name?: string, role = "CEO"): Session {
  const derived = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin";
  const displayName = name ?? derived;

  const session: Session = { email, name: displayName, role, since: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
