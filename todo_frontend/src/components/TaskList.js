import React from "react";
import { TaskItem } from "./TaskItem";

/**
 * PUBLIC_INTERFACE
 * TaskList renders task list and handles empty/loading states.
 */
export function TaskList({
  tasks,
  loading,
  emptyState,
  selectedIds,
  onToggleSelected,
  onEdit,
  onDelete,
  onToggleComplete,
  onUpdateTask,
}) {
  if (loading && (!tasks || tasks.length === 0)) {
    return (
      <div className="ct-card" style={{ padding: 12 }}>
        <div className="ct-empty">
          <h2>Loading…</h2>
          <p>Getting your tasks ready.</p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="ct-card ct-empty" role="region" aria-label="Empty state">
        <h2>{emptyState?.title || "No tasks"}</h2>
        <p>{emptyState?.message || "Create a task to get started."}</p>
      </div>
    );
  }

  return (
    <div className="ct-list" role="list" aria-label="Task list">
      {tasks.map((t) => (
        <div className="ct-card" key={t.id} role="listitem">
          <TaskItem
            task={t}
            selected={selectedIds?.has(t.id)}
            onToggleSelected={() => onToggleSelected(t.id)}
            onEdit={() => onEdit(t.id)}
            onDelete={() => onDelete(t.id)}
            onToggleComplete={() => onToggleComplete(t.id)}
            onUpdateTask={(patch) => onUpdateTask(t.id, patch)}
          />
        </div>
      ))}
    </div>
  );
}
