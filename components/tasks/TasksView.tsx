"use client";

import { useEffect, useState } from "react";
import { businesses, dashboards, type BusinessId } from "@/lib/data";
import { IconCheck } from "@/components/icons";

interface TaskItem {
  id: string;
  title: string;
  business: BusinessId;
  priority: "High" | "Medium" | "Low";
  done: boolean;
  createdAt: string;
}

const STORAGE_KEY = "nxps_tasks";

const PRI_STYLE: Record<TaskItem["priority"], string> = {
  High:   "text-red-400   bg-red-400/10   border border-red-400/20",
  Medium: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
  Low:    "text-sky-400   bg-sky-400/10   border border-sky-400/20",
};

const BIZ_STYLE: Record<BusinessId, string> = {
  bgr:   "text-emerald-400 bg-emerald-400/10",
  bcf:   "text-sky-400     bg-sky-400/10",
  group: "text-gold        bg-gold/10",
};

const BIZ_LABEL: Record<BusinessId, string> = {
  bgr:   "BGR",
  bcf:   "BCF",
  group: "Group",
};

function seed(): TaskItem[] {
  const items: TaskItem[] = [];
  (["bgr", "bcf", "group"] as BusinessId[]).forEach((biz) => {
    dashboards[biz].tasks.forEach((t, i) => {
      items.push({
        id: `seed-${biz}-${i}`,
        title: t.title,
        business: biz,
        priority: t.priority as TaskItem["priority"],
        done: t.done,
        createdAt: new Date(Date.now() - i * 14_400_000).toISOString(),
      });
    });
  });
  return items;
}

export function TasksView({ businessId }: { businessId: BusinessId }) {
  const [tasks, setTasks]               = useState<TaskItem[]>([]);
  const [bizFilter, setBizFilter]       = useState<BusinessId | "all">("all");
  const [priFilter, setPriFilter]       = useState<TaskItem["priority"] | "all">("all");
  const [showDone, setShowDone]         = useState(false);
  const [adding, setAdding]             = useState(false);
  const [newTitle, setNewTitle]         = useState("");
  const [newPriority, setNewPriority]   = useState<TaskItem["priority"]>("Medium");
  const [newBiz, setNewBiz]             = useState<BusinessId>(businessId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const loaded: TaskItem[] = raw ? JSON.parse(raw) : seed();
      if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      setTasks(loaded);
    } catch {
      setTasks(seed());
    }
  }, []);

  const persist = (next: TaskItem[]) => {
    setTasks(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const toggle = (id: string) =>
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => persist(tasks.filter((t) => t.id !== id));

  const addTask = () => {
    if (!newTitle.trim()) return;
    persist([
      {
        id: `task-${Date.now()}`,
        title: newTitle.trim(),
        business: newBiz,
        priority: newPriority,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ]);
    setNewTitle("");
    setAdding(false);
  };

  const visible = tasks.filter((t) => {
    if (bizFilter !== "all" && t.business !== bizFilter) return false;
    if (priFilter !== "all" && t.priority !== priFilter) return false;
    if (!showDone && t.done) return false;
    return true;
  });

  const pending  = tasks.filter((t) => !t.done).length;
  const highPri  = tasks.filter((t) => !t.done && t.priority === "High").length;
  const done     = tasks.filter((t) => t.done).length;

  return (
    <div className="rise max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Tasks</h1>
          <p className="mt-0.5 text-sm text-muted">Track and manage tasks across all businesses.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-gold gap-2 shrink-0">
          + Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",       value: pending, color: "text-ink" },
          { label: "High Priority", value: highPri,  color: "text-red-400" },
          { label: "Completed",     value: done,     color: "text-pos" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[12px] text-faint mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add task inline */}
      {adding && (
        <div className="card p-4 mb-4 border border-gold/30">
          <p className="text-[12.5px] text-muted mb-3">New task</p>
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Task title…"
              className="field-input flex-1 min-w-[180px]"
            />
            <select
              value={newBiz}
              onChange={(e) => setNewBiz(e.target.value as BusinessId)}
              className="field-input w-36"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.short}</option>
              ))}
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskItem["priority"])}
              className="field-input w-28"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button onClick={addTask} className="btn-gold">Save</button>
            <button
              onClick={() => { setAdding(false); setNewTitle(""); }}
              className="px-3 py-2 text-[13px] text-muted hover:text-ink transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-lg border border-line overflow-hidden text-[12.5px]">
          {(["all", "bgr", "bcf", "group"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBizFilter(b)}
              className={`px-3 py-1.5 transition ${
                bizFilter === b ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ink-soft"
              }`}
            >
              {b === "all" ? "All" : BIZ_LABEL[b]}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-line overflow-hidden text-[12.5px]">
          {(["all", "High", "Medium", "Low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriFilter(p)}
              className={`px-3 py-1.5 transition ${
                priFilter === p ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ink-soft"
              }`}
            >
              {p === "all" ? "Priority" : p}
            </button>
          ))}
        </div>

        <label
          onClick={() => setShowDone((v) => !v)}
          className="flex items-center gap-2 text-[12.5px] text-muted cursor-pointer ml-auto select-none"
        >
          <span
            className={`grid place-items-center w-4 h-4 rounded border transition ${
              showDone ? "bg-gold border-gold text-[#0a0a0c]" : "border-line-strong"
            }`}
          >
            {showDone && <IconCheck width={10} height={10} />}
          </span>
          Show completed
        </label>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="card p-8 text-center text-[13px] text-muted">
            No tasks match the current filters.
          </div>
        ) : (
          visible.map((task) => (
            <div
              key={task.id}
              className={`card px-4 py-3 flex items-center gap-3 group transition ${
                task.done ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggle(task.id)}
                className={`shrink-0 grid place-items-center w-5 h-5 rounded-full border-2 transition ${
                  task.done
                    ? "bg-pos border-pos text-[#0a0a0c]"
                    : "border-line-strong hover:border-gold"
                }`}
              >
                {task.done && <IconCheck width={11} height={11} />}
              </button>

              <span
                className={`flex-1 text-[13.5px] ${
                  task.done ? "line-through text-faint" : "text-ink-soft"
                }`}
              >
                {task.title}
              </span>

              <span className={`chip text-[11px] ${PRI_STYLE[task.priority]}`}>
                {task.priority}
              </span>

              <span className={`chip text-[11px] ${BIZ_STYLE[task.business]}`}>
                {BIZ_LABEL[task.business]}
              </span>

              <button
                onClick={() => remove(task.id)}
                className="opacity-0 group-hover:opacity-100 text-faint hover:text-red-400 text-lg leading-none transition ml-1"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
