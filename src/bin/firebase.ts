import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB5ZcrphkR6qbJqYRAGY1sHHYpmklEQB0s',
  authDomain: 'uni-schedule-861dc.firebaseapp.com',
  projectId: 'uni-schedule-861dc',
  storageBucket: 'uni-schedule-861dc.firebasestorage.app',
  messagingSenderId: '784800330330',
  appId: '1:784800330330:web:be5f5177da785ad1f0de63',
}

export const app = initializeApp(firebaseConfig)

// Firestore local cache keeps reads fast and supports offline-first UX.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export const auth = getAuth(app)