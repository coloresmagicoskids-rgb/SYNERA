// src/screens/InboxScreen.jsx
import React from "react";

function InboxScreen({ user, sensations, onBack }) {
  const hasSensations = sensations && sensations.length > 0;

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="synera-title">Sensaciones</h2>
            <p className="synera-subtitle">
              Un pequeño universo de energías que has generado. Más adelante verás aquí
              también las que lleguen desde otros dispositivos y personas.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            style={{
              alignSelf: "flex-start",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#f5f0ff",
              fontSize: "0.8rem",
            }}
          >
            Volver
          </button>
        </div>

        {/* Universo pulsante */}
        <div
          style={{
            borderRadius: 18,
            padding: 12,
            marginBottom: 14,
            background:
              "radial-gradient(circle at top, rgba(164,92,255,0.26), rgba(5,0,15,0.9))",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: 140,
          }}
        >
          {hasSensations ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {sensations.map((s) => {
                const size = s.intensity === 1 ? 32 : s.intensity === 2 ? 42 : 52;
                return (
                  <div
                    key={s.id}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 30% 0, #ffffff, ${
                        s.color || "#a45cff"
                      })`,
                      boxShadow: `0 0 22px ${(s.color || "#a45cff")}aa`,
                      opacity: 0.9,
                    }}
                    title={`${s.label || "sensación"} → ${s.receiver_alias || ""}`}
                  />
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#b3a7d9", textAlign: "center" }}>
              Aún no hay sensaciones en este universo. Envía algunas y aparecerán aquí como
              órbitas de energía.
            </p>
          )}
        </div>

        {/* Lista detallada */}
        {hasSensations && (
          <div
            style={{
              maxHeight: 210,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {sensations.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 0, #ffffff, ${
                      s.color || "#a45cff"
                    })`,
                    boxShadow: `0 0 14px ${(s.color || "#a45cff")}88`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem" }}>
                    <strong>{s.label || "Sensación sin nombre"}</strong>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#b3a7d9" }}>
                    De <strong>{s.sender_alias || "Tú"}</strong> hacia{" "}
                    <strong>{s.receiver_alias || "contacto"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxScreen;
