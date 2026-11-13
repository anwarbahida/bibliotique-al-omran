import { formatDate } from '../lib/format'
import PriceLabel from './PriceLabel'
import ProductThumb from './ProductThumb'
import StockBadge from './StockBadge'

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table inventory-table align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Produit</th>
            <th scope="col" className="text-end">Prix</th>
            <th scope="col" className="text-center">Stock</th>
            <th scope="col">Ajouté</th>
            <th scope="col" className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <ProductThumb product={product} alt="" />
                  <div className="min-w-0">
                    <div
                      className={`product-name text-truncate ${product.name ? '' : 'product-name-empty'}`}
                      title={product.name || 'Sans nom'}
                    >
                      {product.name || 'Sans nom'}
                    </div>
                    <div className="product-meta text-truncate">
                      {product.category || 'Sans catégorie'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-end fw-semibold text-nowrap">
                <PriceLabel value={product.price} />
              </td>
              <td className="text-center">
                <StockBadge quantity={product.quantity} />
              </td>
              <td className="text-muted small text-nowrap">{formatDate(product.createdAt)}</td>
              <td className="text-end text-nowrap">
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
                  className="btn btn-sm btn-icon btn-icon-danger ms-1"
                  onClick={() => onDelete(product)}
                  title="Supprimer"
                  aria-label={`Supprimer ${product.name || 'ce produit'}`}
                >
                  <i className="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
