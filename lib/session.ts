import type { SessionOptions } from "iron-session";

export interface SessionData {
  isLoggedIn: boolean;
  email: string;
  name: string;
  role: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "fallback-dev-secret-32-chars-min!!",
  cookieName: "nxps_hub_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
