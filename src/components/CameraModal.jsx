import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { videoFrameToDataUrl } from '../lib/image'

export default function CameraModal({ open, onClose, onCapture, onFallback }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    const videoElement = videoRef.current

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("La caméra n'est pas accessible depuis ce navigateur. Utilisez l'appareil photo natif.")
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = stream

        if (!videoElement) {
          stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
          return
        }

        videoElement.srcObject = stream
        try {
          await videoElement.play()
        } catch {
          /* play() peut être bloqué, les attributs autoplay/muted devraient suffire */
        }

        if (!cancelled) setReady(true)
      } catch (cameraError) {
        if (cancelled) return

        if (cameraError?.name === 'NotAllowedError') {
          setError("Accès à la caméra refusé. Autorisez la caméra dans le navigateur ou utilisez l'appareil photo natif.")
        } else if (cameraError?.name === 'NotFoundError') {
          setError("Aucune caméra détectée. Utilisez l'option « Appareil photo natif ».")
        } else {
          setError("Impossible d'ouvrir la caméra. La page doit être servie en HTTPS ou sur localhost.")
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoElement) videoElement.srcObject = null
    }
  }, [open, facingMode])

  function handleSwitchCamera() {
    setError('')
    setReady(false)
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'))
  }

  function handleCapture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('La caméra est encore en cours de démarrage.')
      return
    }

    try {
      const dataUrl = videoFrameToDataUrl(video, { maxSize: 1000, quality: 0.72 })
      onCapture(dataUrl)
    } catch (captureError) {
      setError(captureError.message)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" labelledBy="camera-title">
      <div className="modal-header border-0 pb-2 align-items-start">
        <div>
          <h2 className="modal-title h5 mb-1" id="camera-title">
            <i className="bi bi-camera-video me-2" aria-hidden="true"></i>
            Prendre une photo
          </h2>
          <p className="text-muted small mb-0">Cadrez le produit puis appuyez sur « Capturer ».</p>
        </div>
        <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose}></button>
      </div>

      <div className="modal-body pt-1">
        <div className="camera-stage">
          <video ref={videoRef} className="camera-video" autoPlay playsInline muted />

          {!ready && !error && (
            <div className="camera-overlay">
              <span className="spinner-border text-light" role="status" aria-hidden="true"></span>
              <span>Activation de la caméra…</span>
            </div>
          )}

          {error && (
            <div className="camera-error">
              <i className="bi bi-camera-video-off" aria-hidden="true"></i>
              <p>{error}</p>
              <button type="button" className="btn btn-light btn-sm" onClick={onFallback}>
                <i className="bi bi-phone me-2" aria-hidden="true"></i>
                Appareil photo natif
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer border-0 pt-0 flex-wrap gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onFallback}>
          <i className="bi bi-phone me-2" aria-hidden="true"></i>
          Appareil natif
        </button>

        <div className="d-flex gap-2 ms-auto">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleSwitchCamera}
            disabled={!ready || Boolean(error)}
            title="Changer de caméra"
            aria-label="Changer de caméra"
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
          <button
            type="button"
            className="btn btn-primary px-3"
            onClick={handleCapture}
            disabled={!ready || Boolean(error)}
          >
            <i className="bi bi-camera-fill me-2" aria-hidden="true"></i>
            Capturer
          </button>
        </div>
      </div>
    </Modal>
  )
}
