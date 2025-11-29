// src/screens/HomeScreen.jsx
import React, { useState } from "react";
import AvatarEmocional from "../components/AvatarEmocional.jsx";

function HomeScreen({ user, onOpenContacts, onOpenSend, onOpenInbox, lastSensation }) {
  const [intensity, setIntensity] = useState(2);

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="synera-title" style={{ marginTop: 8 }}>
              Hola, {user?.alias || "alma luminosa"}
            </h2>
            <p className="synera-subtitle">
              Este es tu núcleo emocional. Desde aquí SYNERA se conecta con otros.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              onClick={onOpenContacts}
              style={{
                alignSelf: "flex-end",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#f5f0ff",
                fontSize: "0.8rem",
              }}
            >
              Contactos
            </button>
            <button
              type="button"
              onClick={onOpenInbox}
              style={{
                alignSelf: "flex-end",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(164,92,255,0.18)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#f5f0ff",
                fontSize: "0.8rem",
              }}
            >
              Sensaciones
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <AvatarEmocional color={user?.avatar_color || "#a45cff"} intensity={intensity} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <p className="synera-subtitle" style={{ marginBottom: 6 }}>
            Intensidad actual
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 999,
                  background: intensity === lvl ? "rgba(164,92,255,0.35)" : "rgba(255,255,255,0.03)",
                  color: "#f5f0ff",
                  fontSize: "0.85rem",
                }}
              >
                {lvl === 1 ? "Suave" : lvl === 2 ? "Media" : "Alta"}
              </button>
            ))}
          </div>
        </div>

        <button
          className="synera-button-primary"
          type="button"
          onClick={onOpenSend}
          style={{ marginBottom: lastSensation ? 12 : 0 }}
        >
          Enviar sensación
        </button>

        {lastSensation && (
          <div
            style={{
              marginTop: 8,
              fontSize: "0.8rem",
              color: "#b3a7d9",
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Última sensación enviada a{" "}
            <strong>{lastSensation.receiver_alias || "contacto"}</strong> ·{" "}
            <span>{lastSensation.label || "sin etiqueta"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
