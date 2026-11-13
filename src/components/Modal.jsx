import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, children, size = 'md', labelledBy, closeOnBackdrop = true }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="modal fade show d-block app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onCloseRef.current?.()
      }}
    >
      <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
        <div className="modal-content border-0 shadow-lg">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
