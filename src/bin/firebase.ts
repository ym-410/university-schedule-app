import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function normalizeAuthDomain(value: unknown) {
  if (typeof value !== 'string') return ''

  return value
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}

function isSupportedAuthDomain(domain: string) {
  return domain.endsWith('.firebaseapp.com') || domain.endsWith('.web.app')
}

const normalizedAuthDomain = normalizeAuthDomain(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isSupportedAuthDomain(normalizedAuthDomain)
    ? normalizedAuthDomain
    : undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)