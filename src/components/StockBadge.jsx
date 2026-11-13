export default function StockBadge({ quantity }) {
  const value = Number(quantity) || 0

  if (value <= 0) {
    return (
      <span className="stock-badge stock-out">
        <i className="bi bi-x-circle" aria-hidden="true"></i>
        Rupture
      </span>
    )
  }

  if (value <= 3) {
    return (
      <span className="stock-badge stock-low" title="Stock faible">
        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
        {value} en stock
      </span>
    )
  }

  return (
    <span className="stock-badge stock-ok">
      <i className="bi bi-check2-circle" aria-hidden="true"></i>
      {value} en stock
    </span>
  )
}
