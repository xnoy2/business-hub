/* Lightweight inline icon set (stroke-based, inherits currentColor).
   Avoids an external icon dependency while keeping a consistent line weight. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12 12 3l9 9" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
  </svg>
);
export const IconClient = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 13h5M8 16h8" />
  </svg>
);
export const IconStaff = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 11a3 3 0 0 0 0-6M21 20c0-2.6-1.7-4.8-4-5.6" />
  </svg>
);
export const IconSales = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19V5M20 19H4" />
    <path d="m7 14 3-3 3 2 4-5" />
    <path d="M17 8h2v2" />
  </svg>
);
export const IconGarden = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 21h18" />
    <path d="M4 21V9l8-5 8 5v12" />
    <path d="M9 21v-6h6v6" />
  </svg>
);
export const IconFrame = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 21V6l8-3 8 3v15" />
    <path d="M4 6h16M9 9v12M15 9v12" />
  </svg>
);
export const IconCeo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12V3M12 12l7 4" />
  </svg>
);
export const IconAi = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5.2A3 3 0 0 0 18 6a3 3 0 0 0-3-3 3 3 0 0 0-3 1 3 3 0 0 0-3-1Z" />
    <path d="M12 7v11" />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
);
export const IconTasks = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);
export const IconDocs = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
export const IconReports = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 21V3M20 21H4" />
    <rect x="7" y="11" width="3" height="7" />
    <rect x="12" y="7" width="3" height="11" />
    <rect x="17" y="13" width="3" height="5" />
  </svg>
);
export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);
export const IconHelp = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" />
    <path d="M12 17h.01" />
  </svg>
);
export const IconChevron = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconArrow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const IconUsers = (p: IconProps) => IconStaff(p);
export const IconLeads = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M21 7v5h-5" />
  </svg>
);
export const IconPipeline = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="5" y="10" width="14" height="4" rx="1" />
    <rect x="7" y="16" width="10" height="4" rx="1" />
  </svg>
);
export const IconMoney = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.8 2.5 2 2.5.6 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 15M12 6v1.5M12 16.5V18" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
