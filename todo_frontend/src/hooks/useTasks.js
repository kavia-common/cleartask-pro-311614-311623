import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { taskApi, getApiBase } from "../api/client";
import { safeJsonParse } from "../utils/storage";
import { nowIsoDate, toIsoDateOnly } from "../utils/date";

const STORAGE_KEY = "ct.tasks.v1";

function uid() {
  return Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

function defaultSampleTasks() {
  const today = toIsoDateOnly(new Date());
  const tomorrow = toIsoDateOnly(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const yesterday = toIsoDateOnly(new Date(Date.now() - 24 * 60 * 60 * 1000));

  return [
    {
      id: uid(),
      title: "Plan your day",
      description: "Pick 3 important tasks and set realistic due dates.",
      dueDate: today,
      priority: "medium",
      completed: false,
      labels: ["Personal"],
      createdAt: nowIsoDate(),
      updatedAt: nowIsoDate(),
      subtasks: [
        { id: uid(), title: "Review calendar", completed: true },
        { id: uid(), title: "Write top 3 priorities", completed: false },
      ],
    },
    {
      id: uid(),
      title: "Prepare weekly status update",
      description: "Summarize progress, blockers, and next steps.",
      dueDate: tomorrow,
      priority: "high",
      completed: false,
      labels: ["Work"],
      createdAt: nowIsoDate(),
      updatedAt: nowIsoDate(),
      subtasks: [{ id: uid(), title: "Collect notes from the week", completed: false }],
    },
    {
      id: uid(),
      title: "Pay utility bill",
      description: "Overdue example task.",
      dueDate: yesterday,
      priority: "low",
      completed: false,
      labels: ["Home"],
      createdAt: nowIsoDate(),
      updatedAt: nowIsoDate(),
      subtasks: [],
    },
    {
      id: uid(),
      title: "Archive completed tasks",
      description: "Keep your list clean with bulk actions.",
      dueDate: today,
      priority: "low",
      completed: true,
      labels: ["Personal"],
      createdAt: nowIsoDate(),
      updatedAt: nowIsoDate(),
      subtasks: [],
    },
  ];
}

function normalizeTask(input) {
  const t = { ...input };
  if (!t.id) t.id = uid();
  if (!t.title) t.title = "Untitled task";
  if (!t.priority) t.priority = "medium";
  if (!Array.isArray(t.labels)) t.labels = [];
  if (!Array.isArray(t.subtasks)) t.subtasks = [];
  if (typeof t.completed !== "boolean") t.completed = false;
  if (!t.createdAt) t.createdAt = nowIsoDate();
  if (!t.updatedAt) t.updatedAt = nowIsoDate();
  return t;
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw);
  if (!parsed) return null;
  if (!Array.isArray(parsed)) return null;
  return parsed.map(normalizeTask);
}

function saveToStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * PUBLIC_INTERFACE
 * useTasks manages tasks state, persistence, and provides a thin API abstraction.
 * If REACT_APP_API_BASE is configured, you can refresh from server (optional) while
 * still keeping local UI responsive.
 */
export function useTasks() {
  const apiEnabled = Boolean(getApiBase());

  const [tasks, setTasks] = useState(() => {
    const stored = loadFromStorage();
    if (stored && stored.length) return stored;

    const sample = defaultSampleTasks();
    saveToStorage(sample);
    return sample;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep last completion toggle for "undo".
  const lastToggleRef = useRef(null); // {id, previousCompleted}

  // Persist on change (local mode always; server mode also persists locally for resilience).
  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks]);

  const labels = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.labels || []).forEach((l) => set.add(l)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const createTask = useCallback(async (draft) => {
    const task = normalizeTask({
      ...draft,
      id: uid(),
      createdAt: nowIsoDate(),
      updatedAt: nowIsoDate(),
    });

    // Optimistic local update.
    setTasks((prev) => [task, ...prev]);

    if (apiEnabled) {
      try {
        setLoading(true);
        await taskApi.createTask(task);
      } finally {
        setLoading(false);
      }
    }

    return task;
  }, [apiEnabled]);

  const updateTask = useCallback(
    async (id, patch) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? normalizeTask({ ...t, ...patch, updatedAt: nowIsoDate() }) : t))
      );

      if (apiEnabled) {
        try {
          setLoading(true);
          await taskApi.updateTask(id, patch);
        } finally {
          setLoading(false);
        }
      }
    },
    [apiEnabled]
  );

  const deleteTask = useCallback(
    async (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));

      if (apiEnabled) {
        try {
          setLoading(true);
          await taskApi.deleteTask(id);
        } finally {
          setLoading(false);
        }
      }
    },
    [apiEnabled]
  );

  const toggleComplete = useCallback(
    async (id) => {
      let updated = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          lastToggleRef.current = { id, previousCompleted: t.completed };
          updated = { ...t, completed: !t.completed, updatedAt: nowIsoDate() };
          return normalizeTask(updated);
        })
      );

      if (apiEnabled) {
        try {
          setLoading(true);
          await taskApi.updateTask(id, { completed: updated?.completed });
        } finally {
          setLoading(false);
        }
      }
      return updated;
    },
    [apiEnabled]
  );

  const undoLastCompletionToggle = useCallback(async () => {
    const info = lastToggleRef.current;
    if (!info) throw new Error("Nothing to undo");

    await updateTask(info.id, { completed: info.previousCompleted });
    lastToggleRef.current = null;
  }, [updateTask]);

  const bulkUpdate = useCallback(
    async (ids, patch) => {
      const idSet = new Set(ids);
      setTasks((prev) =>
        prev.map((t) => (idSet.has(t.id) ? normalizeTask({ ...t, ...patch, updatedAt: nowIsoDate() }) : t))
      );

      if (apiEnabled) {
        // naive sequential; safe and simple for swap later
        try {
          setLoading(true);
          for (const id of ids) {
            // eslint-disable-next-line no-await-in-loop
            await taskApi.updateTask(id, patch);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [apiEnabled]
  );

  const bulkDelete = useCallback(
    async (ids) => {
      const idSet = new Set(ids);
      setTasks((prev) => prev.filter((t) => !idSet.has(t.id)));

      if (apiEnabled) {
        try {
          setLoading(true);
          for (const id of ids) {
            // eslint-disable-next-line no-await-in-loop
            await taskApi.deleteTask(id);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [apiEnabled]
  );

  const clearCompleted = useCallback(async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    if (!completedIds.length) return 0;
    await bulkDelete(completedIds);
    return completedIds.length;
  }, [tasks, bulkDelete]);

  const refreshFromApiIfEnabled = useCallback(async () => {
    if (!apiEnabled) return;

    setLoading(true);
    setError(null);
    try {
      const serverTasks = await taskApi.listTasks();
      if (Array.isArray(serverTasks)) {
        setTasks(serverTasks.map(normalizeTask));
      } else if (Array.isArray(serverTasks?.tasks)) {
        setTasks(serverTasks.tasks.map(normalizeTask));
      } else {
        throw new Error("Unexpected API response (expected array)");
      }
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [apiEnabled]);

  return {
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
  };
}
