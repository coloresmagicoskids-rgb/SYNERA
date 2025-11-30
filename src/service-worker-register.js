// src/service-worker-register.js

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registrado:", registration);
      })
      .catch((err) => {
        console.error("Error al registrar SW:", err);
      });
  });
}
