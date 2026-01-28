/**
 * PUBLIC_INTERFACE
 * Safely parse JSON without throwing.
 */
export function safeJsonParse(input) {
  if (input == null) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
