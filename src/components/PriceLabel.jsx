import { formatMoney } from '../config'
import { hasPrice } from '../lib/format'

export default function PriceLabel({ value }) {
  if (!hasPrice(value)) {
    return (
      <span className="price-missing">
        <i className="bi bi-hourglass-split" aria-hidden="true"></i>
        À compléter
      </span>
    )
  }

  return <span>{formatMoney(value)}</span>
}
