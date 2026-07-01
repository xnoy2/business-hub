import type { ModuleDef } from "@/lib/data";
import { Icon } from "../Brand";
import { IconArrow } from "../icons";

export function ModuleCard({
  mod,
  index,
  live,
  onLaunch,
}: {
  mod: ModuleDef;
  index: number;
  live?: boolean;
  onLaunch: (key: string) => void;
}) {
  return (
    <div
      className="card card-hover group relative flex flex-col items-center text-center px-5 py-7 rise"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {live && (
        <span className="chip absolute top-3 right-3 bg-pos/12 text-pos">
          <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Live
        </span>
      )}
      <span className="grid place-items-center w-14 h-14 rounded-2xl border border-line bg-surface-2 text-gold group-hover:border-gold/50 group-hover:text-gold-bright transition">
        <Icon name={mod.icon} width={26} height={26} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{mod.title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted min-h-[38px]">
        {mod.desc}
      </p>
      <button
        onClick={() => onLaunch(mod.key)}
        className="btn-ghost mt-4 group-hover:border-gold group-hover:text-gold-bright"
      >
        Launch <IconArrow width={15} height={15} />
      </button>
    </div>
  );
}
