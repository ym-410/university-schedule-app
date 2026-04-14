import {
	getRedirectResult,
	GoogleAuthProvider,
	onAuthStateChanged,
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
	return true
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
}

export async function consumeGoogleRedirectResult() {
	const result = await getRedirectResult(auth)
	return result?.user ?? null
}

export function getAuthErrorMessage(error: unknown) {
	const code = (error as Partial<AuthError>)?.code
	const message = (error as Partial<AuthError>)?.message

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

	if (code) {
		return `Googleログインに失敗しました (${code})`
	}

	if (message) {
		return `Googleログインに失敗しました (${message})`
	}

	return 'Googleログインに失敗しました'
}

export function signOutCurrentUser() {
  return signOut(auth)
}
