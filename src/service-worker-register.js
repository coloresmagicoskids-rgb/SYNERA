// src/service-worker-register.js

// Registro avanzado del Service Worker para SYNERA

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = "/service-worker.js";

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("[SW-Register] Service worker registrado:", registration.scope);

        // ▶️ Detectar nuevas versiones
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("[SW-Register] Nueva versión de SW encontrada…");

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            console.log("[SW-Register] Estado del nuevo SW:", newWorker.state);

            // Cuando la nueva versión está lista:
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // Ya había uno: hay una actualización
                console.log("[SW-Register] Nueva versión instalada. Activando…");

                // Pedimos al SW que haga skipWaiting
                newWorker.postMessage({ type: "SKIP_WAITING" });
              } else {
                // Primera instalación
                console.log("[SW-Register] Service worker instalado por primera vez.");
              }
            }
          });
        });

        // 🔄 Cuando el controlador cambia → recargamos para usar la nueva versión
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[SW-Register] Controlador SW cambiado. Recargando página…");
          // Evitar loops locos
          if (!window.__syneraReloader__) {
            window.__syneraReloader__ = true;
            window.location.reload();
          }
        });
      })
      .catch((err) => {
        console.error("[SW-Register] Error registrando service worker:", err);
      });
  });
}
