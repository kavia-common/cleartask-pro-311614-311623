import React from "react";

const SECTIONS = [
  { key: "today", label: "Today", icon: "☀" },
  { key: "upcoming", label: "Upcoming", icon: "🗓" },
  { key: "overdue", label: "Overdue", icon: "⏰" },
  { key: "completed", label: "Completed", icon: "✓" },
  { key: "labels", label: "Labels", icon: "🏷" },
];

/**
 * PUBLIC_INTERFACE
 * SidebarNav renders the left navigation and label list.
 */
export function SidebarNav({
  activeSection,
  onSectionChange,
  counts,
  labels,
  selectedLabel,
  onSelectLabel,
}) {
  return (
    <div>
      <div className="ct-sidebar-brand" aria-label="ClearTask brand">
        <div className="ct-logo" aria-hidden="true" />
        <div className="ct-brand-text">
          <div className="ct-brand-name">ClearTask</div>
          <div className="ct-brand-caption">Fast, focused to‑dos</div>
        </div>
      </div>

      <nav className="ct-nav" aria-label="Primary navigation">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className="ct-nav-item"
            aria-current={activeSection === s.key ? "page" : undefined}
            onClick={() => onSectionChange(s.key)}
          >
            <span className="ct-nav-left">
              <span className="ct-nav-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="ct-nav-label">{s.label}</span>
            </span>

            <span className="ct-nav-count" aria-label={`${s.label} count`}>
              {counts?.[s.key] ?? 0}
            </span>
          </button>
        ))}
      </nav>

      <section className="ct-sidebar-section" aria-label="Labels">
        <div className="ct-section-title">Labels</div>
        <div className="ct-label-list">
          {labels.length ? (
            labels.map((l) => (
              <button
                key={l}
                type="button"
                className="ct-label-pill"
                aria-current={selectedLabel === l ? "true" : "false"}
                onClick={() => onSelectLabel(l)}
              >
                <span className="ct-nav-left">
                  <span className="ct-dot" aria-hidden="true" />
                  <span className="ct-nav-label">{l}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="ct-muted" style={{ padding: "8px 10px", fontSize: 13 }}>
              No labels yet. Add one in the task editor.
            </div>
          )}
        </div>

        <div style={{ padding: "10px 10px 0" }}>
          <div className="ct-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
            Shortcuts: <span className="ct-kbd">N</span> new,{" "}
            <span className="ct-kbd">/</span> search
          </div>
        </div>
      </section>
    </div>
  );
}
