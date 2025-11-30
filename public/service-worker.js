// public/service-worker.js

// Instalar el Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando nueva versión...");
  self.skipWaiting(); // 👉 pasa directo a 'activate'
});

// Activar el Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado. Tomando control de las pestañas...");
  // 👉 hace que la nueva versión controle todas las pestañas abiertas
  event.waitUntil(clients.claim());
});

// Manejo básico de fetch: cache simple para tener modo offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("synera-cache-v1").then(async (cache) => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        // Si no hay red, intentamos devolver lo que haya en caché
        const cached = await cache.match(event.request);
        return cached || Response.error();
      }
    })
  );
});

// Permitir que la app le diga al SW que haga skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Recibido SKIP_WAITING desde la app");
    self.skipWaiting();
  }
});