/* ============================================================
   GoHighLevel API client — supports both token types:
   - pit-xxx  → Private Integration token → v2 API
   - eyJ...   → Location API Key (JWT)    → v1 API
   All calls happen server-side so tokens never reach the browser.
   ============================================================ */
const BASE_V2 = "https://services.leadconnectorhq.com";
const BASE_V1 = "https://rest.gohighlevel.com/v1";

function isJwt(token: string) { return token.startsWith("eyJ"); }

export async function ghlPost<T>(
  path: string,
  body: Record<string, unknown>,
  apiKey?: string
): Promise<T> {
  const token = apiKey ?? process.env.GHL_API_KEY ?? "";
  if (!token) throw new Error("GHL_API_KEY not set");
  if (isJwt(token)) throw new Error("POST search requires a v2 Private Integration token");

  const res = await fetch(`${BASE_V2}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GHL POST ${path} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function ghlFetch<T>(
  path: string,
  params: Record<string, string> = {},
  apiKey?: string
): Promise<T> {
  const token = apiKey ?? process.env.GHL_API_KEY ?? "";
  if (!token) throw new Error("GHL_API_KEY not set");

  const base = isJwt(token) ? BASE_V1 : BASE_V2;
  const url  = new URL(`${base}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (!isJwt(token)) headers["Version"] = "2021-07-28";

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GHL ${path} → HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ── Response types ────────────────────────────────────────────────

export interface GhlContactsResponse {
  contacts: GhlContact[];
  meta?: { total?: number; currentPage?: number; nextPage?: number | null };
  count?: number;
}

export interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateAdded?: string;
  source?: string;
  tags?: string[];
  locationId?: string;
}

export interface GhlOpportunity {
  id: string;
  name?: string;
  monetaryValue?: number;
  status: "open" | "won" | "lost" | "abandoned";
  pipelineId?: string;
  pipelineStageId?: string;
  assignedTo?: string;
  contact?: { id?: string; name?: string; email?: string; phone?: string };
  createdAt: string;
  updatedAt?: string;
}

export interface GhlOpportunitiesResponse {
  opportunities: GhlOpportunity[];
  meta?: { total?: number; currentPage?: number; nextPage?: number | null };
}

export interface GhlCalendarEvent {
  id: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  contactId?: string;
  appointmentStatus?: string;
}

export interface GhlCalendarEventsResponse {
  events?: GhlCalendarEvent[];
}

// ── Helpers ───────────────────────────────────────────────────────

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function startOfPrevMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
export function endOfPrevMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}
export function startOfDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
}
export function endOfDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
