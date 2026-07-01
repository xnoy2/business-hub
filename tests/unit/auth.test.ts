import { describe, it, expect, beforeEach } from "vitest";
import { signIn, getSession, signOut } from "@/lib/auth";

describe("auth — client-side localStorage session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("signIn stores a session in localStorage", () => {
    const session = signIn("graham@nxps.group", "Graham", "CEO");
    expect(session.email).toBe("graham@nxps.group");
    expect(session.name).toBe("Graham");
    expect(session.role).toBe("CEO");
    expect(typeof session.since).toBe("number");
  });

  it("getSession returns the stored session", () => {
    signIn("graham@nxps.group", "Graham", "CEO");
    const s = getSession();
    expect(s).not.toBeNull();
    expect(s?.email).toBe("graham@nxps.group");
    expect(s?.name).toBe("Graham");
  });

  it("getSession returns null when nothing is stored", () => {
    expect(getSession()).toBeNull();
  });

  it("signOut removes the session from localStorage", () => {
    signIn("graham@nxps.group", "Graham", "CEO");
    expect(getSession()).not.toBeNull();
    signOut();
    expect(getSession()).toBeNull();
  });

  it("signIn derives display name from email when name is not provided", () => {
    const session = signIn("john.smith@nxps.group");
    expect(session.name).toBe("John Smith");
  });

  it("signIn defaults role to CEO", () => {
    const session = signIn("graham@nxps.group");
    expect(session.role).toBe("CEO");
  });

  it("since is approximately now", () => {
    const before = Date.now();
    const session = signIn("test@test.com");
    const after = Date.now();
    expect(session.since).toBeGreaterThanOrEqual(before);
    expect(session.since).toBeLessThanOrEqual(after);
  });
});
