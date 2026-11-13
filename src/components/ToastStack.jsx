import { useEffect } from 'react'

const VARIANTS = {
  success: { className: 'text-bg-success', icon: 'bi-check-circle-fill', close: 'btn-close-white' },
  danger: { className: 'text-bg-danger', icon: 'bi-exclamation-octagon-fill', close: 'btn-close-white' },
  warning: { className: 'text-bg-warning', icon: 'bi-exclamation-triangle-fill', close: '' },
}

function ToastItem({ toast, onDismiss }) {
  const variant = VARIANTS[toast.variant] || VARIANTS.success

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4000)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className={`toast show align-items-center border-0 mb-2 app-toast ${variant.className}`} role="status">
      <div className="d-flex align-items-center">
        <div className="toast-body d-flex align-items-center gap-2">
          <i className={`bi ${variant.icon}`} aria-hidden="true"></i>
          <span>{toast.message}</span>
        </div>
        <button
          type="button"
          className={`btn-close ${variant.close} me-2`}
          aria-label="Fermer la notification"
          onClick={() => onDismiss(toast.id)}
        ></button>
      </div>
    </div>
  )
}

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
