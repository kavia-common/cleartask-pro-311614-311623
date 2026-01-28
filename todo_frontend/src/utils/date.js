/**
 * PUBLIC_INTERFACE
 * Return ISO datetime string for now.
 */
export function nowIsoDate() {
  return new Date().toISOString();
}

/**
 * PUBLIC_INTERFACE
 * Parse YYYY-MM-DD to Date (local midnight).
 */
export function parseIsoDateOnly(isoDate) {
  if (!isoDate) return null;
  const m = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/**
 * PUBLIC_INTERFACE
 * Format date to YYYY-MM-DD.
 */
export function toIsoDateOnly(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/**
 * PUBLIC_INTERFACE
 * Whether date is overdue (before today).
 */
export function isOverdue(isoDate) {
  const d = parseIsoDateOnly(isoDate);
  if (!d) return false;
  return d.getTime() < startOfToday().getTime();
}

/**
 * PUBLIC_INTERFACE
 * Whether date is today.
 */
export function isDueToday(isoDate) {
  const d = parseIsoDateOnly(isoDate);
  if (!d) return false;
  return d.getTime() === startOfToday().getTime();
}

/**
 * PUBLIC_INTERFACE
 * Friendly due label for list display.
 */
export function formatDueLabel(isoDate) {
  const d = parseIsoDateOnly(isoDate);
  if (!d) return "No due date";
  const today = startOfToday();
  const diffDays = Math.round((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  const opts = { month: "short", day: "numeric" };
  const base = d.toLocaleDateString(undefined, opts);
  return diffDays < 0 ? `${base} (${Math.abs(diffDays)}d overdue)` : `${base} (in ${diffDays}d)`;
}
