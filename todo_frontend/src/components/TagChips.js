import React from "react";

/**
 * PUBLIC_INTERFACE
 * TagChips shows labels as interactive chips for filtering.
 */
export function TagChips({ labels, selectedLabel, onSelectLabel }) {
  if (!labels?.length) return null;

  return (
    <div className="ct-row ct-row-wrap" role="group" aria-label="Labels">
      <button
        type="button"
        className="ct-chip"
        aria-pressed={selectedLabel === null ? "true" : "false"}
        onClick={() => onSelectLabel(null)}
      >
        All
      </button>

      {labels.map((l) => (
        <button
          key={l}
          type="button"
          className="ct-chip"
          aria-pressed={selectedLabel === l ? "true" : "false"}
          onClick={() => onSelectLabel(l)}
        >
          <span aria-hidden="true">🏷</span>
          {l}
        </button>
      ))}
    </div>
  );
}
