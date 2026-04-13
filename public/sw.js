const CACHE_NAME = 'uni-schedule-v2'
const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest']

function isHttpRequest(url) {
  return url.protocol === 'http:' || url.protocol === 'https:'
}

function safeCachePut(request, response) {
  const requestUrl = new URL(request.url)
  if (!isHttpRequest(requestUrl)) {
    return
  }

  const responseUrl = response.url ? new URL(response.url) : requestUrl
  if (!isHttpRequest(responseUrl)) {
    return
  }

  caches.open(CACHE_NAME).then((cache) => {
    cache.put(request, response).catch(() => {
      // Ignore cache write failures for unsupported or transient responses.
    })
  })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)
  if (!isHttpRequest(requestUrl)) {
    return
  }

  const isNavigationRequest = event.request.mode === 'navigate'
  const isAppShellRequest = requestUrl.origin === self.location.origin && (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html' || requestUrl.pathname === '/manifest.webmanifest')

  if (isNavigationRequest || isAppShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          safeCachePut(event.request, copy)
          return response
        })
        .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/index.html'))),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          safeCachePut(event.request, copy)
          return response
        })
        .catch(() => caches.match('/index.html'))
    }),
  )
})
