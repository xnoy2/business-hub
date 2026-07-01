import { describe, it, expect, beforeEach, vi } from "vitest";
import { relTime } from "@/lib/utils";

describe("relTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00.000Z"));
  });

  it("returns 'just now' for timestamps less than 1 minute ago", () => {
    const iso = new Date(Date.now() - 30_000).toISOString();
    expect(relTime(iso)).toBe("just now");
  });

  it("returns minutes ago for < 1 hour", () => {
    const iso = new Date(Date.now() - 15 * 60_000).toISOString();
    expect(relTime(iso)).toBe("15 min ago");
  });

  it("returns hours ago for < 24 hours", () => {
    const iso = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(relTime(iso)).toBe("3h ago");
  });

  it("returns days ago for < 7 days", () => {
    const iso = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(relTime(iso)).toBe("2d ago");
  });

  it("returns formatted date for >= 7 days", () => {
    const iso = new Date("2026-06-01T00:00:00.000Z").toISOString();
    const result = relTime(iso);
    expect(result).toMatch(/Jun/);
  });

  it("returns empty string for empty input", () => {
    expect(relTime("")).toBe("");
  });
});
