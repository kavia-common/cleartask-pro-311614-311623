import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary catches React render errors and shows a safe fallback UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real production app, you'd also report this to an observability tool.
    // Keeping console output for debugging in preview.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ct-app" style={{ padding: 24 }}>
          <div className="ct-panel ct-panel-error" role="alert">
            <div className="ct-panel-title">We hit an unexpected error</div>
            <div className="ct-panel-body">
              Try refreshing the page. If it keeps happening, clear local storage for this site.
              <div className="ct-divider" />
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
                {this.state.error?.message || String(this.state.error)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
