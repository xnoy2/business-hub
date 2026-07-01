import { navItems, modules } from "@/lib/data";
import { Icon } from "./Brand";

/* Shown when a non-dashboard nav item is selected. Keeps the shell feeling
   complete while the module screens are built in later passes. */
export function ModulePlaceholder({ activeKey }: { activeKey: string }) {
  const nav = navItems.find((n) => n.key === activeKey);
  const mod = modules.find((m) => m.key === activeKey);
  const title = nav?.label ?? "Module";
  const desc = mod?.desc ?? "This module is part of the NXPS Business Hub roadmap.";

  return (
    <div className="grid place-items-center min-h-[60vh] rise">
      <div className="card max-w-md w-full text-center px-8 py-12">
        <span className="grid place-items-center w-16 h-16 mx-auto rounded-2xl border border-line bg-surface-2 text-gold">
          <Icon name={nav?.icon ?? "dashboard"} width={30} height={30} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>
        <span className="chip mt-5 inline-flex bg-gold/10 text-gold-bright border border-gold/20">
          Screen design — next pass
        </span>
        <p className="mt-4 text-[12px] text-faint">
          The dashboard + navigation shell is live. Tell me which module to design
          next and I’ll build it into this same shell.
        </p>
      </div>
    </div>
  );
}
