import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import PriceCompletionPanel from './components/PriceCompletionPanel'
import ProductForm from './components/ProductForm'
import ProductsPanel from './components/ProductsPanel'
import ToastStack from './components/ToastStack'
import { APP_NAME } from './config'
import useProducts from './hooks/useProducts'
import { createId, hasPrice } from './lib/format'
import { deleteProduct, describeDataError, storageMode } from './lib/products'

export default function App() {
  const { products, loading, error } = useProducts()
  const [activeTab, setActiveTab] = useState(() =>
    typeof window !== 'undefined' && window.location.hash === '#prix' ? 'prix' : 'saisie',
  )
  const [editingProduct, setEditingProduct] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState([])
  const formAnchorRef = useRef(null)

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(window.location.hash === '#prix' ? 'prix' : 'saisie')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const changeTab = useCallback((tab) => {
    setActiveTab(tab)
    const hash = tab === 'prix' ? '#prix' : ''
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${hash}`,
    )
  }, [])

  const notify = useCallback((message, variant = 'success') => {
    setToasts((previous) => [...previous, { id: createId(), message, variant }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const stats = useMemo(() => {
    let pendingCount = 0

    products.forEach((product) => {
      if (!hasPrice(product.price)) pendingCount += 1
    })

    return { count: products.length, pendingCount }
  }, [products])

  const handleEdit = useCallback((product) => {
    setEditingProduct(product)
    if (window.matchMedia('(max-width: 1199.98px)').matches) {
      window.setTimeout(() => {
        formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
    }
  }, [])

  const handleCancelEdit = useCallback(() => setEditingProduct(null), [])

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmingDelete) return

    setDeleting(true)
    try {
      await deleteProduct(confirmingDelete.id)
      if (editingProduct?.id === confirmingDelete.id) setEditingProduct(null)
      setConfirmingDelete(null)
      notify('Produit supprimé.', 'success')
    } catch (deleteError) {
      notify(describeDataError(deleteError), 'danger')
    } finally {
      setDeleting(false)
    }
  }, [confirmingDelete, editingProduct, notify])

  const isFirestore = storageMode === 'firestore'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container-xxl py-4 py-lg-5">
          <div className="d-flex flex-wrap align-items-center gap-3 gap-lg-4">
            <div className="brand">
              <div className="brand-badge" aria-hidden="true">
                <i className="bi bi-camera-fill"></i>
              </div>
              <div className="min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h1 className="h3 fw-bold text-white mb-0">{APP_NAME}</h1>
                  <span className={`mode-pill ${isFirestore ? 'mode-live' : 'mode-demo'}`}>
                    <span className="mode-dot" aria-hidden="true"></span>
                    {isFirestore ? 'Firestore connecté' : 'Démo locale'}
                  </span>
                </div>
                <p className="header-subtitle mb-0">
                  Photos et inventaire · les prix sont complétés par l’équipe
                </p>
              </div>
            </div>

            <div className="header-stats d-flex flex-wrap gap-2">
              <div className="stat-chip">
                <span className="stat-icon" aria-hidden="true">
                  <i className="bi bi-box-seam"></i>
                </span>
                <span className="min-w-0">
                  <span className="stat-value d-block">{stats.count}</span>
                  <span className="stat-label d-block">Produits</span>
                </span>
              </div>

              <button
                type="button"
                className="stat-chip stat-chip-button"
                onClick={() => changeTab('prix')}
                title="Voir les produits sans prix"
              >
                <span className="stat-icon stat-icon-warn" aria-hidden="true">
                  <i className="bi bi-hourglass-split"></i>
                </span>
                <span className="min-w-0">
                  <span className="stat-value d-block">{stats.pendingCount}</span>
                  <span className="stat-label d-block">À compléter</span>
                </span>
              </button>

            </div>
          </div>
        </div>
      </header>

      <main className="container-xxl py-4">
        {!isFirestore && (
          <div className="setup-alert d-flex align-items-start gap-3 mb-4" role="status">
            <span className="setup-alert-icon" aria-hidden="true">
              <i className="bi bi-cloud-slash"></i>
            </span>
            <div className="min-w-0">
              <strong>Mode démo — Firestore n’est pas configuré.</strong>
              <div className="small mt-1">
                Les produits et les photos sont enregistrés uniquement dans ce navigateur.
                Pour que votre collègue voie les mêmes produits depuis un autre appareil,
                ajoutez vos clés Firebase dans un fichier <code>.env.local</code>, puis redémarrez
                l’application (voir le README).
              </div>
            </div>
          </div>
        )}

        <div className="app-tabbar mb-4">
          <div className="nav nav-pills app-tabs" role="tablist" aria-label="Sections de l’application">
            <button
              type="button"
              id="tab-saisie"
              className={`nav-link ${activeTab === 'saisie' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'saisie'}
              aria-controls="panel-saisie"
              tabIndex={activeTab === 'saisie' ? 0 : -1}
              onClick={() => changeTab('saisie')}
            >
              <i className="bi bi-camera-fill me-2" aria-hidden="true"></i>
              Saisie & inventaire
            </button>

            <button
              type="button"
              id="tab-prix"
              className={`nav-link ${activeTab === 'prix' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'prix'}
              aria-controls="panel-prix"
              tabIndex={activeTab === 'prix' ? 0 : -1}
              onClick={() => changeTab('prix')}
            >
              <i className="bi bi-cash-coin me-2" aria-hidden="true"></i>
              Prix à compléter
              {stats.pendingCount > 0 && <span className="tab-count">{stats.pendingCount}</span>}
            </button>
          </div>
        </div>

        <div
          id="panel-saisie"
          role="tabpanel"
          aria-labelledby="tab-saisie"
          hidden={activeTab !== 'saisie'}
        >
          <div className="row g-3 g-lg-4 align-items-start">
            <div className="col-12 col-xl-4" ref={formAnchorRef}>
              <ProductForm
                key={editingProduct?.id || 'new'}
                editingProduct={editingProduct}
                notify={notify}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <div className="col-12 col-xl-8">
              <ProductsPanel
                products={products}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={setConfirmingDelete}
              />
            </div>
          </div>
        </div>

        <div
          id="panel-prix"
          role="tabpanel"
          aria-labelledby="tab-prix"
          hidden={activeTab !== 'prix'}
        >
          <PriceCompletionPanel
            products={products}
            loading={loading}
            error={error}
            notify={notify}
            onGoToCapture={() => changeTab('saisie')}
          />
        </div>
      </main>

      <footer className="container-xxl pb-4 text-center text-muted small">
        <span className="d-inline-flex flex-wrap align-items-center justify-content-center gap-2">
          <i className={`bi ${isFirestore ? 'bi-cloud-check' : 'bi-hdd'}`} aria-hidden="true"></i>
          {isFirestore ? 'Données synchronisées avec Firestore' : 'Données stockées localement (démo)'}
          <span aria-hidden="true">·</span>
          <span>Photos compressées automatiquement</span>
        </span>
      </footer>

      <ConfirmDeleteModal
        product={confirmingDelete}
        busy={deleting}
        onClose={() => {
          if (!deleting) setConfirmingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
