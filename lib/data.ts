/* ============================================================
   NXPS Business Hub — Mock data
   Per-business datasets power the workspace switcher so the
   dashboard re-renders with the selected brand's numbers.
   ============================================================ */

export type BusinessId = "bgr" | "bcf" | "group";

export interface Business {
  id: BusinessId;
  name: string;
  short: string;
  tag: string;
  monogram: "garden" | "frame" | "nx";
}

export const businesses: Business[] = [
  { id: "bgr", name: "Bespoke Garden Rooms", short: "Garden Rooms", tag: "Ballycastle", monogram: "garden" },
  { id: "bcf", name: "Ballycastle Climbing Frames", short: "Climbing Frames", tag: "Ballycastle", monogram: "frame" },
  { id: "group", name: "NXPS Group (Holding)", short: "NXPS Group", tag: "Holding", monogram: "nx" },
];

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  caption: string;
  icon: "leads" | "pipeline" | "money" | "clock" | "tasks";
}

export interface Activity {
  text: string;
  time: string;
  kind: "lead" | "quote" | "project" | "marketing" | "staff";
}

export interface Task {
  title: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
}

export interface DashboardData {
  kpis: Kpi[];
  activity: Activity[];
  tasks: Task[];
  chart: number[]; // 12-point sales-over-time series (in £k)
  chartLabels: string[];
  wonValue: string;
  wonDelta: string;
}

export const dashboards: Record<BusinessId, DashboardData> = {
  bgr: {
    wonValue: "£84,250",
    wonDelta: "32%",
    kpis: [
      { label: "Total Leads", value: "128", delta: "24%", trend: "up", caption: "vs last 30 days", icon: "leads" },
      { label: "Sales Pipeline", value: "£342,500", delta: "18%", trend: "up", caption: "vs last 30 days", icon: "pipeline" },
      { label: "Won This Month", value: "£84,250", delta: "32%", trend: "up", caption: "vs last 30 days", icon: "money" },
      { label: "Avg. Response", value: "1.4h", delta: "12%", trend: "down", caption: "faster vs last 30 days", icon: "clock" },
      { label: "Tasks Due", value: "14", delta: "View all tasks", trend: "up", caption: "", icon: "tasks" },
    ],
    activity: [
      { text: "New lead from Website", time: "2 mins ago", kind: "lead" },
      { text: "Garden room quote approved", time: "1 hour ago", kind: "quote" },
      { text: "New project: GR-2026-045", time: "2 hours ago", kind: "project" },
      { text: "Instagram campaign started", time: "5 hours ago", kind: "marketing" },
      { text: "New staff member added", time: "1 day ago", kind: "staff" },
    ],
    tasks: [
      { title: "Follow up with John S.", priority: "High", done: false },
      { title: "Send proposal to Sarah", priority: "Medium", done: false },
      { title: "Review BCF quote", priority: "Medium", done: false },
      { title: "Team meeting", priority: "Low", done: true },
    ],
    chart: [8, 11, 14, 13, 19, 24, 31, 38, 47, 61, 72, 84],
    chartLabels: ["May 1", "", "", "May 8", "", "", "May 15", "", "", "May 22", "", "May 29"],
  },
  bcf: {
    wonValue: "£41,900",
    wonDelta: "21%",
    kpis: [
      { label: "Total Leads", value: "73", delta: "16%", trend: "up", caption: "vs last 30 days", icon: "leads" },
      { label: "Sales Pipeline", value: "£128,400", delta: "9%", trend: "up", caption: "vs last 30 days", icon: "pipeline" },
      { label: "Won This Month", value: "£41,900", delta: "21%", trend: "up", caption: "vs last 30 days", icon: "money" },
      { label: "Avg. Response", value: "2.1h", delta: "5%", trend: "down", caption: "faster vs last 30 days", icon: "clock" },
      { label: "Tasks Due", value: "9", delta: "View all tasks", trend: "up", caption: "", icon: "tasks" },
    ],
    activity: [
      { text: "New lead from Facebook Ad", time: "8 mins ago", kind: "lead" },
      { text: "Climbing frame quote sent", time: "40 mins ago", kind: "quote" },
      { text: "New project: BCF-2026-118", time: "3 hours ago", kind: "project" },
      { text: "School framework enquiry", time: "6 hours ago", kind: "lead" },
      { text: "Installer onboarded", time: "2 days ago", kind: "staff" },
    ],
    tasks: [
      { title: "Confirm site survey — Ortega", priority: "High", done: false },
      { title: "Surfacing options to playgroup", priority: "Medium", done: false },
      { title: "Order timber batch #44", priority: "High", done: false },
      { title: "Update product photos", priority: "Low", done: true },
    ],
    chart: [4, 6, 5, 9, 12, 14, 18, 21, 26, 30, 36, 42],
    chartLabels: ["May 1", "", "", "May 8", "", "", "May 15", "", "", "May 22", "", "May 29"],
  },
  group: {
    wonValue: "£126,150",
    wonDelta: "28%",
    kpis: [
      { label: "Total Leads", value: "201", delta: "21%", trend: "up", caption: "across all brands", icon: "leads" },
      { label: "Sales Pipeline", value: "£470,900", delta: "15%", trend: "up", caption: "across all brands", icon: "pipeline" },
      { label: "Won This Month", value: "£126,150", delta: "28%", trend: "up", caption: "across all brands", icon: "money" },
      { label: "Avg. Response", value: "1.7h", delta: "9%", trend: "down", caption: "blended average", icon: "clock" },
      { label: "Tasks Due", value: "23", delta: "View all tasks", trend: "up", caption: "", icon: "tasks" },
    ],
    activity: [
      { text: "Garden Rooms hit monthly target", time: "1 hour ago", kind: "quote" },
      { text: "Group cashflow report generated", time: "3 hours ago", kind: "project" },
      { text: "Climbing Frames new lead surge", time: "5 hours ago", kind: "lead" },
      { text: "Cross-brand campaign launched", time: "1 day ago", kind: "marketing" },
      { text: "Q2 board pack uploaded", time: "2 days ago", kind: "project" },
    ],
    tasks: [
      { title: "Approve Q2 marketing budget", priority: "High", done: false },
      { title: "Review group cashflow", priority: "High", done: false },
      { title: "Consolidate brand reporting", priority: "Medium", done: false },
      { title: "Board meeting prep", priority: "Medium", done: true },
    ],
    chart: [12, 17, 19, 22, 31, 38, 49, 59, 73, 91, 108, 126],
    chartLabels: ["May 1", "", "", "May 8", "", "", "May 15", "", "", "May 22", "", "May 29"],
  },
};

