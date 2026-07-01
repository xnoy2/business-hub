"use client";

import { useState } from "react";
import type { Task } from "@/lib/data";

const dot: Record<Task["priority"], string> = {
  High: "bg-neg",
  Medium: "bg-warn",
  Low: "bg-pos",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [items, setItems] = useState(tasks);

  const toggle = (i: number) =>
    setItems((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t))
    );

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-ink">Tasks</h3>
        <button
          onClick={() => { window.location.hash = "tasks"; }}
          className="text-[13px] text-gold-bright hover:underline"
        >
          View all
        </button>
      </div>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/[0.03] transition"
          >
            <button
              onClick={() => toggle(i)}
              className={`grid place-items-center w-[18px] h-[18px] rounded-[6px] border transition ${
                t.done
                  ? "bg-gold border-gold text-[#0a0a0c]"
                  : "border-line-strong text-transparent hover:border-gold"
              }`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
            <span
              className={`flex-1 text-[13.5px] ${
                t.done ? "text-faint line-through" : "text-ink-soft"
              }`}
            >
              {t.title}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              Priority: {t.priority}
              <span className={`w-2 h-2 rounded-full ${dot[t.priority]}`} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
