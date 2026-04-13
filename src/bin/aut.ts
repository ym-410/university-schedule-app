import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
	prompt: 'select_account',
})

export function watchAuthState(listener: (user: User | null) => void) {
	return onAuthStateChanged(auth, listener)
}

export async function signInWithGoogle() {
	if (auth.currentUser) {
		return auth.currentUser
	}
	const credential = await signInWithPopup(auth, googleProvider)
	return credential.user
}

export function signOutCurrentUser() {
	return signOut(auth)
}
