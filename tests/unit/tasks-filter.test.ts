import { describe, it, expect } from "vitest";

// Mirror the filtering logic from TasksView
type Priority = "High" | "Medium" | "Low";
type BizId = "bgr" | "bcf" | "group";

interface Task {
  id: string;
  title: string;
  business: BizId;
  priority: Priority;
  done: boolean;
}

function filterTasks(
  tasks: Task[],
  bizFilter: BizId | "all",
  priFilter: Priority | "all",
  showDone: boolean
): Task[] {
  return tasks.filter((t) => {
    if (bizFilter !== "all" && t.business !== bizFilter) return false;
    if (priFilter !== "all" && t.priority !== priFilter) return false;
    if (!showDone && t.done) return false;
    return true;
  });
}

const TASKS: Task[] = [
  { id: "1", title: "Task A", business: "bgr", priority: "High",   done: false },
  { id: "2", title: "Task B", business: "bcf", priority: "Medium", done: false },
  { id: "3", title: "Task C", business: "bgr", priority: "Low",    done: true  },
  { id: "4", title: "Task D", business: "group", priority: "High", done: false },
  { id: "5", title: "Task E", business: "bcf", priority: "High",   done: true  },
];

describe("task filtering", () => {
  it("returns all pending tasks when no filters are set", () => {
    const result = filterTasks(TASKS, "all", "all", false);
    expect(result).toHaveLength(3);
    expect(result.every((t) => !t.done)).toBe(true);
  });

  it("includes done tasks when showDone is true", () => {
    const result = filterTasks(TASKS, "all", "all", true);
    expect(result).toHaveLength(5);
  });

  it("filters by business correctly", () => {
    const result = filterTasks(TASKS, "bgr", "all", true);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.business === "bgr")).toBe(true);
  });

  it("filters by priority correctly", () => {
    const result = filterTasks(TASKS, "all", "High", true);
    expect(result).toHaveLength(3);
    expect(result.every((t) => t.priority === "High")).toBe(true);
  });

  it("combines business + priority filters", () => {
    const result = filterTasks(TASKS, "bcf", "High", true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("5");
  });

  it("returns empty array when no tasks match", () => {
    const result = filterTasks(TASKS, "group", "Low", false);
    expect(result).toHaveLength(0);
  });
});

describe("task statistics", () => {
  it("counts pending tasks correctly", () => {
    expect(TASKS.filter((t) => !t.done).length).toBe(3);
  });

  it("counts high priority pending tasks correctly", () => {
    expect(TASKS.filter((t) => !t.done && t.priority === "High").length).toBe(2);
  });

  it("counts done tasks correctly", () => {
    expect(TASKS.filter((t) => t.done).length).toBe(2);
  });
});
