"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  businesses,
  dashboards,
  modules,
  resolveModuleUrl,
  liveModuleKeys,
  navItems,
  type BusinessId,
} from "@/lib/data";
import { getSession, signIn, type Session } from "@/lib/auth";
import { useGhlKpis, fmtGBP, fmtNum } from "@/hooks/useGhlKpis";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { EmbeddedView } from "@/components/EmbeddedView";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TaskList } from "@/components/dashboard/TaskList";
import { IntegrationCard, HelpCard } from "@/components/dashboard/SidePanels";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { HelpPanel } from "@/components/HelpPanel";
import { ProfileModal } from "@/components/ProfileModal";
import { TasksView } from "@/components/tasks/TasksView";
import { DocumentsView } from "@/components/documents/DocumentsView";
import { ReportsView } from "@/components/reports/ReportsView";
import type { KpiPayload } from "@/app/api/ghl/kpis/route";

export default function Page() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [bizId, setBizId] = useState<BusinessId>("bgr");
  const [active, setActive] = useState("dashboard");

  // Panel open states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth gate — try localStorage first, then fall back to server session cookie
  useEffect(() => {
    const local = getSession();
    if (local) {
      setSession(local);
      setChecked(true);
      return;
    }
    // No localStorage entry — middleware may have let us in via cookie.
    // Re-hydrate display session from the server.
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          const s = signIn(json.email, json.name, json.role);
          setSession(s);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecked(true));
  }, [router]);

  // Deep-link the active module via the URL hash (e.g. #sales)
  useEffect(() => {
    const fromHash = () => {
      const key = window.location.hash.replace(/^#/, "");
      if (key && navItems.some((n) => n.key === key)) setActive(key);
      else if (!key) setActive("dashboard");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // ⌘K / Ctrl+K opens command palette from anywhere
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Custom event fired by search bar click in Topbar
  useEffect(() => {
    const handler = () => setPaletteOpen(true);
    document.addEventListener("nxps:openSearch", handler);
    return () => document.removeEventListener("nxps:openSearch", handler);
  }, []);

  // Derive unread notification count from activity feed + last-seen timestamp
  useEffect(() => {
    const SEEN_KEY = "nxps_notif_seen_at";
    fetch(`/api/ghl/activity?business=${bizId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok || !Array.isArray(json.items)) return;
        const seenAt = Number(localStorage.getItem(SEEN_KEY) ?? 0);
        const count = json.items.filter(
          (item: { isoTime: string }) => new Date(item.isoTime).getTime() > seenAt
        ).length;
        setUnreadCount(count);
      })
      .catch(() => {});
  }, [bizId]);

  const handleNotificationsOpen = () => {
    setNotificationsOpen(true);
    setUnreadCount(0);
    localStorage.setItem("nxps_notif_seen_at", String(Date.now()));
  };

  const select = (key: string) => {
    if (key === "settings") { router.push("/settings"); return; }
    setActive(key);
    window.location.hash = key === "dashboard" ? "" : key;
  };

  const business = businesses.find((b) => b.id === bizId)!;
  const data = dashboards[bizId];
  const embedUrl = active !== "dashboard" ? resolveModuleUrl(active, bizId) : null;
  const activeLabel = navItems.find((n) => n.key === active)?.label ?? "Module";

  // Live GHL KPIs (polled every 5 min)
  const ghl = useGhlKpis(bizId);

  if (!checked || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <span className="w-7 h-7 rounded-full border-2 border-line border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onSelect={select} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          current={business}
          onSwitch={setBizId}
          session={session}
          onNotifications={handleNotificationsOpen}
          onHelp={() => setHelpOpen(true)}
          onSearch={() => setPaletteOpen(true)}
          onProfile={() => setProfileOpen(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 px-5 lg:px-8 py-7">
          {active === "dashboard" ? (
            <Dashboard
              key={bizId}
              business={business}
              data={data}
              onLaunch={select}
              ghlData={ghl.data}
              ghlLoading={ghl.loading}
              ghlConfigured={ghl.configured}
              bizId={bizId}
              onHelp={() => setHelpOpen(true)}
              userName={session.name.split(" ")[0]}
            />
          ) : active === "tasks" ? (
            <TasksView key={bizId} businessId={bizId} />
          ) : active === "documents" ? (
            <DocumentsView businessId={bizId} />
          ) : active === "reports" ? (
            <ReportsView businessId={bizId} ghlData={ghl.data} />
          ) : embedUrl ? (
            <EmbeddedView
              key={`${active}-${bizId}`}
              title={activeLabel}
              url={embedUrl}
              businessName={business.name}
            />
          ) : (
            <ModulePlaceholder activeKey={active} />
          )}

          {!embedUrl && (
            <footer className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-faint">
              <span>© 2026 NXPS. All rights reserved.</span>
              <span className="text-muted">One Login. All Your Business.</span>
              <span className="flex gap-5">
                <button className="hover:text-ink-soft transition">Privacy Policy</button>
                <button className="hover:text-ink-soft transition">Terms of Service</button>
              </span>
            </footer>
          )}
        </main>
      </div>

      {/* Panels — rendered outside the scroll container so they overlay everything */}
      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        businessId={bizId}
      />
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        session={session}
        onUpdate={(s) => setSession(s)}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={select}
        businessId={bizId}
      />
    </div>
  );
}

function Dashboard({
  business,
  data,
  onLaunch,
  ghlData,
  ghlLoading,
  ghlConfigured,
  bizId,
  onHelp,
  userName,
}: {
  business: { name: string; short: string };
  data: (typeof dashboards)[BusinessId];
  onLaunch: (key: string) => void;
  ghlData: KpiPayload | null;
  ghlLoading: boolean;
  ghlConfigured: boolean;
  bizId: BusinessId;
  onHelp: () => void;
  userName: string;
}) {
  // Map live GHL values to the appropriate KPI card by its label.
  // Returns override props; undefined keys fall back to mock data in KpiCard.
  const liveOverrides = (label: string) => {
    if (!ghlConfigured || !ghlData) return { demo: !ghlConfigured };

    switch (label) {
      case "Total Leads":
        return {
          liveValue: fmtNum(ghlData.totalLeads),
          liveDelta: undefined,
          liveTrend: undefined,
          demo: false,
        };
      case "Sales Pipeline":
        return {
          liveValue: fmtGBP(ghlData.pipelineValue),
          liveDelta: `${ghlData.pipelineCount} deals`,
          liveTrend: undefined,
          demo: false,
        };
      case "Won This Month":
        return {
          liveValue: fmtGBP(ghlData.wonThisMonth),
          liveDelta: `${Math.abs(ghlData.wonDelta)}%`,
          liveTrend: (ghlData.wonDelta >= 0 ? "up" : "down") as "up" | "down",
          demo: false,
        };
      case "Tasks Due":
        return {
          liveValue: String(ghlData.tasksDue),
          liveDelta: "today",
          liveTrend: undefined,
          demo: false,
        };
      default:
        // "Avg. Response" — no GHL source yet, stay on mock
        return { demo: true };
    }
  };

  return (
    <div className="rise">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">
          Welcome back, {userName} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here's what's happening across {business.name} today.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {data.kpis.map((k, i) => {
          const overrides = liveOverrides(k.label);
          return (
            <KpiCard
              key={k.label}
              kpi={k}
              index={i}
              loading={ghlLoading && !ghlConfigured && i < 4}
              {...overrides}
            />
          );
        })}
      </div>

      {/* Module launcher + side rail */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((m, i) => (
              <ModuleCard
                key={m.key}
                mod={m}
                index={i}
                live={liveModuleKeys.has(m.key)}
                onLaunch={onLaunch}
              />
            ))}
          </div>

          {/* Sales + tasks */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart
              data={data.chart}
              labels={data.chartLabels}
              wonValue={ghlConfigured && ghlData ? fmtGBP(ghlData.wonThisMonth) : data.wonValue}
              wonDelta={ghlConfigured && ghlData ? `${ghlData.wonDelta >= 0 ? "+" : ""}${ghlData.wonDelta}%` : data.wonDelta}
            />
            <TaskList tasks={data.tasks} />
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <ActivityFeed businessId={bizId} />
          <IntegrationCard />
          <HelpCard onHelp={onHelp} />
        </div>
      </div>
    </div>
  );
}
