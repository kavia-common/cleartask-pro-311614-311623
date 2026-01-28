import React from "react";

/**
 * PUBLIC_INTERFACE
 * BulkActionsBar provides bulk operations for selected tasks.
 */
export function BulkActionsBar({
  selectedCount,
  onSelectAllVisible,
  onClearSelection,
  onBulkComplete,
  onBulkMarkActive,
  onBulkDelete,
  onClearCompleted,
  disabled,
}) {
  return (
    <div className="ct-bulkbar" aria-label="Bulk actions">
      <div className="ct-bulkbar-left">
        <span className="ct-badge" aria-label="Selected tasks">
          {selectedCount} selected
        </span>
        <button
          type="button"
          className="ct-btn ct-btn-ghost"
          onClick={onSelectAllVisible}
          disabled={disabled}
        >
          Select visible
        </button>
        <button
          type="button"
          className="ct-btn ct-btn-ghost"
          onClick={onClearSelection}
          disabled={disabled || selectedCount === 0}
        >
          Clear selection
        </button>
      </div>

      <div className="ct-bulkbar-right">
        <button
          type="button"
          className="ct-btn"
          onClick={onBulkComplete}
          disabled={disabled || selectedCount === 0}
        >
          Complete
        </button>
        <button
          type="button"
          className="ct-btn"
          onClick={onBulkMarkActive}
          disabled={disabled || selectedCount === 0}
        >
          Mark active
        </button>
        <button
          type="button"
          className="ct-btn"
          onClick={onBulkDelete}
          disabled={disabled || selectedCount === 0}
        >
          Delete
        </button>
        <button
          type="button"
          className="ct-btn ct-btn-ghost"
          onClick={onClearCompleted}
          disabled={disabled}
          title="Remove all completed tasks"
        >
          Clear completed
        </button>
      </div>
    </div>
  );
}
