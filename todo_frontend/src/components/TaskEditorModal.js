import React, { useEffect, useMemo, useRef, useState } from "react";
import { DatePicker } from "./DatePicker";

function normalizeLabels(input) {
  return (input || [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 12);
}

/**
 * PUBLIC_INTERFACE
 * TaskEditorModal provides create/edit UI in a modal dialog.
 */
export function TaskEditorModal({ open, task, labels, onClose, onSave }) {
  const titleInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [completed, setCompleted] = useState(false);
  const [labelsInput, setLabelsInput] = useState("");

  const mode = task ? "edit" : "create";

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setDueDate(task?.dueDate || null);
    setPriority(task?.priority || "medium");
    setCompleted(Boolean(task?.completed));
    setLabelsInput((task?.labels || []).join(", "));

    // Focus title for keyboard efficiency.
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }, [open, task]);

  const suggestedLabels = useMemo(() => labels || [], [labels]);

  if (!open) return null;

  const submit = async () => {
    const draft = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      completed,
      labels: normalizeLabels(labelsInput.split(",")),
    };

    if (!draft.title) {
      // Lightweight inline guard; toasts are handled at parent.
      titleInputRef.current?.focus();
      return;
    }

    await onSave(draft);
  };

  return (
    <div
      className="ct-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "edit" ? "Edit task" : "New task"}
      onMouseDown={(e) => {
        // Click outside closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ct-modal">
        <div className="ct-modal-header">
          <div className="ct-modal-title">
            <h2>{mode === "edit" ? "Edit task" : "Create task"}</h2>
            <p>
              Press <span className="ct-kbd">Enter</span> to save,{" "}
              <span className="ct-kbd">Esc</span> to close.
            </p>
          </div>
          <button type="button" className="ct-iconbtn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="ct-modal-body">
          <div className="ct-grid">
            <div className="ct-grid" style={{ gap: 6 }}>
              <label htmlFor="task-title" style={{ fontSize: 13, fontWeight: 700 }}>
                Title
              </label>
              <input
                id="task-title"
                ref={titleInputRef}
                className="ct-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Draft project brief"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                aria-invalid={title.trim().length === 0 ? "true" : "false"}
              />
            </div>

            <div className="ct-grid" style={{ gap: 6 }}>
              <label htmlFor="task-description" style={{ fontSize: 13, fontWeight: 700 }}>
                Description
              </label>
              <textarea
                id="task-description"
                className="ct-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details…"
              />
            </div>

            <div className="ct-row ct-row-wrap">
              <div style={{ minWidth: 220, flex: 1 }}>
                <DatePicker
                  id="task-due"
                  label="Due date"
                  value={dueDate || ""}
                  onChange={setDueDate}
                />
              </div>

              <div style={{ minWidth: 220, flex: 1 }}>
                <div className="ct-grid" style={{ gap: 6 }}>
                  <label htmlFor="task-priority" style={{ fontSize: 13, fontWeight: 700 }}>
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    className="ct-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ minWidth: 220, flex: 1 }}>
                <div className="ct-grid" style={{ gap: 6 }}>
                  <label htmlFor="task-status" style={{ fontSize: 13, fontWeight: 700 }}>
                    Status
                  </label>
                  <select
                    id="task-status"
                    className="ct-select"
                    value={completed ? "completed" : "active"}
                    onChange={(e) => setCompleted(e.target.value === "completed")}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ct-grid" style={{ gap: 6 }}>
              <label htmlFor="task-labels" style={{ fontSize: 13, fontWeight: 700 }}>
                Labels (comma-separated)
              </label>
              <input
                id="task-labels"
                className="ct-input"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. Work, Personal"
              />
              {suggestedLabels?.length ? (
                <div className="ct-row ct-row-wrap" aria-label="Suggested labels">
                  {suggestedLabels.slice(0, 10).map((l) => (
                    <button
                      key={l}
                      type="button"
                      className="ct-chip"
                      aria-pressed={labelsInput.includes(l) ? "true" : "false"}
                      onClick={() => {
                        const current = normalizeLabels(labelsInput.split(","));
                        if (current.includes(l)) {
                          setLabelsInput(current.filter((x) => x !== l).join(", "));
                        } else {
                          setLabelsInput([...current, l].join(", "));
                        }
                      }}
                    >
                      <span aria-hidden="true">＋</span>
                      {l}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="ct-modal-footer">
          <button type="button" className="ct-btn ct-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ct-btn ct-btn-primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
