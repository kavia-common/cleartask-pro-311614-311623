import { isDueToday, isOverdue, parseIsoDateOnly } from "./date";

/**
 * PUBLIC_INTERFACE
 * Compute counts for the sidebar sections.
 */
export function buildDerivedCounts(tasks) {
  const counts = { today: 0, upcoming: 0, overdue: 0, completed: 0, labels: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  (tasks || []).forEach((t) => {
    if (t.completed) counts.completed += 1;

    if (!t.completed && t.dueDate && isDueToday(t.dueDate)) counts.today += 1;
    if (!t.completed && t.dueDate && isOverdue(t.dueDate)) counts.overdue += 1;

    if (!t.completed) {
      if (!t.dueDate) counts.upcoming += 1;
      else {
        const d = parseIsoDateOnly(t.dueDate);
        if (!d) counts.upcoming += 1;
        else if (d.getTime() > today.getTime()) counts.upcoming += 1;
      }
    }
  });

  counts.labels = (tasks || []).filter((t) => (t.labels || []).length > 0).length;
  return counts;
}

/**
 * PUBLIC_INTERFACE
 * Map section to fixed status filter behavior.
 */
export function sectionToStatusFilter(section) {
  if (section === "completed") return "completed";
  if (section === "today") return "active";
  if (section === "upcoming") return "active";
  if (section === "overdue") return "active";
  return "all";
}

/**
 * PUBLIC_INTERFACE
 * Get main title for section.
 */
export function getSectionTitle(activeSection, selectedLabel) {
  if (activeSection === "today") return "Today";
  if (activeSection === "upcoming") return "Upcoming";
  if (activeSection === "overdue") return "Overdue";
  if (activeSection === "completed") return "Completed";
  if (activeSection === "labels") return selectedLabel ? `Label: ${selectedLabel}` : "Labels";
  return "Tasks";
}

/**
 * PUBLIC_INTERFACE
 * Empty state copy per section.
 */
export function getSectionEmptyState(activeSection, selectedLabel) {
  if (activeSection === "today") {
    return {
      title: "No tasks due today",
      message: "Enjoy the momentum—add a new task or plan ahead for upcoming days.",
    };
  }
  if (activeSection === "upcoming") {
    return {
      title: "Nothing upcoming",
      message: "Add a due date to see tasks here, or keep tasks without due dates for later.",
    };
  }
  if (activeSection === "overdue") {
    return {
      title: "No overdue tasks",
      message: "Nice. You're all caught up.",
    };
  }
  if (activeSection === "completed") {
    return {
      title: "No completed tasks",
      message: "Complete a task to see it here. You can always undo a completion from a toast.",
    };
  }
  if (activeSection === "labels" && selectedLabel) {
    return {
      title: `No tasks with “${selectedLabel}”`,
      message: "Assign this label to tasks in the editor to organize your work.",
    };
  }
  if (activeSection === "labels") {
    return {
      title: "No labeled tasks",
      message: "Add labels in the task editor to group and filter your tasks.",
    };
  }
  return { title: "No tasks", message: "Create your first task to get started." };
}
