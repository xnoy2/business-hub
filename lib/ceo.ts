/* ============================================================
   CEO Dashboard API — server-side client
   Base: https://dashboard.bespokegardenroomsballycastle.co.uk/api/v1
   All calls happen server-side so CEO_API_KEY never reaches the browser.
   ============================================================ */
const BASE = "https://dashboard.bespokegardenroomsballycastle.co.uk/api/v1";

export async function ceoFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const token = process.env.CEO_API_KEY ?? "";
  if (!token) throw new Error("CEO_API_KEY not set");

  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": token },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CEO API ${path} → HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ── Shared wrapper shape ──────────────────────────────────────────
export interface CeoResponse<T> {
  data: T;
  meta: {
    account?: string;
    generated_at?: string;
  };
}

// ── /appointments ─────────────────────────────────────────────────
export interface CeoAppointmentsData {
  total: number;
  upcoming: number;
  showed: number;
  no_show: number;
  scope_missing?: boolean;
}

export type CeoAppointmentsResponse = CeoResponse<CeoAppointmentsData>;
