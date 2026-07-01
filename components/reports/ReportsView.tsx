"use client";

import { useState } from "react";
import type { BusinessId } from "@/lib/data";
import type { KpiPayload } from "@/app/api/ghl/kpis/route";
import type { ReportPayload, PipelineRow, WonRow, LeadSourceRow, WonMonthRow } from "@/app/api/ghl/report-data/route";
import { fmtGBP, fmtNum } from "@/hooks/useGhlKpis";

const BIZ_LABEL: Record<BusinessId, string> = { bgr: "BGR", bcf: "BCF", group: "Group" };

type Category = "sales" | "finance" | "marketing" | "operations";

interface ReportDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: Category;
  formats: ("PDF" | "XLSX" | "CSV")[];
  dataType?: string;    // maps to ?type= param on the API
  comingSoon?: boolean;
}

const REPORTS: ReportDef[] = [
  {
    id: "sales-pipeline",
    title: "Sales Pipeline Report",
    desc: "All open deals with contact name, stage, and value.",
    icon: "📊",
    category: "sales",
    formats: ["CSV"],
    dataType: "pipeline",
  },
  {
    id: "won-deals",
    title: "Won Deals — This Month",
    desc: "Closed-won opportunities this month, sorted by value.",
    icon: "🏆",
    category: "sales",
    formats: ["CSV"],
    dataType: "won",
  },
  {
    id: "lead-analysis",
    title: "Lead Source Breakdown",
    desc: "Where contacts are coming from — website, social, referral, campaigns.",
    icon: "📈",
    category: "sales",
    formats: ["CSV"],
    dataType: "leads",
  },
  {
    id: "won-trend",
    title: "Won Revenue — 6 Month Trend",
    desc: "Monthly won deal value over the last 6 months.",
    icon: "📉",
    category: "sales",
    formats: ["CSV"],
    dataType: "won-trend",
  },
  {
    id: "cashflow",
    title: "Cashflow Forecast",
    desc: "Projected revenue and outgoings — requires accounting software integration.",
    icon: "💷",
    category: "finance",
    formats: ["PDF", "XLSX"],
    comingSoon: true,
  },
  {
    id: "monthly-pl",
    title: "Monthly P&L Summary",
    desc: "Revenue, costs, and margin — requires Xero / QuickBooks integration.",
    icon: "📋",
    category: "finance",
    formats: ["PDF", "XLSX"],
    comingSoon: true,
  },
  {
    id: "marketing-roi",
    title: "Marketing ROI Report",
    desc: "Campaign performance and cost per lead — requires ad platform integration.",
    icon: "🎯",
    category: "marketing",
    formats: ["PDF", "CSV"],
    comingSoon: true,
  },
  {
    id: "task-completion",
    title: "Task Completion Report",
    desc: "Team task completion rates — powered by NXPS task data.",
    icon: "✅",
    category: "operations",
    formats: ["CSV"],
    comingSoon: true,
  },
];

const CAT_LABEL: Record<Category, string> = {
  sales: "Sales", finance: "Finance", marketing: "Marketing", operations: "Operations",
};
const CAT_COLOR: Record<Category, string> = {
  sales:      "text-gold        bg-gold/10        border-gold/20",
  finance:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  marketing:  "text-purple-400  bg-purple-400/10  border-purple-400/20",
  operations: "text-sky-400     bg-sky-400/10     border-sky-400/20",
};

