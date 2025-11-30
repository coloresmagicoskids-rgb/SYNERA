// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/reset.css";
import "./styles/theme.css";

// ⬇️ IMPORTANTE: registrar el service worker
import "./service-worker-register";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);