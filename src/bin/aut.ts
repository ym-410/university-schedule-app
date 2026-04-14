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

function isStandaloneMode() {
	if (typeof window === 'undefined') {
		return false
	}
	const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches
	const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
	return mediaStandalone || iosStandalone
}

function isInAppBrowser() {
	if (typeof navigator === 'undefined') {
		return false
	}
	return /FBAN|FBAV|Instagram|Line|Twitter|wv\)|WebView/i.test(navigator.userAgent)
}

export function watchAuthState(listener: (user: User | null) => void) {
	return onAuthStateChanged(auth, listener)
}

function shouldFallbackToRedirect(code?: string) {
	return (
		code === 'auth/popup-blocked' ||
		code === 'auth/popup-closed-by-user' ||
		code === 'auth/cancelled-popup-request' ||
		code === 'auth/operation-not-supported-in-this-environment'
	)
}
export async function signInWithGoogle() {
	if (auth.currentUser) {
		return { mode: 'already-signed-in' as const, user: auth.currentUser }
	}

	if (isInAppBrowser()) {
		throw { code: 'auth/in-app-browser-unsupported' }
	}
	if (isStandaloneMode()) {
		throw { code: 'auth/pwa-standalone-unsupported' }
	}

	try {
		const credential = await signInWithPopup(auth, googleProvider)
		return { mode: 'popup' as const, user: credential.user }
	} catch (error) {
		const code = (error as Partial<AuthError>).code
		if (!shouldFallbackToRedirect(code)) {
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
	if (code === 'auth/in-app-browser-unsupported') {
		return 'アプリ内ブラウザではログインできません。Safari/Chrome本体でページを開いてください。'
	}
	if (code === 'auth/pwa-standalone-unsupported') {
		return 'PWAアプリ内ではGoogleログインできません。ブラウザでこのページを開いてログインしてください。'
	}
	if (code === 'auth/invalid-api-key') {
		return 'Firebase APIキーが無効です。環境変数 VITE_FIREBASE_API_KEY を確認してください。'
	}
	if (code === 'auth/invalid-app-credential') {
		return 'アプリ認証情報が無効です。Firebase設定値（apiKey/authDomain/appId）の整合を確認してください。'
	}
	if (code === 'auth/operation-not-allowed') {
		return 'Firebase AuthenticationでGoogleプロバイダが無効です。Sign-in methodを確認してください。'
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
