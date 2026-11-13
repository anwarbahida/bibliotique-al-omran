import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, firebaseConfigured } from '../firebase'
import { createId } from './format'

const COLLECTION = 'products'
const LOCAL_KEY = 'alomran.products.v1'
const LOCAL_EVENT = 'alomran:products-updated'

export const storageMode = firebaseConfigured ? 'firestore' : 'local'

function readLocal() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(products) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(products))
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || /quota/i.test(error?.message || '')) {
      throw new Error(
        "Le stockage du navigateur est plein. Supprimez quelques produits (mode démo) ou configurez Firestore.",
      )
    }
    throw error
  }
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

function sortLocal(products) {
  return [...products].sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
}

export function subscribeProducts({ onData, onError }) {
  if (firebaseConfigured) {
    const productsQuery = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(
      productsQuery,
      (snapshot) => {
        onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      },
      (error) => {
        onError?.(error)
      },
    )
  }

  const emit = () => onData(sortLocal(readLocal()))

  emit()
  window.addEventListener(LOCAL_EVENT, emit)
  window.addEventListener('storage', emit)

  return () => {
    window.removeEventListener(LOCAL_EVENT, emit)
    window.removeEventListener('storage', emit)
  }
}

export async function addProduct(payload) {
  if (firebaseConfigured) {
    const reference = await addDoc(collection(db, COLLECTION), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return reference.id
  }

  const now = Date.now()
  const product = { ...payload, id: createId(), createdAt: now, updatedAt: now }
  writeLocal([product, ...readLocal()])
  return product.id
}

export async function updateProduct(id, payload) {
  if (firebaseConfigured) {
    await updateDoc(doc(db, COLLECTION, id), {
      ...payload,
      updatedAt: serverTimestamp(),
    })
    return
  }

  const now = Date.now()
  writeLocal(readLocal().map((product) => (product.id === id ? { ...product, ...payload, updatedAt: now } : product)))
}

export async function deleteProduct(id) {
  if (firebaseConfigured) {
    await deleteDoc(doc(db, COLLECTION, id))
    return
  }

  writeLocal(readLocal().filter((product) => product.id !== id))
}

export function describeDataError(error) {
  const code = error?.code || ''

  if (code.includes('permission-denied')) {
    return "Accès refusé par Firestore. Vérifiez les règles de sécurité de la base (voir le README)."
  }
  if (code.includes('unavailable')) {
    return 'Firestore est injoignable. Vérifiez votre connexion internet puis rechargez la page.'
  }
  if (code.includes('failed-precondition')) {
    return 'Firestore demande une configuration supplémentaire (index ou base non créée). Consultez la console Firebase.'
  }
  if (code.includes('resource-exhausted')) {
    return 'Le quota Firestore est dépassé. Réessayez plus tard.'
  }
  if (error?.name === 'QuotaExceededError' || /quota/i.test(error?.message || '')) {
    return 'Le stockage du navigateur est plein. Supprimez quelques produits ou configurez Firestore.'
  }
  if (error?.code === 'unauthenticated') {
    return "Firestore refuse l'accès anonyme. Autorisez la lecture et l'écriture dans les règles (voir le README)."
  }

  return error?.message || 'Une erreur est survenue lors de la communication avec la base de données.'
}
