import {
	getRedirectResult,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signInWithRedirect,
	signOut,
	type AuthError,
	type User,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
	prompt: 'select_account',
})

function shouldUseRedirectSignIn() {
	if (typeof window === 'undefined') {
		return false
	}

	const mobileLikeDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
	const standaloneMode = window.matchMedia('(display-mode: standalone)').matches
	return mobileLikeDevice || standaloneMode
}

export function watchAuthState(listener: (user: User | null) => void) {
	return onAuthStateChanged(auth, listener)
}

export async function signInWithGoogle() {
	if (auth.currentUser) {
		return { mode: 'already-signed-in' as const, user: auth.currentUser }
	}

	if (shouldUseRedirectSignIn()) {
		await signInWithRedirect(auth, googleProvider)
		return { mode: 'redirect' as const, user: null }
	}

	try {
		const credential = await signInWithPopup(auth, googleProvider)
		return { mode: 'popup' as const, user: credential.user }
	} catch (error) {
		const code = (error as Partial<AuthError>).code
		const shouldUseRedirect =
			code === 'auth/popup-blocked' ||
			code === 'auth/popup-closed-by-user' ||
			code === 'auth/cancelled-popup-request' ||
			code === 'auth/operation-not-supported-in-this-environment'

		if (!shouldUseRedirect) {
			throw error
		}

		await signInWithRedirect(auth, googleProvider)
		return { mode: 'redirect' as const, user: null }
	}
}

export async function consumeGoogleRedirectResult() {
	const result = await getRedirectResult(auth)
	return result?.user ?? null
}

export function getAuthErrorMessage(error: unknown) {
	const code = (error as Partial<AuthError>)?.code

	if (code === 'auth/unauthorized-domain') {
		return 'OAuthドメイン未許可です。Firebase Consoleで127.0.0.1/localhostをAuthorized domainsに追加してください。'
	}
	if (code === 'auth/popup-closed-by-user') {
		return 'ログインポップアップが閉じられました。もう一度お試しください。'
	}
	if (code === 'auth/popup-blocked') {
		return 'ポップアップがブロックされました。ブラウザ設定を確認してください。'
	}
	if (code === 'auth/network-request-failed') {
		return 'ネットワークエラーでログインに失敗しました。通信を確認してください。'
	}

	return 'Googleログインに失敗しました'
}

export function signOutCurrentUser() {
  return signOut(auth)
}