export interface ModuleDef {
  key: string;
  title: string;
  desc: string;
  icon:
    | "client" | "staff" | "sales" | "garden" | "frame" | "ceo" | "ai";
}

export const modules: ModuleDef[] = [
  { key: "bgr-portal", title: "BGR Client Portal", desc: "Bespoke Garden Rooms client projects, quotes and communications.", icon: "garden" },
  { key: "bcf-portal", title: "BCF Client Portal", desc: "Ballycastle Climbing Frames client projects, quotes and communications.", icon: "frame" },
  { key: "staff", title: "Staff Portal", desc: "Access HR, training, SOPs, tasks and internal resources.", icon: "staff" },
  { key: "sales", title: "Sales Tracker", desc: "Track leads, pipeline, conversions and team performance.", icon: "sales" },
  { key: "garden", title: "Garden Room Configurator", desc: "Configure, price and visualise bespoke garden rooms.", icon: "garden" },
  { key: "bcf", title: "BCF Configurator", desc: "Design and price climbing frames and playground solutions.", icon: "frame" },
  { key: "ceo", title: "CEO Dashboard", desc: "Real-time overview of the business and key performance metrics.", icon: "ceo" },
  { key: "ai", title: "Marketing AI", desc: "AI tools for content creation, campaigns, SEO and more.", icon: "ai" },
];

/* ============================================================
   Integration map — existing live sites embedded by the Hub.
   The Client Portal is business-aware: it follows the workspace
   switcher to the matching brand's portal.
   ============================================================ */
const staticModuleUrls: Record<string, string> = {
  "bgr-portal": "https://portal.bespokegardenroomsballycastle.co.uk/login",
  "bcf-portal": "https://portal.ballycastleclimbingframes.co.uk/login",
  staff:        "https://staff.bespokegardenroomsballycastle.co.uk/",
  sales:        "https://sales-dashboard.ballycastleclimbingframes.co.uk/login",
  ai:           "https://revenueai.ballycastleclimbingframes.co.uk/",
  ceo:          "https://dashboard.bespokegardenroomsballycastle.co.uk/",
  bcf:          "https://portal.ballycastleclimbingframes.co.uk/configurator",
  garden:       "https://bgr-configurator-app.vercel.app/",
};

/** Module keys that are backed by a live, deployed site. */
export const liveModuleKeys = new Set([
  "bgr-portal",
  "bcf-portal",
  "staff",
  "sales",
  "ai",
  "ceo",
  "bcf",
  "garden",
]);

/** Resolve a module's embed URL for the current business, or null if "to build". */
export function resolveModuleUrl(
  moduleKey: string,
  _businessId: BusinessId
): string | null {
  return staticModuleUrls[moduleKey] ?? null;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { key: "dashboard",  label: "Dashboard",            icon: "dashboard" },
  { key: "bgr-portal", label: "BGR Client Portal",    icon: "client" },
  { key: "bcf-portal", label: "BCF Client Portal",    icon: "client" },
  { key: "staff",      label: "Staff Portal",         icon: "staff" },
  { key: "sales",      label: "Sales Tracker",        icon: "sales" },
  { key: "garden",     label: "Garden Room Conf...",  icon: "garden" },
  { key: "bcf",        label: "BCF Configurator",     icon: "frame" },
  { key: "ceo",        label: "CEO Dashboard",        icon: "ceo" },
  { key: "ai",         label: "Marketing AI",         icon: "ai" },
  { key: "tasks",      label: "Tasks",                icon: "tasks" },
  { key: "documents",  label: "Documents",            icon: "docs" },
  { key: "reports",    label: "Reports",              icon: "reports" },
  { key: "settings",   label: "Settings",             icon: "settings" },
];
