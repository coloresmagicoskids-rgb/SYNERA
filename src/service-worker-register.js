// src/service-worker-register.js

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("[PWA] SW registrado:", registration);

        // 🔁 Detectar cuando hay una nueva versión del SW
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("[PWA] Nueva versión de SW encontrada...");

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            console.log("[PWA] SW state:", newWorker.state);

            // Cuando la nueva versión está instalada y ya hay uno viejo activo
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[PWA] Nueva versión lista, enviando SKIP_WAITING");
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // 🌀 Cuando el controlador cambia → recargamos UNA vez la app
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          console.log("[PWA] Controlador SW cambiado, recargando SYNERA...");
          window.location.reload();
        });
      })
      .catch((error) => {
        console.log("[PWA] Error registrando SW:", error);
      });
  });
}