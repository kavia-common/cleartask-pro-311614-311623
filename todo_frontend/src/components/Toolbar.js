import React from "react";
import { TagChips } from "./TagChips";

/**
 * PUBLIC_INTERFACE
 * Toolbar renders search, filter, and sort controls for the task list.
 */
export function Toolbar({
  query,
  onQueryChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  sectionStatusFilter,
  sortMode,
  onSortModeChange,
  labels,
  selectedLabel,
  onSelectLabel,
}) {
  const statusDisabled = sectionStatusFilter !== "all";

  return (
    <div className="ct-toolbar">
      <div className="ct-toolbar-top">
        <div className="ct-search">
          <span className="ct-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="task-search"
            className="ct-input"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search tasks (press /)…"
            aria-label="Search tasks"
          />
        </div>

        <div className="ct-toolbar-filters" aria-label="Filters">
          <div className="ct-filter">
            <select
              className="ct-select"
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="ct-filter">
            <select
              className="ct-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by status"
              disabled={statusDisabled}
              title={
                statusDisabled
                  ? "Status filter is controlled by the selected section"
                  : "Filter by status"
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="ct-filter">
            <select
              className="ct-select"
              value={sortMode}
              onChange={(e) => onSortModeChange(e.target.value)}
              aria-label="Sort tasks"
            >
              <option value="dueDateAsc">Due date (soonest)</option>
              <option value="dueDateDesc">Due date (latest)</option>
              <option value="priorityDesc">Priority (high first)</option>
              <option value="createdDesc">Recently created</option>
              <option value="titleAsc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ct-tags-row" aria-label="Label filter">
        <TagChips
          labels={labels}
          selectedLabel={selectedLabel}
          onSelectLabel={onSelectLabel}
        />
      </div>
    </div>
  );
}
