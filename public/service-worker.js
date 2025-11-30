// public/service-worker.js

self.addEventListener("install", () => {
  self.skipWaiting();
  console.log("Service Worker instalado.");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activado.");
});
