import { NextResponse } from "next/server";

// Returns which integrations are actually configured server-side.
// Safe to call from the client — never exposes the key values themselves.
export async function GET() {
  return NextResponse.json({
    ghl: {
      configured: !!process.env.GHL_API_KEY,
      bgr: !!process.env.GHL_BGR_LOCATION_ID,
      bcf: !!process.env.GHL_BCF_LOCATION_ID,
      group: !!process.env.GHL_GROUP_LOCATION_ID,
    },
    ceo: {
      configured: !!process.env.CEO_API_KEY,
    },
  });
}
