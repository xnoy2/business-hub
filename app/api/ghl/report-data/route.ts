import { NextResponse } from "next/server";
import {
  ghlFetch,
  ghlPost,
  startOfMonth,
  startOfPrevMonth,
  endOfPrevMonth,
  type GhlOpportunitiesResponse,
  type GhlContactsResponse,
} from "@/lib/ghl";

const LOC: Record<string, string | undefined> = {
  bgr:   process.env.GHL_BGR_LOCATION_ID,
  bcf:   process.env.GHL_BCF_LOCATION_ID,
  group: process.env.GHL_GROUP_LOCATION_ID,
};
const KEY: Record<string, string | undefined> = {
  bgr:   process.env.GHL_BGR_API_KEY   ?? process.env.GHL_API_KEY,
  bcf:   process.env.GHL_BCF_API_KEY   ?? process.env.GHL_API_KEY,
  group: process.env.GHL_GROUP_API_KEY ?? process.env.GHL_API_KEY,
};

// Extended opp type — v2 API returns pipeline/stage objects
interface GhlOppV2 {
  id: string;
  name?: string;
  monetaryValue?: number;
  status: string;
  pipeline?: { id: string; name: string };
  pipelineStage?: { id: string; name: string };
  contact?: { id?: string; name?: string; email?: string };
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}
interface GhlOppsV2Response {
  opportunities: GhlOppV2[];
  meta?: { total?: number };
}

interface GhlSearchResponse {
  contacts: { id: string; source?: string; dateAdded?: string }[];
  meta?: { total?: number };
}

export interface PipelineRow {
  id: string; name: string; contact: string; value: number; stage: string; createdAt: string;
}
export interface WonRow {
  id: string; name: string; contact: string; value: number; wonAt: string;
}
export interface LeadSourceRow {
  source: string; count: number; thisMonth: number;
}
export interface WonMonthRow {
  month: string; value: number; count: number;
}

export type ReportPayload =
  | { type: "pipeline"; rows: PipelineRow[]; total: number; totalValue: number }
  | { type: "won";      rows: WonRow[];      totalValue: number; count: number }
  | { type: "leads";    rows: LeadSourceRow[]; totalContacts: number }
  | { type: "won-trend"; rows: WonMonthRow[] };

async function getPipelineData(locationId: string, apiKey?: string): Promise<PipelineRow[]> {
  const res = await ghlFetch<GhlOppsV2Response>(
    "/opportunities/search",
    { location_id: locationId, status: "open", limit: "100" },
    apiKey
  );
  return res.opportunities.map((o) => ({
    id: o.id,
    name: o.name ?? "Untitled",
    contact: o.contact?.name ?? "—",
    value: o.monetaryValue ?? 0,
    stage: o.pipelineStage?.name ?? "Unknown",
    createdAt: o.createdAt,
  }));
}

async function getWonData(locationId: string, apiKey?: string): Promise<WonRow[]> {
  const som = startOfMonth();
  const res = await ghlFetch<GhlOppsV2Response>(
    "/opportunities/search",
    { location_id: locationId, status: "won", limit: "100" },
    apiKey
  );
  return res.opportunities
    .filter((o) => new Date(o.updatedAt ?? o.createdAt) >= som)
    .map((o) => ({
      id: o.id,
      name: o.name ?? "Untitled",
      contact: o.contact?.name ?? "—",
      value: o.monetaryValue ?? 0,
      wonAt: o.updatedAt ?? o.createdAt,
    }))
    .sort((a, b) => b.value - a.value);
}

async function getLeadSourceData(locationId: string, apiKey?: string): Promise<LeadSourceRow[]> {
  const useV1 = apiKey?.startsWith("eyJ") ?? false;
  const som = startOfMonth();

  if (useV1) {
    // v1: fetch contacts and derive from source field
    const res = await ghlFetch<GhlContactsResponse>(
      "/contacts/",
      { locationId, limit: "100" },
      apiKey
    );
    const counts: Record<string, { total: number; thisMonth: number }> = {};
    for (const c of res.contacts) {
      const src = c.source ?? "Direct / Unknown";
      if (!counts[src]) counts[src] = { total: 0, thisMonth: 0 };
      counts[src].total++;
      if (c.dateAdded && new Date(c.dateAdded) >= som) counts[src].thisMonth++;
    }
    return Object.entries(counts)
      .map(([source, v]) => ({ source, count: v.total, thisMonth: v.thisMonth }))
      .sort((a, b) => b.count - a.count);
  }

  // v2: use contacts/search to get recent contacts with source
  const res = await ghlPost<GhlSearchResponse>(
    "/contacts/search",
    { locationId, page: 1, pageLimit: 100, filters: [] },
    apiKey
  );
  const counts: Record<string, { total: number; thisMonth: number }> = {};
  for (const c of res.contacts) {
    const src = (c as { source?: string }).source ?? "Direct / Unknown";
    if (!counts[src]) counts[src] = { total: 0, thisMonth: 0 };
    counts[src].total++;
    const da = (c as { dateAdded?: string }).dateAdded;
    if (da && new Date(da) >= som) counts[src].thisMonth++;
  }
  return Object.entries(counts)
    .map(([source, v]) => ({ source, count: v.total, thisMonth: v.thisMonth }))
    .sort((a, b) => b.count - a.count);
}

