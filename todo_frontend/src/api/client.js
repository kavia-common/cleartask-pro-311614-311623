import { safeJsonParse } from "../utils/storage";

/**
 * PUBLIC_INTERFACE
 * Get configured API base URL (if provided) to enable server-backed persistence.
 * If not set, app uses localStorage-backed in-memory store.
 */
export function getApiBase() {
  const raw = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed || null;
}

/**
 * A minimal fetch wrapper that keeps the API swap isolated.
 * This file intentionally does not assume any backend shape beyond JSON.
 */
async function requestJson(path, options = {}) {
  const base = getApiBase();
  if (!base) throw new Error("API base not configured");

  const url = base.replace(/\/+$/, "") + path;
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    const msg = data?.message || data?.detail || resp.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Task API shim. If your backend exposes these endpoints, you can switch to server mode
 * just by setting REACT_APP_API_BASE.
 *
 * Expected endpoints (conventional REST):
 * - GET    /tasks
 * - POST   /tasks
 * - PATCH  /tasks/:id
 * - DELETE /tasks/:id
 */
export const taskApi = {
  async listTasks() {
    return requestJson("/tasks", { method: "GET" });
  },
  async createTask(task) {
    return requestJson("/tasks", { method: "POST", body: JSON.stringify(task) });
  },
  async updateTask(id, patch) {
    return requestJson(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async deleteTask(id) {
    return requestJson(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
