import React from "react";

/**
 * PUBLIC_INTERFACE
 * DatePicker provides a simple HTML date input wrapped with consistent styling.
 */
export function DatePicker({ value, onChange, label, id }) {
  return (
    <div className="ct-grid" style={{ gap: 6 }}>
      {label ? (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700 }}>
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className="ct-input"
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </div>
  );
}