// ── CSV export ────────────────────────────────────────────────────────────────
function downloadCsv(filename: string, rows: string[][], headers: string[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportReport(report: ReportDef, biz: BusinessId, data: ReportPayload) {
  const date = new Date().toISOString().slice(0, 10);
  const base = `${report.id}-${BIZ_LABEL[biz]}-${date}`;

  if (data.type === "pipeline") {
    downloadCsv(`${base}.csv`,
      data.rows.map((r: PipelineRow) => [r.name, r.contact, r.value.toFixed(2), r.stage, new Date(r.createdAt).toLocaleDateString("en-GB")]),
      ["Deal Name", "Contact", "Value (£)", "Stage", "Created"]
    );
  } else if (data.type === "won") {
    downloadCsv(`${base}.csv`,
      data.rows.map((r: WonRow) => [r.name, r.contact, r.value.toFixed(2), new Date(r.wonAt).toLocaleDateString("en-GB")]),
      ["Deal Name", "Contact", "Value (£)", "Won Date"]
    );
  } else if (data.type === "leads") {
    downloadCsv(`${base}.csv`,
      data.rows.map((r: LeadSourceRow) => [r.source, r.count.toString(), r.thisMonth.toString()]),
      ["Source", "Total Contacts", "New This Month"]
    );
  } else if (data.type === "won-trend") {
    downloadCsv(`${base}.csv`,
      data.rows.map((r: WonMonthRow) => [r.month, r.value.toFixed(2), r.count.toString()]),
      ["Month", "Won Value (£)", "Deals Won"]
    );
  }
}

// ── Report data tables ────────────────────────────────────────────────────────
function PipelineTable({ data }: { data: Extract<ReportPayload, { type: "pipeline" }> }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-[12.5px]">
        <span className="text-muted">Open deals: <span className="text-ink font-semibold">{data.total}</span></span>
        <span className="text-muted">Total value: <span className="text-ink font-semibold">{fmtGBP(data.totalValue)}</span></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-faint text-left">
              <th className="pb-2 font-normal">Deal</th>
              <th className="pb-2 font-normal">Contact</th>
              <th className="pb-2 font-normal text-right">Value</th>
              <th className="pb-2 font-normal">Stage</th>
              <th className="pb-2 font-normal">Added</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.slice(0, 20).map((r) => (
              <tr key={r.id} className="border-b border-line/50 hover:bg-white/[0.02] transition">
                <td className="py-2 text-ink-soft max-w-[180px] truncate pr-4">{r.name}</td>
                <td className="py-2 text-muted pr-4">{r.contact}</td>
                <td className="py-2 text-right font-medium text-gold tabular-nums">{fmtGBP(r.value)}</td>
                <td className="py-2 text-muted pr-4">{r.stage}</td>
                <td className="py-2 text-faint whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.rows.length > 20 && (
          <p className="text-[11.5px] text-faint mt-2 text-center">
            Showing 20 of {data.rows.length} deals. Export CSV for the full list.
          </p>
        )}
      </div>
    </div>
  );
}

function WonTable({ data }: { data: Extract<ReportPayload, { type: "won" }> }) {
  if (data.rows.length === 0) {
    return <p className="text-[13px] text-muted py-2">No won deals recorded this month yet.</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-[12.5px]">
        <span className="text-muted">Deals won: <span className="text-ink font-semibold">{data.count}</span></span>
        <span className="text-muted">Total value: <span className="text-pos font-semibold">{fmtGBP(data.totalValue)}</span></span>
      </div>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-faint text-left">
            <th className="pb-2 font-normal">Deal</th>
            <th className="pb-2 font-normal">Contact</th>
            <th className="pb-2 font-normal text-right">Value</th>
            <th className="pb-2 font-normal">Won</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.id} className="border-b border-line/50 hover:bg-white/[0.02] transition">
              <td className="py-2 text-ink-soft max-w-[180px] truncate pr-4">{r.name}</td>
              <td className="py-2 text-muted pr-4">{r.contact}</td>
              <td className="py-2 text-right font-medium text-pos tabular-nums">{fmtGBP(r.value)}</td>
              <td className="py-2 text-faint whitespace-nowrap">
                {new Date(r.wonAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTable({ data }: { data: Extract<ReportPayload, { type: "leads" }> }) {
  const maxCount = Math.max(...data.rows.map((r) => r.count), 1);
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-muted">
        Total contacts tracked: <span className="text-ink font-semibold">{fmtNum(data.totalContacts)}</span>
      </p>
      <div className="space-y-2">
        {data.rows.slice(0, 12).map((r) => (
          <div key={r.source} className="space-y-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-soft truncate max-w-[200px]">{r.source}</span>
              <span className="text-faint tabular-nums ml-4">
                {r.count} total · <span className="text-gold">{r.thisMonth} this month</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold/60"
                style={{ width: `${(r.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WonTrendTable({ data }: { data: Extract<ReportPayload, { type: "won-trend" }> }) {
  const maxVal = Math.max(...data.rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2">
      {data.rows.map((r) => (
        <div key={r.month} className="space-y-1">
          <div className="flex justify-between text-[12px]">
            <span className="text-ink-soft w-24">{r.month}</span>
            <span className="text-faint tabular-nums">
              {r.count} deal{r.count !== 1 ? "s" : ""} · <span className="text-pos">{fmtGBP(r.value)}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-pos/60"
              style={{ width: `${(r.value / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ReportsView({
  businessId,
  ghlData,
}: {
  businessId: BusinessId;
  ghlData: KpiPayload | null;
}) {
  const [catFilter, setCatFilter]       = useState<Category | "all">("all");
  const [loading, setLoading]           = useState<string | null>(null);
  const [results, setResults]           = useState<Record<string, ReportPayload>>({});
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [expanded, setExpanded]         = useState<Set<string>>(new Set());

  const generate = async (report: ReportDef) => {
    if (!report.dataType) return;
    setLoading(report.id);
    setErrors((e) => { const n = { ...e }; delete n[report.id]; return n; });

    try {
      const res = await fetch(`/api/ghl/report-data?type=${report.dataType}&business=${businessId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "API error");
      setResults((r) => ({ ...r, [report.id]: json }));
      setExpanded((s) => new Set([...s, report.id]));
    } catch (err) {
      setErrors((e) => ({ ...e, [report.id]: err instanceof Error ? err.message : "Failed to load" }));
    } finally {
      setLoading(null);
    }
  };

  const toggle = (id: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = REPORTS.filter((r) => catFilter === "all" || r.category === catFilter);

  return (
    <div className="rise max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">Reports</h1>
        <p className="mt-0.5 text-sm text-muted">
          Live data from GHL for {BIZ_LABEL[businessId]}.
        </p>
      </div>

      {/* Live KPI summary */}
      {ghlData && (
        <div className="card p-5 mb-6 border border-gold/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pos animate-pulse" />
            <span className="text-[12px] text-pos font-medium">Live GHL Data — {BIZ_LABEL[businessId]}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Leads",    value: fmtNum(ghlData.totalLeads) },
              { label: "Pipeline",       value: fmtGBP(ghlData.pipelineValue) },
              { label: "Won This Month", value: fmtGBP(ghlData.wonThisMonth) },
              { label: "Open Deals",     value: fmtNum(ghlData.pipelineCount) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[20px] font-bold text-ink">{s.value}</div>
                <div className="text-[11px] text-faint mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex rounded-lg border border-line overflow-hidden text-[12.5px] w-fit mb-6">
        {(["all", "sales", "finance", "marketing", "operations"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-4 py-1.5 transition capitalize ${
              catFilter === c ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ink-soft"
            }`}
          >
            {c === "all" ? "All" : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const isLoading = loading === r.id;
          const data = results[r.id];
          const isExpanded = expanded.has(r.id);
          const err = errors[r.id];

          return (
            <div key={r.id} className="card overflow-hidden">
              {/* Card header row */}
              <div className="p-5 flex items-start gap-3">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-semibold text-ink">{r.title}</h3>
                    <span className={`chip text-[10px] border ${CAT_COLOR[r.category]}`}>
                      {CAT_LABEL[r.category]}
                    </span>
                    {r.comingSoon && (
                      <span className="chip text-[10px] text-faint border border-line">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{r.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {data && (
                    <>
                      <button
                        onClick={() => exportReport(r, businessId, data)}
                        className="text-[12px] text-gold-bright hover:underline"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => toggle(r.id)}
                        className="text-[12px] text-muted hover:text-ink-soft"
                      >
                        {isExpanded ? "Hide" : "Show"}
                      </button>
                    </>
                  )}
                  {!r.comingSoon && (
                    <button
                      onClick={() => generate(r)}
                      disabled={isLoading}
                      className="btn-gold py-1.5 px-4 text-[12.5px] gap-2 disabled:opacity-70 shrink-0"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-[#0a0a0c]/30 border-t-[#0a0a0c] animate-spin" />
                          Loading…
                        </>
                      ) : data ? "Refresh" : "Generate"}
                    </button>
                  )}
                </div>
              </div>

              {/* Formats */}
              <div className="px-5 pb-4 flex items-center gap-1.5">
                {r.formats.map((f) => (
                  <span key={f} className="chip text-[10px] text-faint border border-line">{f}</span>
                ))}
              </div>

              {/* Error */}
              {err && (
                <div className="mx-5 mb-4 px-3 py-2 rounded-lg bg-neg/10 border border-neg/20 text-[12.5px] text-neg">
                  {err}
                </div>
              )}

              {/* Expanded data */}
              {data && isExpanded && (
                <div className="border-t border-line mx-5 mb-5 pt-4">
                  {data.type === "pipeline"   && <PipelineTable  data={data} />}
                  {data.type === "won"        && <WonTable       data={data} />}
                  {data.type === "leads"      && <LeadsTable     data={data} />}
                  {data.type === "won-trend"  && <WonTrendTable  data={data} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
