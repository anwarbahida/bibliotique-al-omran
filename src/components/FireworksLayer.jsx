import { useEffect, useRef } from 'react'

const FIREWORKS_OPTIONS = {
  gravity: 1.4,
  opacity: 0.4,
  autoresize: true,
  acceleration: 1,
}

export default function FireworksLayer() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let cancelled = false
    let fireworks = null

    import(/* @vite-ignore */ 'https://esm.run/fireworks-js')
      .then(({ Fireworks }) => {
        if (cancelled) return
        fireworks = new Fireworks(container, FIREWORKS_OPTIONS)
        fireworks.start()
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      fireworks?.stop()
      fireworks?.clear()
      container.replaceChildren()
    }
  }, [])

  return <div ref={containerRef} className="fireworks-layer" aria-hidden="true" />
}
