export const APP_NAME = 'Biblio Imran'

export const CURRENCY = (import.meta.env.VITE_CURRENCY || '').trim()

export const moneyFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'

  const number = Number(value)
  if (!Number.isFinite(number)) return '—'

  const formatted = moneyFormatter.format(number)
  return CURRENCY ? `${formatted} ${CURRENCY}` : formatted
}
