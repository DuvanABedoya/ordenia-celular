// Guarda la app (no los datos) para que abra sin señal. Las páginas se piden primero a la red y,
// si no hay, salen de lo guardado; los archivos con huella (assets/) salen de lo guardado.
// Nada de Google (googleapis, accounts) pasa por aquí.

const CACHE = 'ordenia-celular-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return

  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (guardado) =>
          guardado ||
          fetch(e.request).then((r) => {
            const copia = r.clone()
            caches.open(CACHE).then((c) => c.put(e.request, copia))
            return r
          })
      )
    )
    return
  }

  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copia))
        return r
      })
      .catch(() =>
        caches
          .match(e.request, { ignoreSearch: true })
          .then((g) => g || caches.match('./index.html') || caches.match('./'))
      )
  )
})
