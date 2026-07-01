"use client";

import { navItems, liveModuleKeys } from "@/lib/data";
import { Icon, NxpsLogo } from "./Brand";

export function Sidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-line bg-surface/40">
      <div className="px-6 pt-6 pb-5">
        <NxpsLogo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`nav-item w-full text-left ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon name={item.icon} width={19} height={19} />
              <span className="truncate flex-1">{item.label}</span>
              {liveModuleKeys.has(item.key) && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-pos shrink-0"
                  title="Connected to live site"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-line">
        <NxpsLogo compact />
        <p className="mt-3 text-[11px] text-faint">v1.0.0</p>
      </div>
    </aside>
  );
}
