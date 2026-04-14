import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB5ZcrphkR6qbJqYRAGY1sHHYpmklEQB0s',
  authDomain: 'uni-schedule-861dc.firebaseapp.com',
  projectId: 'uni-schedule-861dc',
  storageBucket: 'uni-schedule-861dc.firebasestorage.app',
  messagingSenderId: '784800330330',
  appId: '1:784800330330:web:be5f5177da785ad1f0de63',
}

function normalizeAuthDomain(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: isSupportedAuthDomain(normalizedAuthDomain)
    ? normalizedAuthDomain
    : DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)