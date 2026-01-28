import { isDueToday, isOverdue, parseIsoDateOnly } from "./date";

function matchesQuery(task, q) {
  if (!q) return true;
  const hay = `${task.title || ""} ${task.description || ""} ${(task.labels || []).join(" ")}`
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function matchesLabel(task, selectedLabel) {
  if (!selectedLabel) return true;
  return (task.labels || []).includes(selectedLabel);
}

function matchesPriority(task, priority) {
  if (!priority || priority === "all") return true;
  return (task.priority || "medium") === priority;
}

function matchesStatus(task, statusFilter) {
  if (!statusFilter || statusFilter === "all") return true;
  if (statusFilter === "completed") return Boolean(task.completed);
  if (statusFilter === "active") return !task.completed;
  return true;
}

function matchesSection(task, section) {
  if (section === "completed") return Boolean(task.completed);
  if (section === "overdue") return !task.completed && task.dueDate && isOverdue(task.dueDate);
  if (section === "today") return !task.completed && task.dueDate && isDueToday(task.dueDate);
  if (section === "upcoming") {
    if (task.completed) return false;
    if (!task.dueDate) return true; // treat no-date as upcoming-ish
    const d = parseIsoDateOnly(task.dueDate);
    if (!d) return true;
    // upcoming means after today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
  }
  // labels section is handled by label filter
  return true;
}

function comparePriorityDesc(a, b) {
  const order = { high: 3, medium: 2, low: 1 };
  return (order[b.priority] || 2) - (order[a.priority] || 2);
}

/**
 * PUBLIC_INTERFACE
 * Filter + sort tasks according to UI controls.
 */
export function filterAndSortTasks(tasks, opts) {
  const {
    activeSection,
    selectedLabel,
    query,
    priorityFilter,
    statusFilter,
    sortMode,
  } = opts;

  const filtered = (tasks || []).filter((t) => {
    if (!matchesSection(t, activeSection)) return false;
    if (!matchesLabel(t, selectedLabel)) return false;
    if (!matchesQuery(t, query)) return false;
    if (!matchesPriority(t, priorityFilter)) return false;
    if (!matchesStatus(t, statusFilter)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "priorityDesc") return comparePriorityDesc(a, b);

    if (sortMode === "createdDesc") {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return bt - at;
    }

    if (sortMode === "titleAsc") {
      return String(a.title || "").localeCompare(String(b.title || ""));
    }

    const ad = a.dueDate ? parseIsoDateOnly(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY;
    const bd = b.dueDate ? parseIsoDateOnly(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY;

    if (sortMode === "dueDateDesc") return bd - ad;
    // default dueDateAsc
    return ad - bd;
  });

  return sorted;
}
