import React, { useMemo, useState } from "react";
import { PriorityBadge } from "./PriorityBadge";
import { formatDueLabel, isOverdue } from "../utils/date";

/**
 * PUBLIC_INTERFACE
 * TaskItem renders a single task with actions, metadata, and subtasks.
 */
export function TaskItem({
  task,
  selected,
  onToggleSelected,
  onEdit,
  onDelete,
  onToggleComplete,
  onUpdateTask,
}) {
  const [subtaskDraft, setSubtaskDraft] = useState("");

  const overdue = useMemo(() => !task.completed && task.dueDate && isOverdue(task.dueDate), [task]);
  const dueLabel = useMemo(() => (task.dueDate ? formatDueLabel(task.dueDate) : "No due date"), [task]);

  const labels = task.labels || [];
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const addSubtask = async () => {
    const title = subtaskDraft.trim();
    if (!title) return;

    const next = [...subtasks, { id: `${task.id}-sub-${Date.now()}`, title, completed: false }];
    setSubtaskDraft("");
    await onUpdateTask({ subtasks: next });
  };

  return (
    <div className="ct-task" aria-label={`Task ${task.title}`}>
      <div className="ct-task-left">
        <input
          className="ct-checkbox"
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label={selected ? "Deselect task" : "Select task"}
        />
      </div>

      <div className="ct-task-main">
        <div className="ct-task-title-row">
          <button
            type="button"
            className="ct-iconbtn"
            onClick={onToggleComplete}
            aria-label={task.completed ? "Mark as active" : "Mark as completed"}
            title="One-click complete"
          >
            {task.completed ? "↩" : "✓"}
          </button>

          <h3 className={`ct-task-title ${task.completed ? "completed" : ""}`}>
            {task.title}
          </h3>

          <PriorityBadge priority={task.priority} />
          {overdue ? (
            <span className="ct-badge" style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}>
              Overdue
            </span>
          ) : null}

          {labels.length ? (
            <span className="ct-badge" aria-label="Labels">
              <span aria-hidden="true">🏷</span>
              {labels.join(", ")}
            </span>
          ) : null}
        </div>

        {task.description ? <p className="ct-task-desc">{task.description}</p> : null}

        <div className="ct-task-meta" aria-label="Task metadata">
          <span className="ct-date" aria-label="Due date">
            <span aria-hidden="true">🗓</span>
            {dueLabel}
          </span>

          {subtasks.length ? (
            <span className="ct-date" aria-label="Subtasks progress">
              <span aria-hidden="true">☑</span>
              {completedSubtasks}/{subtasks.length} subtasks
            </span>
          ) : null}
        </div>

        <div className="ct-subtasks" aria-label="Subtasks">
          {subtasks.map((s) => (
            <div className="ct-subtask" key={s.id}>
              <input
                className="ct-checkbox"
                type="checkbox"
                checked={Boolean(s.completed)}
                onChange={() => {
                  const next = subtasks.map((x) => (x.id === s.id ? { ...x, completed: !x.completed } : x));
                  onUpdateTask({ subtasks: next });
                }}
                aria-label={s.completed ? "Mark subtask as not completed" : "Mark subtask as completed"}
              />
              <input
                className="ct-input"
                type="text"
                value={s.title}
                onChange={(e) => {
                  const next = subtasks.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x));
                  onUpdateTask({ subtasks: next });
                }}
                aria-label="Subtask title"
              />
              <button
                type="button"
                className="ct-btn ct-btn-ghost"
                onClick={() => {
                  const next = subtasks.filter((x) => x.id !== s.id);
                  onUpdateTask({ subtasks: next });
                }}
                aria-label="Delete subtask"
              >
                Delete
              </button>
            </div>
          ))}

          <div className="ct-subtask">
            <input
              className="ct-checkbox"
              type="checkbox"
              checked={false}
              disabled
              aria-hidden="true"
            />
            <input
              className="ct-input"
              type="text"
              value={subtaskDraft}
              onChange={(e) => setSubtaskDraft(e.target.value)}
              placeholder="Add subtask…"
              aria-label="New subtask title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubtask();
                }
              }}
            />
            <button type="button" className="ct-btn" onClick={addSubtask}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="ct-task-actions" aria-label="Task actions">
        <button type="button" className="ct-btn" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="ct-btn ct-btn-ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
