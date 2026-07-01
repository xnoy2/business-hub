import type { ReactElement } from "react";
import * as I from "./icons";

/* NXPS wordmark used in the sidebar header / footer. */
export function NxpsLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="select-none leading-none">
      <div
        className="font-semibold tracking-[0.18em] text-gold-bright"
        style={{ fontSize: compact ? 18 : 22 }}
      >
        NXPS
      </div>
      <div
        className="tracking-[0.42em] text-muted"
        style={{ fontSize: compact ? 7.5 : 9, marginTop: 3 }}
      >
        BUSINESS HUB
      </div>
    </div>
  );
}

/* Per-business monogram shown in the switcher + topbar. */
export function BusinessMark({
  kind,
  size = 20,
}: {
  kind: "garden" | "frame" | "nx";
  size?: number;
}) {
  const style = { width: size, height: size };
  if (kind === "garden") return <I.IconGarden style={style} className="text-gold" />;
  if (kind === "frame") return <I.IconFrame style={style} className="text-gold" />;
  return (
    <span
      className="grid place-items-center font-semibold text-gold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      NX
    </span>
  );
}

/* Resolve a string icon key to a component (used by data-driven lists). */
const map: Record<string, (p: any) => ReactElement> = {
  dashboard: I.IconDashboard,
  client: I.IconClient,
  staff: I.IconStaff,
  sales: I.IconSales,
  garden: I.IconGarden,
  frame: I.IconFrame,
  ceo: I.IconCeo,
  ai: I.IconAi,
  calendar: I.IconCalendar,
  tasks: I.IconTasks,
  docs: I.IconDocs,
  reports: I.IconReports,
  settings: I.IconSettings,
  leads: I.IconLeads,
  pipeline: I.IconPipeline,
  money: I.IconMoney,
  clock: I.IconClock,
};

export function Icon({ name, ...props }: { name: string } & any) {
  const Cmp = map[name] ?? I.IconDashboard;
  return <Cmp {...props} />;
}
