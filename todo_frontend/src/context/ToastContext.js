import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

function randomId() {
  return Math.random().toString(36).slice(2);
}

/**
 * PUBLIC_INTERFACE
 * ToastProvider manages transient toast notifications.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    ({ type = "info", title, message, durationMs = 4200, actionLabel, onAction }) => {
      const id = randomId();
      const toast = { id, type, title, message, actionLabel, onAction };
      setToasts((prev) => [...prev, toast]);

      const timer = setTimeout(() => removeToast(id), durationMs);
      timersRef.current.set(id, timer);
      return id;
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * useToasts hook to trigger toast feedback.
 */
export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within ToastProvider");
  return ctx;
}

function ToastViewport() {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="ct-toasts" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`ct-toast ct-toast-${t.type}`}
          role="status"
          aria-live="polite"
        >
          {t.title ? <p className="ct-toast-title">{t.title}</p> : null}
          {t.message ? <p className="ct-toast-body">{t.message}</p> : null}
          <div className="ct-toast-actions">
            {t.actionLabel && typeof t.onAction === "function" ? (
              <button
                type="button"
                className="ct-btn ct-btn-ghost"
                onClick={() => {
                  t.onAction();
                  removeToast(t.id);
                }}
              >
                {t.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="ct-btn ct-btn-ghost"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
