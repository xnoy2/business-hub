import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json() as { email: string; password: string };

  const adminEmail    = process.env.ADMIN_EMAIL    ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.isLoggedIn = true;
  session.email      = email;
  session.name       = deriveDisplayName(email);
  session.role       = "CEO";
  await session.save();

  return NextResponse.json({ ok: true, name: session.name, role: session.role });
}

function deriveDisplayName(email: string) {
  const local = email.split("@")[0].replace(/[._-]/g, " ");
  return local.replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin";
}
