import { NextResponse } from "next/server";
import {
  ghlFetch,
  ghlPost,
  startOfMonth,
  startOfPrevMonth,
  endOfPrevMonth,
  startOfDay,
  endOfDay,
  pctChange,
  type GhlContactsResponse,
  type GhlOpportunitiesResponse,
  type GhlCalendarEventsResponse,
} from "@/lib/ghl";

interface GhlSearchResponse {
  contacts: { id: string }[];
  meta?: { total?: number };
}

/* Location ID map — populated from environment variables.
   The client sends ?business=bgr|bcf|group; this file resolves
   the actual GHL location IDs server-side so they never leave
   the server. */
const LOC: Record<string, string | undefined> = {
  bgr:   process.env.GHL_BGR_LOCATION_ID,
  bcf:   process.env.GHL_BCF_LOCATION_ID,
  group: process.env.GHL_GROUP_LOCATION_ID,
};

// Per-business API keys — fall back to the shared GHL_API_KEY if not set.
const KEY: Record<string, string | undefined> = {
  bgr:   process.env.GHL_BGR_API_KEY   ?? process.env.GHL_API_KEY,
  bcf:   process.env.GHL_BCF_API_KEY   ?? process.env.GHL_API_KEY,
  group: process.env.GHL_GROUP_API_KEY ?? process.env.GHL_API_KEY,
};

export interface KpiPayload {
  ok: true;
  totalLeads: number;
  newLeads30d: number;
  newLeadsPrev30d: number;
  leadsDelta: number;
  pipelineValue: number;
  pipelineCount: number;
  wonThisMonth: number;
  wonLastMonth: number;
  wonDelta: number;
  tasksDue: number;
  configured: true;
}
export interface KpiError {
  ok: false;
  error: string;
  configured: boolean;
}

