import { useEffect, useState } from 'react'
import { subscribeProducts } from '../lib/products'

export default function useProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: null })

  useEffect(() => {
    const unsubscribe = subscribeProducts({
      onData: (products) => setState({ products, loading: false, error: null }),
      onError: (error) => setState((previous) => ({ ...previous, loading: false, error })),
    })

    return unsubscribe
  }, [])

  return state
}
