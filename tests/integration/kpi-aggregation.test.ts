import { describe, it, expect } from "vitest";
import { pctChange } from "@/lib/ghl";

// Mirror the aggregation logic from the group KPI route
interface KpiPayload {
  totalLeads: number;
  newLeads30d: number;
  newLeadsPrev30d: number;
  leadsDelta: number;
  pipelineValue: number;
  pipelineCount: number;
  wonThisMonth: number;
  wonLastMonth: number;
  wonDelta: number;
  tasksDue: number;
}

function aggregateKpis(payloads: KpiPayload[]): KpiPayload {
  const wonThisMonth = payloads.reduce((s, p) => s + p.wonThisMonth, 0);
  const wonLastMonth = payloads.reduce((s, p) => s + p.wonLastMonth, 0);
  return {
    totalLeads:      payloads.reduce((s, p) => s + p.totalLeads, 0),
    newLeads30d:     payloads.reduce((s, p) => s + p.newLeads30d, 0),
    newLeadsPrev30d: payloads.reduce((s, p) => s + p.newLeadsPrev30d, 0),
    leadsDelta:      pctChange(
      payloads.reduce((s, p) => s + p.newLeads30d, 0),
      payloads.reduce((s, p) => s + p.newLeadsPrev30d, 0)
    ),
    pipelineValue:   payloads.reduce((s, p) => s + p.pipelineValue, 0),
    pipelineCount:   payloads.reduce((s, p) => s + p.pipelineCount, 0),
    wonThisMonth,
    wonLastMonth,
    wonDelta:        pctChange(wonThisMonth, wonLastMonth),
    tasksDue:        payloads.reduce((s, p) => s + p.tasksDue, 0),
  };
}

const BGR_KPI: KpiPayload = {
  totalLeads: 2886, newLeads30d: 45, newLeadsPrev30d: 38,
  leadsDelta: 18, pipelineValue: 714000, pipelineCount: 100,
  wonThisMonth: 84250, wonLastMonth: 63000, wonDelta: 34,
  tasksDue: 3,
};

const BCF_KPI: KpiPayload = {
  totalLeads: 4609, newLeads30d: 28, newLeadsPrev30d: 31,
  leadsDelta: -10, pipelineValue: 128000, pipelineCount: 40,
  wonThisMonth: 0, wonLastMonth: 0, wonDelta: 0,
  tasksDue: 1,
};

describe("Group KPI aggregation", () => {
  const agg = aggregateKpis([BGR_KPI, BCF_KPI]);

  it("sums totalLeads", () => {
    expect(agg.totalLeads).toBe(7495);
  });

  it("sums pipelineValue", () => {
    expect(agg.pipelineValue).toBe(842000);
  });

  it("sums pipelineCount", () => {
    expect(agg.pipelineCount).toBe(140);
  });

  it("sums wonThisMonth", () => {
    expect(agg.wonThisMonth).toBe(84250);
  });

  it("sums newLeads30d", () => {
    expect(agg.newLeads30d).toBe(73);
  });

  it("calculates wonDelta from combined won values", () => {
    expect(agg.wonDelta).toBe(pctChange(84250, 63000));
  });

  it("sums tasksDue", () => {
    expect(agg.tasksDue).toBe(4);
  });

  it("handles a single payload without errors", () => {
    const single = aggregateKpis([BGR_KPI]);
    expect(single.totalLeads).toBe(BGR_KPI.totalLeads);
    expect(single.pipelineValue).toBe(BGR_KPI.pipelineValue);
  });
});
