import { NextResponse } from "next/server";

// Debug endpoint — test any business's GHL connection.
// Usage: /api/ghl/debug?business=bgr|bcf|group
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const business = searchParams.get("business") ?? "bgr";

  const locationId =
    business === "bcf"   ? process.env.GHL_BCF_LOCATION_ID :
    business === "group" ? (process.env.GHL_GROUP_LOCATION_ID ?? process.env.GHL_BGR_LOCATION_ID) :
    process.env.GHL_BGR_LOCATION_ID;

  const token =
    business === "bcf"   ? (process.env.GHL_BCF_API_KEY   ?? process.env.GHL_API_KEY) :
    business === "group" ? (process.env.GHL_GROUP_API_KEY ?? process.env.GHL_API_KEY) :
    process.env.GHL_API_KEY;

  if (!token)      return NextResponse.json({ error: "No API key set" }, { status: 500 });
  if (!locationId) return NextResponse.json({ error: "No location ID set for: " + business }, { status: 400 });

  const BASE    = "https://services.leadconnectorhq.com";
  const headers = { Authorization: `Bearer ${token}`, Version: "2021-07-28" };

  const [contacts, opps] = await Promise.allSettled([
    fetch(`${BASE}/contacts/?locationId=${locationId}&limit=1`, { headers }).then(async (r) => ({
      status: r.status, body: await r.json().catch(() => r.text()),
    })),
    fetch(`${BASE}/opportunities/search?location_id=${locationId}&status=open&limit=2`, { headers }).then(async (r) => ({
      status: r.status, body: await r.json().catch(() => r.text()),
    })),
  ]);

  return NextResponse.json({
    business,
    locationId,
    tokenType: token.startsWith("pit-") ? "private-integration" : "jwt",
    contacts:      contacts.status      === "fulfilled" ? contacts.value      : { error: String(contacts.reason) },
    opportunities: opps.status === "fulfilled" ? opps.value : { error: String(opps.reason) },
  });
}
