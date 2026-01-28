import React from "react";

function labelForPriority(p) {
  if (p === "high") return "High";
  if (p === "low") return "Low";
  return "Medium";
}

/**
 * PUBLIC_INTERFACE
 * PriorityBadge renders a styled priority pill.
 */
export function PriorityBadge({ priority }) {
  const p = priority || "medium";
  return (
    <span className={`ct-priority ${p}`} aria-label={`Priority ${labelForPriority(p)}`}>
      {labelForPriority(p)}
    </span>
  );
}
