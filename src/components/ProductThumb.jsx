export default function ProductThumb({ product, alt = '', className = 'thumb-sm' }) {
  if (product.photo) {
    return (
      <img
        src={product.photo}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div className={`${className} thumb-placeholder`} aria-hidden="true">
      <i className="bi bi-image"></i>
    </div>
  )
}
