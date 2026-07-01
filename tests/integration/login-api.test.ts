import { describe, it, expect, vi, beforeEach } from "vitest";

// Test the credential validation logic extracted from the route handler
function validateCredentials(
  email: string,
  password: string,
  adminEmail: string,
  adminPassword: string
): { ok: boolean; error?: string } {
  if (!adminEmail || !adminPassword) return { ok: false, error: "Server not configured" };
  if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return { ok: false, error: "Invalid email or password" };
  }
  return { ok: true };
}

describe("login credential validation", () => {
  const ADMIN_EMAIL    = "graham@nxps.group";
  const ADMIN_PASSWORD = "SecurePass123";

  it("accepts correct credentials", () => {
    const result = validateCredentials(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(result.ok).toBe(true);
  });

  it("rejects wrong password", () => {
    const result = validateCredentials(ADMIN_EMAIL, "wrongpass", ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid email or password");
  });

  it("rejects wrong email", () => {
    const result = validateCredentials("other@example.com", ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(result.ok).toBe(false);
  });

  it("is case-insensitive for email", () => {
    const result = validateCredentials("GRAHAM@NXPS.GROUP", ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(result.ok).toBe(true);
  });

  it("returns server error when env vars are missing", () => {
    const result = validateCredentials(ADMIN_EMAIL, ADMIN_PASSWORD, "", "");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Server not configured");
  });

  it("rejects empty password even if email matches", () => {
    const result = validateCredentials(ADMIN_EMAIL, "", ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(result.ok).toBe(false);
  });
});

describe("session display name derivation", () => {
  function deriveDisplayName(email: string): string {
    const local = email.split("@")[0].replace(/[._-]/g, " ");
    return local.replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin";
  }

  it("capitalises each word", () => {
    expect(deriveDisplayName("graham@nxps.group")).toBe("Graham");
  });

  it("handles dots as separators", () => {
    expect(deriveDisplayName("john.smith@nxps.group")).toBe("John Smith");
  });

  it("handles underscores as separators", () => {
    expect(deriveDisplayName("jane_doe@nxps.group")).toBe("Jane Doe");
  });

  it("handles hyphens as separators", () => {
    expect(deriveDisplayName("mary-jones@nxps.group")).toBe("Mary Jones");
  });
});
