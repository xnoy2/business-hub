import { NextResponse } from "next/server";
import { ceoFetch, type CeoResponse } from "@/lib/ceo";
import type { BusinessId } from "@/lib/data";

const accountMap: Record<BusinessId, string> = {
  bgr: "bgr",
  bcf: "bcf",
  group: "all",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await params;
  const { searchParams } = new URL(req.url);
  const business = (searchParams.get("business") ?? "bgr") as BusinessId;
  const account = accountMap[business] ?? "all";

  if (!process.env.CEO_API_KEY) {
    return NextResponse.json({ ok: false, error: "CEO_API_KEY not set" }, { status: 500 });
  }

  try {
    const data = await ceoFetch<CeoResponse<unknown>>(`/${endpoint}`, { account });
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error(`[CEO API] /${endpoint} failed:`, err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "CEO API error" },
      { status: 502 }
    );
  }
}