async function getWonTrend(locationId: string, apiKey?: string): Promise<WonMonthRow[]> {
  const res = await ghlFetch<GhlOppsV2Response>(
    "/opportunities/search",
    { location_id: locationId, status: "won", limit: "100" },
    apiKey
  );
  const months: Record<string, { value: number; count: number }> = {};
  for (const o of res.opportunities) {
    const d = new Date(o.updatedAt ?? o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!months[key]) months[key] = { value: 0, count: 0 };
    months[key].value += o.monetaryValue ?? 0;
    months[key].count++;
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, v]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      value: v.value,
      count: v.count,
    }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const business = (searchParams.get("business") ?? "bgr").toLowerCase();
  const type = searchParams.get("type") ?? "pipeline";

  const apiKey = KEY[business];
  let locationId = LOC[business];

  // Group: aggregate BGR + BCF
  if (business === "group" && !locationId) {
    const bgrId = LOC.bgr;
    const bcfId = LOC.bcf;

    if (type === "pipeline") {
      const [bgrRows, bcfRows] = await Promise.allSettled([
        bgrId ? getPipelineData(bgrId, KEY.bgr) : Promise.reject("no bgr"),
        bcfId ? getPipelineData(bcfId, KEY.bcf) : Promise.reject("no bcf"),
      ]);
      const rows = [
        ...(bgrRows.status === "fulfilled" ? bgrRows.value : []),
        ...(bcfRows.status === "fulfilled" ? bcfRows.value : []),
      ].sort((a, b) => b.value - a.value);
      return NextResponse.json({
        type: "pipeline",
        rows,
        total: rows.length,
        totalValue: rows.reduce((s, r) => s + r.value, 0),
      });
    }
    if (type === "won") {
      const [bgrRows, bcfRows] = await Promise.allSettled([
        bgrId ? getWonData(bgrId, KEY.bgr) : Promise.reject("no bgr"),
        bcfId ? getWonData(bcfId, KEY.bcf) : Promise.reject("no bcf"),
      ]);
      const rows = [
        ...(bgrRows.status === "fulfilled" ? bgrRows.value : []),
        ...(bcfRows.status === "fulfilled" ? bcfRows.value : []),
      ].sort((a, b) => b.value - a.value);
      return NextResponse.json({
        type: "won",
        rows,
        totalValue: rows.reduce((s, r) => s + r.value, 0),
        count: rows.length,
      });
    }
  }

  if (!locationId || !apiKey) {
    return NextResponse.json({ error: "Location or API key not configured" }, { status: 400 });
  }

  try {
    if (type === "pipeline") {
      const rows = await getPipelineData(locationId, apiKey);
      return NextResponse.json({
        type: "pipeline",
        rows,
        total: rows.length,
        totalValue: rows.reduce((s, r) => s + r.value, 0),
      });
    }
    if (type === "won") {
      const rows = await getWonData(locationId, apiKey);
      return NextResponse.json({
        type: "won",
        rows,
        totalValue: rows.reduce((s, r) => s + r.value, 0),
        count: rows.length,
      });
    }
    if (type === "leads") {
      const rows = await getLeadSourceData(locationId, apiKey);
      const total = rows.reduce((s, r) => s + r.count, 0);
      return NextResponse.json({ type: "leads", rows, totalContacts: total });
    }
    if (type === "won-trend") {
      const rows = await getWonTrend(locationId, apiKey);
      return NextResponse.json({ type: "won-trend", rows });
    }
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (err) {
    console.error("[report-data]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "API error" }, { status: 500 });
  }
}
