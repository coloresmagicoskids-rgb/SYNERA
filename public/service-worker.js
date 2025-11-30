// public/service-worker.js

// 🧠 Versión de caché: súbela cuando hagas cambios importantes
const CACHE_VERSION = "v3";
const STATIC_CACHE = `synera-static-${CACHE_VERSION}`;

// 🧱 Archivos básicos que queremos tener siempre listos offline
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/synera-192.png",
  "/icons/synera-512.png"
];

// 🔹 Instalación: precache de los assets básicos
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando service worker…");

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );

  // Pasa inmediatamente al estado "activate"
  self.skipWaiting();
});

// 🔹 Activación: limpiar cachés viejas
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando service worker…");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("synera-static-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );

  // Toma control de todas las pestañas abiertas
  self.clients.claim();
});

// 🛰️ Estrategia de red: 
//   - Navegación (HTML): network-first con fallback offline
//   - Static assets (JS/CSS/imagenes): stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Sólo GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegación (HTML)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guarda la última versión de index.html
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put("/", copy);
          });
          return response;
        })
        .catch(() => {
          // Sin red → devolvemos lo que tengamos en caché
          return caches.match("/") || caches.match("/index.html");
        })
    );
    return;
  }

  // 2) Static assets: JS, CSS, imágenes, etc. → stale-while-revalidate
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((response) => {
            // Guardamos la versión más nueva
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cachedResponse); // si falla red, usamos cache

        // Si ya hay algo en caché, lo devolvemos rápido
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 3) Otros GET: intentamos red, si falla usamos caché
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 💌 Canal para mensajes desde la app (por ejemplo, para SKIP_WAITING)
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    console.log("[SW] SKIP_WAITING recibido, activando nueva versión…");
    self.skipWaiting();
  }
});
