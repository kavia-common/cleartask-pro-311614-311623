import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider, useToasts } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SidebarNav } from "./components/SidebarNav";
import { Toolbar } from "./components/Toolbar";
import { TaskList } from "./components/TaskList";
import { TaskEditorModal } from "./components/TaskEditorModal";
import { BulkActionsBar } from "./components/BulkActionsBar";

import { useTasks } from "./hooks/useTasks";
import {
  buildDerivedCounts,
  getSectionTitle,
  getSectionEmptyState,
  sectionToStatusFilter,
} from "./utils/sections";
import { filterAndSortTasks } from "./utils/filters";
import { clampText } from "./utils/text";

/**
 * PUBLIC_INTERFACE
 * App entrypoint for the To-Do dashboard UI.
 * Wraps the full application in Theme + Toast providers and renders the dashboard layout.
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToasts();

  const {
    tasks,
    loading,
    error,
    labels,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    undoLastCompletionToggle,
    bulkUpdate,
    bulkDelete,
    clearCompleted,
    refreshFromApiIfEnabled,
  } = useTasks();

  const [activeSection, setActiveSection] = useState("today"); // today | upcoming | overdue | completed | labels
  const [selectedLabel, setSelectedLabel] = useState(null);

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("dueDateAsc");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const counts = useMemo(() => buildDerivedCounts(tasks), [tasks]);

  // Keep label selection consistent when switching away from Labels section.
  useEffect(() => {
    if (activeSection !== "labels") setSelectedLabel(null);
  }, [activeSection]);

  const effectiveStatusFilter = useMemo(() => {
    if (activeSection === "completed") return "completed";
    if (activeSection === "today") return "active";
    if (activeSection === "upcoming") return "active";
    if (activeSection === "overdue") return "active";
    return statusFilter;
  }, [activeSection, statusFilter]);

  const sectionStatusFilter = useMemo(
    () => sectionToStatusFilter(activeSection),
    [activeSection]
  );

  const filtered = useMemo(() => {
    return filterAndSortTasks(tasks, {
      activeSection,
      selectedLabel,
      query,
      priorityFilter,
      statusFilter: effectiveStatusFilter,
      sortMode,
    });
  }, [
    tasks,
    activeSection,
    selectedLabel,
    query,
    priorityFilter,
    effectiveStatusFilter,
    sortMode,
  ]);

  const allVisibleIds = useMemo(
    () => new Set(filtered.map((t) => t.id)),
    [filtered]
  );

  // Ensure selection never holds tasks that are not visible after filters change.
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set();
      for (const id of prev) if (allVisibleIds.has(id)) next.add(id);
      return next;
    });
  }, [allVisibleIds]);

  const openCreate = () => {
    setEditingTaskId(null);
    setEditorOpen(true);
  };

  const openEdit = (taskId) => {
    setEditingTaskId(taskId);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingTaskId(null);
  };

  const onSaveTask = async (draft) => {
    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, draft);
        pushToast({
          type: "success",
          title: "Task updated",
          message: clampText(draft.title || "Updated task", 80),
        });
      } else {
        await createTask(draft);
        pushToast({
          type: "success",
          title: "Task created",
          message: clampText(draft.title || "New task", 80),
        });
      }
      closeEditor();
    } catch (e) {
      pushToast({
        type: "error",
        title: "Could not save task",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      pushToast({ type: "success", title: "Task deleted" });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    } catch (e) {
      pushToast({
        type: "error",
        title: "Could not delete task",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onToggleComplete = async (taskId) => {
    try {
      const result = await toggleComplete(taskId);
      pushToast({
        type: "success",
        title: result?.completed ? "Completed" : "Marked as active",
        message: "Press Undo to revert.",
        actionLabel: "Undo",
        onAction: async () => {
          try {
            await undoLastCompletionToggle();
            pushToast({ type: "info", title: "Undone" });
          } catch (e) {
            pushToast({
              type: "error",
              title: "Could not undo",
              message: e?.message || "Unexpected error",
            });
          }
        },
      });
    } catch (e) {
      pushToast({
        type: "error",
        title: "Could not update status",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onBulkSelectAllVisible = () => {
    setSelectedIds(new Set(filtered.map((t) => t.id)));
  };

  const onBulkClearSelection = () => setSelectedIds(new Set());

  const onBulkComplete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    try {
      await bulkUpdate(ids, { completed: true });
      pushToast({ type: "success", title: `Completed ${ids.length} task(s)` });
      onBulkClearSelection();
    } catch (e) {
      pushToast({
        type: "error",
        title: "Bulk update failed",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onBulkMarkActive = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    try {
      await bulkUpdate(ids, { completed: false });
      pushToast({ type: "success", title: `Updated ${ids.length} task(s)` });
      onBulkClearSelection();
    } catch (e) {
      pushToast({
        type: "error",
        title: "Bulk update failed",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    const confirmed = window.confirm(
      `Delete ${ids.length} selected task(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await bulkDelete(ids);
      pushToast({ type: "success", title: `Deleted ${ids.length} task(s)` });
      onBulkClearSelection();
    } catch (e) {
      pushToast({
        type: "error",
        title: "Bulk delete failed",
        message: e?.message || "Unexpected error",
      });
    }
  };

  const onClearCompleted = async () => {
    try {
      const removed = await clearCompleted();
      pushToast({
        type: "success",
        title: removed
          ? `Cleared ${removed} completed task(s)`
          : "Nothing to clear",
      });
    } catch (e) {
      pushToast({
        type: "error",
        title: "Could not clear completed",
        message: e?.message || "Unexpected error",
      });
    }
  };

  // Keyboard shortcuts:
  // - N: New task
  // - / or Ctrl/Cmd+F: Focus search
  // - Esc: Close modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented) return;

      const isModF =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f";
      const isSlash = e.key === "/";
      const isN = e.key.toLowerCase() === "n";

      // If modal is open, Esc closes.
      if (editorOpen && e.key === "Escape") {
        e.preventDefault();
        closeEditor();
        return;
      }

      // Don't hijack keystrokes while typing in inputs (except mod+F).
      const target = e.target;
      const tag = target?.tagName?.toLowerCase?.();
      const isTypingContext =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if (isModF) {
        e.preventDefault();
        document.getElementById("task-search")?.focus();
        return;
      }

      if (isTypingContext) return;

      if (isSlash) {
        e.preventDefault();
        document.getElementById("task-search")?.focus();
        return;
      }

      if (isN) {
        e.preventDefault();
        openCreate();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorOpen]);

  const mainTitle = getSectionTitle(activeSection, selectedLabel);
  const emptyState = getSectionEmptyState(activeSection, selectedLabel);

  return (
    <div className="ct-app" data-theme={theme}>
      <div className="ct-bg" aria-hidden="true" />
      <div className="ct-layout">
        <aside className="ct-sidebar" aria-label="Sidebar navigation">
          <SidebarNav
            activeSection={activeSection}
            onSectionChange={(section) => setActiveSection(section)}
            counts={counts}
            labels={labels}
            selectedLabel={selectedLabel}
            onSelectLabel={(label) => {
              setActiveSection("labels");
              setSelectedLabel(label);
            }}
            onCreateLabelTask={() => openCreate()}
          />

          <div className="ct-sidebar-footer">
            <button
              type="button"
              className="ct-btn ct-btn-ghost ct-btn-full"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              <span className="ct-btn-icon" aria-hidden="true">
                {theme === "light" ? "🌙" : "☀️"}
              </span>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>

            <button
              type="button"
              className="ct-btn ct-btn-ghost ct-btn-full"
              onClick={async () => {
                try {
                  await refreshFromApiIfEnabled();
                  pushToast({
                    type: "success",
                    title: "Synced",
                    message: "Refreshed tasks from API (if configured).",
                  });
                } catch (e) {
                  pushToast({
                    type: "error",
                    title: "Sync failed",
                    message: e?.message || "Unexpected error",
                  });
                }
              }}
            >
              <span className="ct-btn-icon" aria-hidden="true">
                ↻
              </span>
              Sync
            </button>
          </div>
        </aside>

        <main className="ct-main" aria-label="Main content">
          <header className="ct-main-header">
            <div className="ct-main-title">
              <h1 className="ct-h1">{mainTitle}</h1>
              <p className="ct-subtitle">
                {loading
                  ? "Loading tasks…"
                  : `${filtered.length} task(s) visible`}
              </p>
            </div>

            <div className="ct-main-actions">
              <button
                type="button"
                className="ct-btn ct-btn-primary"
                onClick={openCreate}
                aria-label="Create new task (Shortcut: N)"
              >
                <span className="ct-btn-icon" aria-hidden="true">
                  ＋
                </span>
                New task
              </button>
            </div>
          </header>

          <Toolbar
            query={query}
            onQueryChange={setQuery}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sectionStatusFilter={sectionStatusFilter}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            labels={labels}
            selectedLabel={selectedLabel}
            onSelectLabel={(label) => {
              setActiveSection("labels");
              setSelectedLabel(label);
            }}
          />

          <BulkActionsBar
            selectedCount={selectedIds.size}
            onSelectAllVisible={onBulkSelectAllVisible}
            onClearSelection={onBulkClearSelection}
            onBulkComplete={onBulkComplete}
            onBulkMarkActive={onBulkMarkActive}
            onBulkDelete={onBulkDelete}
            onClearCompleted={onClearCompleted}
            disabled={loading}
          />

          {error ? (
            <div className="ct-panel ct-panel-error" role="alert">
              <div className="ct-panel-title">Something went wrong</div>
              <div className="ct-panel-body">
                {error?.message || String(error)}
              </div>
            </div>
          ) : (
            <TaskList
              tasks={filtered}
              loading={loading}
              emptyState={emptyState}
              selectedIds={selectedIds}
              onToggleSelected={(taskId) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(taskId)) next.delete(taskId);
                  else next.add(taskId);
                  return next;
                });
              }}
              onEdit={openEdit}
              onDelete={onDeleteTask}
              onToggleComplete={onToggleComplete}
              onUpdateTask={updateTask}
            />
          )}
        </main>

        <TaskEditorModal
          open={editorOpen}
          task={editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null}
          labels={labels}
          onClose={closeEditor}
          onSave={onSaveTask}
        />
      </div>
    </div>
  );
}

export default App;
