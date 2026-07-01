import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  pctChange,
  startOfMonth,
  startOfPrevMonth,
  endOfPrevMonth,
  startOfDay,
  endOfDay,
} from "@/lib/ghl";

describe("pctChange", () => {
  it("returns 100 when previous is 0 and current > 0", () => {
    expect(pctChange(10, 0)).toBe(100);
  });

  it("returns 0 when both are 0", () => {
    expect(pctChange(0, 0)).toBe(0);
  });

  it("calculates positive change correctly", () => {
    expect(pctChange(120, 100)).toBe(20);
  });

  it("calculates negative change correctly", () => {
    expect(pctChange(80, 100)).toBe(-20);
  });

  it("rounds to nearest integer", () => {
    expect(pctChange(1, 3)).toBe(-67);
  });
});

describe("date helpers", () => {
  const REF = new Date("2026-06-19T14:30:00.000Z");

  it("startOfMonth returns first day of current month at midnight", () => {
    const d = startOfMonth(REF);
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe(REF.getMonth());
    expect(d.getFullYear()).toBe(REF.getFullYear());
    expect(d.getHours()).toBe(0);
  });

  it("startOfPrevMonth returns first day of previous month", () => {
    const d = startOfPrevMonth(REF);
    expect(d.getMonth()).toBe(4); // May (0-indexed)
    expect(d.getDate()).toBe(1);
  });

  it("endOfPrevMonth returns last day of previous month at 23:59:59", () => {
    const d = endOfPrevMonth(REF);
    expect(d.getMonth()).toBe(4); // May
    expect(d.getDate()).toBe(31);
    expect(d.getHours()).toBe(23);
    expect(d.getSeconds()).toBe(59);
  });

  it("startOfDay returns today at 00:00:00", () => {
    const d = startOfDay(REF);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("endOfDay returns today at 23:59:59", () => {
    const d = endOfDay(REF);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getSeconds()).toBe(59);
  });
});
