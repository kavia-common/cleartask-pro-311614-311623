/**
 * PUBLIC_INTERFACE
 * Clamp a string to max length with ellipsis.
 */
export function clampText(text, maxLen) {
  const s = String(text || "");
  if (s.length <= maxLen) return s;
  return s.slice(0, Math.max(0, maxLen - 1)) + "…";
}
