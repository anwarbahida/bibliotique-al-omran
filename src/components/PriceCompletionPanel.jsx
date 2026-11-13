import { useMemo, useState } from 'react'
import { CURRENCY } from '../config'
import { formatDate, hasPrice, toDate } from '../lib/format'
import { describeDataError, updateProduct } from '../lib/products'
import PhotoLightbox from './PhotoLightbox'
import ProductThumb from './ProductThumb'

function PriceItem({ product, notify }) {
  const [price, setPrice] = useState(hasPrice(product.price) ? String(product.price) : '')
  const [name, setName] = useState(product.name || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const nameMissing = !(product.name || '').trim()
  const priced = hasPrice(product.price)

  async function handleSubmit(event) {
    event.preventDefault()

    const parsedPrice = Number(price)
    if (price.trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Saisissez un prix valide (0 ou plus).')
      return
    }

    const trimmedName = name.trim()
    const updates = { price: parsedPrice }
    if (nameMissing && trimmedName) updates.name = trimmedName

    setSaving(true)
    setError('')

    try {
      await updateProduct(product.id, updates)
      notify(
        priced
          ? 'Prix mis à jour.'
          : `Prix enregistré${trimmedName ? ` pour « ${trimmedName} »` : ''}.`,
        'success',
      )
    } catch (saveError) {
      const message = describeDataError(saveError)
      setError(message)
      notify(message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className={`price-item ${priced ? '' : 'is-pending'}`}>
      {product.photo ? (
        <button
          type="button"
          className="price-photo-button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Agrandir la photo de ${product.name || 'ce produit'}`}
          title="Voir la photo en plein écran"
        >
          <ProductThumb
            product={product}
            alt={product.name || 'Produit sans nom'}
            className="price-photo"
          />
          <span className="price-photo-zoom" aria-hidden="true">
            <i className="bi bi-arrows-fullscreen"></i>
          </span>
        </button>
      ) : (
        <ProductThumb
          product={product}
          alt={product.name || 'Produit sans nom'}
          className="price-photo"
        />
      )}

      <div className="price-item-body min-w-0">
        {nameMissing ? (
          <>
            <label className="visually-hidden" htmlFor={`price-name-${product.id}`}>
              Nom du produit
            </label>
            <input
              id={`price-name-${product.id}`}
              type="text"
              className="form-control price-name-input"
              placeholder="Ajouter le nom du produit (facultatif)"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              autoComplete="off"
            />
          </>
        ) : (
          <h3 className="price-name mb-0 text-truncate" title={product.name}>
            {product.name}
          </h3>
        )}

        <div className="price-item-meta">
          <span>Ajouté le {formatDate(product.createdAt)}</span>
          {priced && (
            <span className="price-state">
              <i className="bi bi-check2-circle" aria-hidden="true"></i>
              Tarifé
            </span>
          )}
        </div>
      </div>

      <form className="price-item-form" onSubmit={handleSubmit} noValidate>
        <div className="price-field">
          <label className="form-label" htmlFor={`price-${product.id}`}>
            Prix
          </label>
          <div className="input-group">
            <input
              id={`price-${product.id}`}
              type="number"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder="0"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                if (error) setError('')
              }}
              min="0"
              step="0.01"
              inputMode="decimal"
            />
            {CURRENCY && <span className="input-group-text">{CURRENCY}</span>}
          </div>
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>

        <button type="submit" className="btn btn-primary price-save" disabled={saving}>
          {saving ? (
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
          ) : (
            <>
              <i className="bi bi-check2 me-2" aria-hidden="true"></i>
              {priced ? 'Mettre à jour' : 'Enregistrer'}
            </>
          )}
        </button>
      </form>

      <PhotoLightbox
        open={lightboxOpen}
        photo={product.photo}
        name={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  )
}

export default function PriceCompletionPanel({ products, loading, error, notify, onGoToCapture }) {
  const [filter, setFilter] = useState('pending')

  const pendingProducts = useMemo(
    () => products.filter((product) => !hasPrice(product.price)),
    [products],
  )

  const displayedProducts = useMemo(() => {
    const list = filter === 'pending' ? pendingProducts : products

    return [...list].sort((a, b) => {
      const pendingA = hasPrice(a.price) ? 1 : 0
      const pendingB = hasPrice(b.price) ? 1 : 0
      if (pendingA !== pendingB) return pendingA - pendingB

      const timeA = toDate(a.createdAt)?.getTime() || 0
      const timeB = toDate(b.createdAt)?.getTime() || 0
      return timeB - timeA
    })
  }, [filter, pendingProducts, products])

  const showLoading = loading && products.length === 0

  return (
    <section className="panel-card p-3 p-lg-4" aria-labelledby="price-title">
      <div className="d-flex flex-wrap align-items-start gap-3 mb-3">
        <div className="section-icon" aria-hidden="true">
          <i className="bi bi-cash-coin"></i>
        </div>
        <div className="min-w-0">
          <h2 className="h5 mb-1" id="price-title">
            Compléter les prix
          </h2>
          <p className="text-muted small mb-0">
            Saisissez le prix en face de chaque photo. Vous pouvez aussi ajouter le nom s’il manque.
          </p>
        </div>
        <span className={`pending-pill ms-lg-auto ${pendingProducts.length ? 'pending-pill-warn' : 'pending-pill-ok'}`}>
          <i className={`bi ${pendingProducts.length ? 'bi-hourglass-split' : 'bi-check2-circle'}`} aria-hidden="true"></i>
          {pendingProducts.length
            ? `${pendingProducts.length} en attente`
            : 'Tous les prix sont renseignés'}
        </span>
      </div>

      <div className="price-toolbar">
        <div className="btn-group" role="group" aria-label="Filtrer les produits">
          <button
            type="button"
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
            aria-pressed={filter === 'pending'}
            onClick={() => setFilter('pending')}
          >
            À compléter ({pendingProducts.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Tous ({products.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-start gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-octagon-fill mt-1" aria-hidden="true"></i>
          <div className="min-w-0">
            <strong>Connexion aux données impossible.</strong>
            <div className="small mt-1">{describeDataError(error)}</div>
          </div>
        </div>
      )}

      {showLoading ? (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner-border text-primary" aria-hidden="true"></span>
          <span>Chargement des produits…</span>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <i className="bi bi-camera"></i>
          </div>
          <h3 className="h6 mb-1">Aucun produit à tarifer</h3>
          <p className="small mb-3">
            Commencez par ajouter des produits avec leurs photos depuis l’onglet de saisie.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onGoToCapture}>
            <i className="bi bi-plus-circle me-2" aria-hidden="true"></i>
            Ajouter un produit
          </button>
        </div>
      ) : pendingProducts.length === 0 && filter === 'pending' ? (
        <div className="empty-state">
          <div className="empty-icon empty-icon-success" aria-hidden="true">
            <i className="bi bi-check2-circle"></i>
          </div>
          <h3 className="h6 mb-1">Tous les prix sont renseignés</h3>
          <p className="small mb-3">
            Les produits en attente de prix apparaîtront automatiquement ici.
          </p>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setFilter('all')}>
            Voir tous les produits
          </button>
        </div>
      ) : (
        <>
          <div className="price-list">
            {displayedProducts.map((product) => (
              <PriceItem key={product.id} product={product} notify={notify} />
            ))}
          </div>

          <p className="text-muted small mt-3 mb-0">
            <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
            Les prix sont enregistrés instantanément dans Firestore et visibles par tous.
          </p>
        </>
      )}
    </section>
  )
}
