import { NextResponse } from "next/server";
import { ghlFetch, type GhlContactsResponse } from "@/lib/ghl";

const LOC: Record<string, string | undefined> = {
  bgr: process.env.GHL_BGR_LOCATION_ID,
  bcf: process.env.GHL_BCF_LOCATION_ID,
  group: process.env.GHL_GROUP_LOCATION_ID,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const business = (searchParams.get("business") ?? "bgr").toLowerCase();

  if (!q || q.length < 2) return NextResponse.json({ ok: true, contacts: [] });

  if (!process.env.GHL_API_KEY) {
    return NextResponse.json({ ok: false, contacts: [], configured: false });
  }

  const locationIds: string[] = [];
  if (business === "group") {
    [LOC.bgr, LOC.bcf, LOC.group].forEach((id) => id && locationIds.push(id));
  } else if (LOC[business]) {
    locationIds.push(LOC[business]!);
  }

  if (locationIds.length === 0) {
    return NextResponse.json({ ok: true, contacts: [], configured: false });
  }

  try {
    const results = await Promise.allSettled(
      locationIds.map((locationId) =>
        ghlFetch<GhlContactsResponse>("/contacts/", { locationId, query: q, limit: "6" })
      )
    );

    const contacts = results
      .flatMap((r) =>
        r.status === "fulfilled"
          ? (r.value.contacts ?? []).map((c) => ({
              id: c.id,
              name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown",
              email: c.email ?? "",
              phone: c.phone ?? "",
            }))
          : []
      )
      .slice(0, 10);

    return NextResponse.json({ ok: true, contacts, configured: true });
  } catch (err) {
    return NextResponse.json({
      ok: false, contacts: [],
      error: err instanceof Error ? err.message : "GHL error",
    });
  }
}
