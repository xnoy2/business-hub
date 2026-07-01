import { NextResponse } from "next/server";
import { ghlFetch, type GhlContactsResponse, type GhlOpportunitiesResponse } from "@/lib/ghl";
import { relTime } from "@/lib/utils";

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

export interface ActivityItem {
  id: string;
  kind: "lead" | "won" | "pipeline" | "event";
  text: string;
  sub?: string;
  time: string;
  isoTime: string;
}

async function fetchActivityForLocation(locationId: string, apiKey?: string): Promise<ActivityItem[]> {
  const [contactsRes, wonRes] = await Promise.allSettled([
    ghlFetch<GhlContactsResponse>("/contacts/", { locationId, limit: "8" }, apiKey),
    ghlFetch<GhlOpportunitiesResponse>("/opportunities/search", { location_id: locationId, status: "won", limit: "5" }, apiKey),
  ]);

  if (contactsRes.status === "rejected") {
    console.error(`[Activity] contacts failed for ${locationId}:`, contactsRes.reason);
  }
  if (wonRes.status === "rejected") {
    console.error(`[Activity] won-opps failed for ${locationId}:`, wonRes.reason);
  }

  const items: ActivityItem[] = [];

  if (contactsRes.status === "fulfilled") {
    for (const c of contactsRes.value.contacts ?? []) {
      const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || "Unknown contact";
      items.push({
        id: `contact-${c.id}`,
        kind: "lead",
        text: `New lead: ${name}`,
        sub: c.source ?? c.email ?? undefined,
        time: relTime(c.dateAdded ?? ""),
        isoTime: c.dateAdded ?? new Date().toISOString(),
      });
    }
  }

  if (wonRes.status === "fulfilled") {
    for (const o of wonRes.value.opportunities ?? []) {
      items.push({
        id: `opp-${o.id}`,
        kind: "won",
        text: `Deal won: ${o.name ?? o.contact?.name ?? "Opportunity"}`,
        sub: o.monetaryValue ? `£${o.monetaryValue.toLocaleString("en-GB")}` : undefined,
        time: relTime(o.updatedAt ?? o.createdAt),
        isoTime: o.updatedAt ?? o.createdAt,
      });
    }
  }

  // Sort by most recent first
  items.sort((a, b) => new Date(b.isoTime).getTime() - new Date(a.isoTime).getTime());
  return items.slice(0, 12);
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const business = (searchParams.get("business") ?? "").toLowerCase();

  if (!KEY[business] && !process.env.GHL_API_KEY) {
    return NextResponse.json({ ok: false, items: [], configured: false });
  }

  // Build a list of [locationId, apiKey] pairs to fetch
  const targets: [string, string | undefined][] = [];
  if (business === "group") {
    if (LOC.group) targets.push([LOC.group, KEY.group]);
    else {
      if (LOC.bgr) targets.push([LOC.bgr, KEY.bgr]);
      if (LOC.bcf) targets.push([LOC.bcf, KEY.bcf]);
    }
  } else if (LOC[business]) {
    targets.push([LOC[business]!, KEY[business]]);
  }

  if (targets.length === 0) {
    return NextResponse.json({ ok: false, items: [], configured: false, error: "No location ID configured" });
  }

  try {
    const allResults = await Promise.allSettled(
      targets.map(([id, key]) => fetchActivityForLocation(id, key))
    );

    const items = allResults
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .sort((a, b) => new Date(b.isoTime).getTime() - new Date(a.isoTime).getTime())
      .slice(0, 12);

    return NextResponse.json({ ok: true, items, configured: true });
  } catch (err) {
    return NextResponse.json({
      ok: false, items: [], configured: true,
      error: err instanceof Error ? err.message : "GHL error",
    });
  }
}
