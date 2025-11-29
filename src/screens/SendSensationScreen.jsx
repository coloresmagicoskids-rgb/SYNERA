// src/screens/SendSensationScreen.jsx
import React, { useMemo, useState } from "react";

const INTENSITY_OPTIONS = [
  { value: 1, label: "Suave" },
  { value: 2, label: "Media" },
  { value: 3, label: "Alta" },
];

function SendSensationScreen({ user, contacts, onBack, onSend }) {
  const [contactId, setContactId] = useState(contacts[0]?.id || "");
  const [color, setColor] = useState(user?.avatar_color || "#a45cff");
  const [intensity, setIntensity] = useState(2);
  const [label, setLabel] = useState("ánimo");

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === contactId) || null,
    [contacts, contactId]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedContact || !color) return;

    onSend &&
      onSend({
        sender_id: user?.id || "local-user",
        sender_alias: user?.alias || "Tú",
        receiver_id: selectedContact.id,
        receiver_alias: selectedContact.alias,
        receiver_email: selectedContact.email,
        color,
        intensity,
        label: label.trim() || null,
      });
  };

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="synera-title">Enviar sensación</h2>
            <p className="synera-subtitle">
              Elige a quién se la envías y cómo se siente esta energía.
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

        {contacts.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#b3a7d9" }}>
            Aún no tienes contactos. Agrega algunos primero desde la sección “Contactos”.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {/* Contacto */}
            <div>
              <p className="synera-subtitle" style={{ marginBottom: 4 }}>
                Destinatario
              </p>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="synera-input"
                style={{ paddingRight: 32 }}
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.alias} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <p className="synera-subtitle" style={{ marginBottom: 4 }}>
                Color de la sensación
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 26,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    padding: 0,
                  }}
                />
                <span style={{ fontSize: "0.85rem", color: "#b3a7d9" }}>{color}</span>
              </div>
            </div>

            {/* Intensidad */}
            <div>
              <p className="synera-subtitle" style={{ marginBottom: 4 }}>
                Intensidad
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntensity(opt.value)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 999,
                      background:
                        intensity === opt.value
                          ? "rgba(164,92,255,0.35)"
                          : "rgba(255,255,255,0.03)",
                      color: "#f5f0ff",
                      fontSize: "0.85rem",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Etiqueta */}
            <div>
              <p className="synera-subtitle" style={{ marginBottom: 4 }}>
                Palabra que describe la sensación (opcional)
              </p>
              <input
                className="synera-input"
                placeholder="Ej: calma, ánimo, foco, abrazo silencioso…"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <button className="synera-button-primary" type="submit" style={{ marginTop: 6 }}>
              Enviar sensación
            </button>
          </form>
        )}

        {selectedContact && (
          <p style={{ marginTop: 10, fontSize: "0.8rem", color: "#b3a7d9" }}>
            Esta sensación viajará desde <strong>{user?.alias || "tú"}</strong> hacia{" "}
            <strong>{selectedContact.alias}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

export default SendSensationScreen;
