import { useMemo, useState } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'
import { hasPrice, normalizeText, toDate } from '../lib/format'
import { describeDataError } from '../lib/products'
import ProductCard from './ProductCard'
import ProductTable from './ProductTable'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'name', label: 'Nom (A → Z)' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'price-asc', label: 'Prix croissant' },
]

function EmptyState({ hasProducts, onReset }) {
  if (hasProducts) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <i className="bi bi-search" aria-hidden="true"></i>
        </div>
        <h3 className="h6 mb-1">Aucun résultat</h3>
        <p className="small mb-3">Aucun produit ne correspond à votre recherche.</p>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onReset}>
          Réinitialiser les filtres
        </button>
      </div>
    )
  }

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <i className="bi bi-box-seam" aria-hidden="true"></i>
      </div>
      <h3 className="h6 mb-1">Votre inventaire est vide</h3>
      <p className="small mb-0">
        Ajoutez votre premier produit avec sa photo grâce au formulaire.
      </p>
    </div>
  )
}

function sortProducts(products, sort) {
  const sorted = [...products]

  if (sort === 'name') {
    return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
  }
  if (sort === 'price-desc') {
    return sorted.sort((a, b) => {
      const priceA = hasPrice(a.price) ? Number(a.price) : -Infinity
      const priceB = hasPrice(b.price) ? Number(b.price) : -Infinity
      return priceB - priceA
    })
  }
  if (sort === 'price-asc') {
    return sorted.sort((a, b) => {
      const priceA = hasPrice(a.price) ? Number(a.price) : Infinity
      const priceB = hasPrice(b.price) ? Number(b.price) : Infinity
      return priceA - priceB
    })
  }
  return sorted.sort((a, b) => {
    const timeA = toDate(a.createdAt)?.getTime() || 0
    const timeB = toDate(b.createdAt)?.getTime() || 0
    return timeB - timeA
  })
}

export default function ProductsPanel({ products, loading, error, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const isDesktop = useMediaQuery('(min-width: 992px)')

  const filteredProducts = useMemo(() => {
    const term = normalizeText(search.trim())

    const filtered = products.filter((product) => {
      if (!term) return true
      return normalizeText(product.name || '').includes(term)
    })

    return sortProducts(filtered, sort)
  }, [products, search, sort])

  function resetFilters() {
    setSearch('')
    setSort('recent')
  }

  const showLoading = loading && products.length === 0
  const showEmpty = !showLoading && filteredProducts.length === 0

  return (
    <section className="panel-card p-3 p-lg-4" aria-labelledby="inventory-title">
      <div className="d-flex flex-wrap align-items-start gap-2 mb-3">
        <div className="d-flex align-items-start gap-3">
          <div className="section-icon section-icon-soft" aria-hidden="true">
            <i className="bi bi-grid-3x3-gap-fill"></i>
          </div>
          <div>
            <h2 className="h5 mb-1" id="inventory-title">
              Inventaire
            </h2>
            <p className="text-muted small mb-0" aria-live="polite">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} affiché
              {filteredProducts.length > 1 ? 's' : ''}
              {products.length !== filteredProducts.length ? ` sur ${products.length}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-8">
          <div className="search-field">
            <i className="bi bi-search search-icon" aria-hidden="true"></i>
            <input
              type="search"
              className="form-control ps-5"
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
              >
                <i className="bi bi-x-circle-fill" aria-hidden="true"></i>
              </button>
            )}
          </div>
        </div>

        <div className="col-12 col-md-4">
          <select
            className="form-select"
            aria-label="Trier les produits"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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
          <span>Chargement de l’inventaire…</span>
        </div>
      ) : showEmpty ? (
        <EmptyState hasProducts={products.length > 0} onReset={resetFilters} />
      ) : isDesktop ? (
        <ProductTable products={filteredProducts} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <div className="row g-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  )
}
