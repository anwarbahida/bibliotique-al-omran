import { useRef, useState } from 'react'
import CameraModal from './CameraModal'
import { fileToDataUrl } from '../lib/image'
import { addProduct, describeDataError, updateProduct } from '../lib/products'

const EMPTY_FORM = {
  name: '',
}

function getInitialForm(product) {
  if (!product) return EMPTY_FORM

  return {
    name: product.name || '',
  }
}

export default function ProductForm({ editingProduct, notify, onCancelEdit }) {
  const [form, setForm] = useState(() => getInitialForm(editingProduct))
  const [photo, setPhoto] = useState(() => editingProduct?.photo || '')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function processFile(file) {
    if (!file) return

    setPhotoBusy(true)
    setPhotoError('')

    try {
      const dataUrl = await fileToDataUrl(file)
      setPhoto(dataUrl)
    } catch (error) {
      setPhotoError(error.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  function handleFileInput(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    processFile(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleNativeCamera() {
    cameraInputRef.current?.click()
    setCameraOpen(false)
  }

  function handleCapture(dataUrl) {
    setPhoto(dataUrl)
    setPhotoError('')
    setCameraOpen(false)
  }

  function handleCancel() {
    setForm(EMPTY_FORM)
    setPhoto('')
    setPhotoError('')
    onCancelEdit()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      photo: photo || null,
    }

    setSaving(true)

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        notify('Produit mis à jour.', 'success')
        onCancelEdit()
      } else {
        await addProduct({ ...payload, price: null })
        notify('Produit ajouté — en attente de prix.', 'success')
      }

      setForm(EMPTY_FORM)
      setPhoto('')
      setPhotoError('')
    } catch (error) {
      notify(describeDataError(error), 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel-card p-3 p-lg-4" aria-labelledby="form-title">
      <div className="d-flex align-items-start gap-3 mb-3">
        <div className="section-icon" aria-hidden="true">
          <i className={`bi ${editingProduct ? 'bi-pencil-square' : 'bi-camera-fill'}`}></i>
        </div>
        <div>
          <h2 className="h5 mb-1" id="form-title">
            {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <p className="text-muted small mb-0">
            Ajoutez la photo et les informations. Le prix sera complété par votre collègue.
          </p>
        </div>
      </div>

      {editingProduct && (
        <div className="editing-banner">
          <i className="bi bi-info-circle-fill" aria-hidden="true"></i>
          <span className="text-truncate">
            Modification de « {editingProduct.name || 'Sans nom'} »
          </span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit}>
        <div
          className={`photo-frame ${photo ? 'has-photo' : ''} ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {photo ? (
            <img src={photo} alt="Aperçu du produit" />
          ) : (
            <div className="photo-placeholder">
              <i className="bi bi-camera" aria-hidden="true"></i>
              <strong>Ajoutez une photo</strong>
              <span>Prenez une photo ou glissez une image ici</span>
            </div>
          )}

          {photoBusy && (
            <div className="photo-loading" role="status" aria-live="polite">
              <span className="spinner-border text-light" aria-hidden="true"></span>
              <span>Traitement…</span>
            </div>
          )}

          {photo && !photoBusy && (
            <div className="photo-actions">
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => setPhoto('')}
                aria-label="Retirer la photo"
                title="Retirer la photo"
              >
                <i className="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </div>
          )}
        </div>

        <div className="d-flex gap-2 mt-2">
          <button
            type="button"
            className="btn btn-primary flex-grow-1"
            onClick={() => setCameraOpen(true)}
            disabled={photoBusy}
          >
            <i className="bi bi-camera-fill me-2" aria-hidden="true"></i>
            {photo ? 'Reprendre' : 'Prendre une photo'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary flex-grow-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoBusy}
          >
            <i className="bi bi-images me-2" aria-hidden="true"></i>
            Galerie
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleFileInput}
          tabIndex={-1}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="visually-hidden"
          onChange={handleFileInput}
          tabIndex={-1}
        />

        <p className="form-text mt-2 mb-0">
          <i className="bi bi-magic me-1" aria-hidden="true"></i>
          La photo est automatiquement compressée pour Firestore.
        </p>

        {photoError && (
          <div className="alert alert-danger py-2 px-3 small mt-2 mb-0 d-flex align-items-start gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill mt-1" aria-hidden="true"></i>
            <span>{photoError}</span>
          </div>
        )}

        <div className="mt-3">
          <label className="form-label" htmlFor="product-name">
            Nom du produit <span className="fw-normal text-muted">(facultatif)</span>
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            className="form-control"
            placeholder="Ex. Roman « Les Misérables »"
            value={form.name}
            onChange={handleChange}
            maxLength={80}
            autoComplete="off"
          />
          <div className="form-text">
            Laissez vide si vous ne connaissez pas le nom : il pourra être complété avec le prix.
          </div>
        </div>

        <div className="d-grid gap-2 mt-4">
          <button type="submit" className="btn btn-primary py-2" disabled={saving || photoBusy}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Enregistrement…
              </>
            ) : (
              <>
                <i
                  className={`bi ${editingProduct ? 'bi-check2-circle' : 'bi-plus-circle'} me-2`}
                  aria-hidden="true"
                ></i>
                {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
              </>
            )}
          </button>

          {editingProduct && (
            <button type="button" className="btn btn-light border" onClick={handleCancel} disabled={saving}>
              <i className="bi bi-x-lg me-2" aria-hidden="true"></i>
              Annuler
            </button>
          )}
        </div>

        {!editingProduct && (
          <p className="form-text text-center mt-2 mb-0">
            <i className="bi bi-cash-coin me-1" aria-hidden="true"></i>
            Le prix se renseigne ensuite dans l’onglet « Prix à compléter ».
          </p>
        )}
      </form>

      {cameraOpen && (
        <CameraModal
          open
          onClose={() => setCameraOpen(false)}
          onCapture={handleCapture}
          onFallback={handleNativeCamera}
        />
      )}
    </section>
  )
}