async function fetchKpisForLocation(locationId: string, apiKey?: string): Promise<KpiPayload> {
  const now = new Date();
  const som = startOfMonth(now);
  const sopm = startOfPrevMonth(now);
  const eopm = endOfPrevMonth(now);
  const sod = startOfDay(now);
  const eod = endOfDay(now);

  const useV1 = apiKey?.startsWith("eyJ") ?? false;

  // Monthly lead counts via POST /contacts/search (v2 only)
  const [thisMonthRes, prevMonthRes] = await Promise.allSettled(
    useV1
      ? [Promise.reject("v1"), Promise.reject("v1")]
      : [
          ghlPost<GhlSearchResponse>("/contacts/search", {
            locationId,
            page: 1,
            pageLimit: 1,
            filters: [{ field: "dateAdded", operator: "GTE", value: som.toISOString() }],
          }, apiKey),
          ghlPost<GhlSearchResponse>("/contacts/search", {
            locationId,
            page: 1,
            pageLimit: 1,
            filters: [
              { field: "dateAdded", operator: "GTE", value: sopm.toISOString() },
              { field: "dateAdded", operator: "LTE", value: eopm.toISOString() },
            ],
          }, apiKey),
        ]
  );

  const newLeads30d    = thisMonthRes.status === "fulfilled" ? (thisMonthRes.value.meta?.total ?? 0) : 0;
  const newLeadsPrev30d = prevMonthRes.status === "fulfilled" ? (prevMonthRes.value.meta?.total ?? 0) : 0;

  const [contactsTotalRes, openOppsRes, wonOppsRes, eventsRes] =
    await Promise.allSettled([
      ghlFetch<GhlContactsResponse>("/contacts/", { locationId, limit: "1" }, apiKey),
      ghlFetch<GhlOpportunitiesResponse>("/opportunities/search", { location_id: locationId, status: "open", limit: "100" }, apiKey),
      ghlFetch<GhlOpportunitiesResponse>(
        "/opportunities/search",
        useV1
          ? { location_id: locationId, status: "won", limit: "100" }
          : { location_id: locationId, status: "won", limit: "100", order: "updatedAt_desc" },
        apiKey
      ),
      // Calendar events endpoint is v2 only — resolves to empty on v1 JWT tokens
      useV1
        ? Promise.resolve<GhlCalendarEventsResponse>({ events: [] })
        : ghlFetch<GhlCalendarEventsResponse>("/calendars/events", { locationId, startTime: sod.getTime().toString(), endTime: eod.getTime().toString() }, apiKey),
    ]);

  // Log any API failures to the Next.js terminal for debugging
  const callNames = ["contacts", "open-opps", "won-opps", "calendar-events"];
  [contactsTotalRes, openOppsRes, wonOppsRes, eventsRes].forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[GHL] ${callNames[i]} failed for ${locationId}:`, r.reason);
    }
  });

  // ── 1. Total leads ───────────────────────────────────────────
  const totalLeads =
    contactsTotalRes.status === "fulfilled"
      ? (contactsTotalRes.value.meta?.total ??
        contactsTotalRes.value.count ??
        0)
      : 0;

  const leadsDelta = pctChange(newLeads30d, newLeadsPrev30d);

  // ── 2. Pipeline value ────────────────────────────────────────
  const openOpps =
    openOppsRes.status === "fulfilled"
      ? openOppsRes.value.opportunities
      : [];
  const pipelineValue = openOpps.reduce(
    (sum, o) => sum + (o.monetaryValue ?? 0),
    0
  );
  const pipelineCount = openOpps.length;

  // ── 3. Won this month vs last month ──────────────────────────
  const allWon =
    wonOppsRes.status === "fulfilled"
      ? wonOppsRes.value.opportunities
      : [];

  const wonThisMonth = allWon
    .filter((o) => new Date(o.updatedAt ?? o.createdAt) >= som)
    .reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);

  const wonLastMonth = allWon
    .filter((o) => {
      const d = new Date(o.updatedAt ?? o.createdAt);
      return d >= sopm && d <= eopm;
    })
    .reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);

  const wonDelta = pctChange(wonThisMonth, wonLastMonth);

  // ── 4. Tasks due (calendar events today) ─────────────────────
  const tasksDue =
    eventsRes.status === "fulfilled"
      ? (eventsRes.value.events?.filter(
          (e) => e.status !== "cancelled" && e.appointmentStatus !== "cancelled"
        ).length ?? 0)
      : 0;

  return {
    ok: true,
    configured: true,
    totalLeads,
    newLeads30d,
    newLeadsPrev30d,
    leadsDelta,
    pipelineValue,
    pipelineCount,
    wonThisMonth,
    wonLastMonth,
    wonDelta,
    tasksDue,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const business = (searchParams.get("business") ?? "").toLowerCase();

  if (!KEY[business] && !process.env.GHL_API_KEY) {
    return NextResponse.json<KpiError>({
      ok: false,
      configured: false,
      error: "GHL_API_KEY not set — see .env.local.example",
    });
  }

  // Group business: aggregate BGR + BCF unless its own location is set
  if (business === "group" && !LOC.group) {
    const bgrId = LOC.bgr;
    const bcfId = LOC.bcf;

    if (!bgrId && !bcfId) {
      return NextResponse.json<KpiError>({
        ok: false,
        configured: false,
        error: "No location IDs configured for BGR or BCF",
      });
    }

    const results = await Promise.allSettled([
      bgrId ? fetchKpisForLocation(bgrId, KEY.bgr) : Promise.reject("no bgr"),
      bcfId ? fetchKpisForLocation(bcfId, KEY.bcf) : Promise.reject("no bcf"),
    ]);

    const payloads = results
      .filter((r): r is PromiseFulfilledResult<KpiPayload> => r.status === "fulfilled")
      .map((r) => r.value);

    if (payloads.length === 0) {
      return NextResponse.json<KpiError>({
        ok: false,
        configured: true,
        error: "GHL API calls failed for all locations",
      });
    }

    const agg: KpiPayload = {
      ok: true,
      configured: true,
      totalLeads: payloads.reduce((s, p) => s + p.totalLeads, 0),
      newLeads30d: payloads.reduce((s, p) => s + p.newLeads30d, 0),
      newLeadsPrev30d: payloads.reduce((s, p) => s + p.newLeadsPrev30d, 0),
      leadsDelta: 0,
      pipelineValue: payloads.reduce((s, p) => s + p.pipelineValue, 0),
      pipelineCount: payloads.reduce((s, p) => s + p.pipelineCount, 0),
      wonThisMonth: payloads.reduce((s, p) => s + p.wonThisMonth, 0),
      wonLastMonth: payloads.reduce((s, p) => s + p.wonLastMonth, 0),
      wonDelta: pctChange(
        payloads.reduce((s, p) => s + p.wonThisMonth, 0),
        payloads.reduce((s, p) => s + p.wonLastMonth, 0)
      ),
      tasksDue: payloads.reduce((s, p) => s + p.tasksDue, 0),
    };
    return NextResponse.json(agg);
  }

  const locationId = LOC[business];
  if (!locationId) {
    return NextResponse.json<KpiError>({
      ok: false,
      configured: false,
      error: `Location ID not set for business "${business}" — see .env.local.example`,
    });
  }

  try {
    const payload = await fetchKpisForLocation(locationId, KEY[business]);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json<KpiError>({
      ok: false,
      configured: true,
      error: err instanceof Error ? err.message : "Unknown GHL API error",
    });
  }
}
