// src/service-worker-register.js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("[SW] Registrado:", registration.scope);

        // Cuando haya una nueva versión:
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.onstatechange = () => {
            if (newWorker.state === "installed") {
              // Si ya había SW, hay una nueva versión lista
              if (navigator.serviceWorker.controller) {
                console.log("[SW] Nueva versión disponible, activando…");
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            }
          };
        };
      })
      .catch((err) => {
        console.error("[SW] Error registrando service worker:", err);
      });
  });
}