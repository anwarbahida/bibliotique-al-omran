import { formatDate } from '../lib/format'
import PriceLabel from './PriceLabel'
import ProductThumb from './ProductThumb'

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="col-12 col-sm-6">
      <div className="product-card h-100">
        <ProductThumb product={product} alt={product.name || 'Produit sans nom'} className="product-card-img" />

        <div className="card-body p-3 d-flex flex-column">
          <h3
            className={`h6 product-name mb-2 min-w-0 text-truncate ${product.name ? '' : 'product-name-empty'}`}
            title={product.name || 'Sans nom'}
          >
            {product.name || 'Sans nom'}
          </h3>

          <div className="mt-auto pt-2 d-flex align-items-center justify-content-between gap-2">
            <div className="product-price">
              <PriceLabel value={product.price} />
            </div>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-sm btn-icon btn-icon-soft"
                onClick={() => onEdit(product)}
                title="Modifier"
                aria-label={`Modifier ${product.name || 'ce produit'}`}
              >
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-icon-danger"
                onClick={() => onDelete(product)}
                title="Supprimer"
                aria-label={`Supprimer ${product.name || 'ce produit'}`}
              >
                <i className="bi bi-trash3" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div className="product-meta mt-2">
            <i className="bi bi-clock me-1" aria-hidden="true"></i>
            Ajouté le {formatDate(product.createdAt)}
          </div>
        </div>
      </div>
    </article>
  )
}
