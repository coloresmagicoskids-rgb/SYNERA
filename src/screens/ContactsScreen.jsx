// src/screens/ContactsScreen.jsx
import React, { useState } from "react";

function ContactsScreen({ user, contacts, onAddContact, onBack }) {
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#22c55e");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alias || !email) return;

    onAddContact &&
      onAddContact({
        alias,
        email,
        avatar_color: color,
      });

    setAlias("");
    setEmail("");
  };

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="synera-title">Contactos</h2>
            <p className="synera-subtitle">
              Personas con las que SYNERA podrá intercambiar sensaciones.
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

        <div style={{ marginBottom: 18 }}>
          <p className="synera-subtitle" style={{ marginBottom: 8 }}>
            Agregar nuevo contacto (modo local por ahora)
          </p>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}
          >
            <input
              className="synera-input"
              placeholder="Alias del contacto"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <input
              className="synera-input"
              placeholder="Correo del contacto"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "#b3a7d9" }}>Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 32,
                  height: 24,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  padding: 0,
                }}
              />
            </div>

            <button className="synera-button-primary" type="submit" style={{ marginTop: 8 }}>
              Guardar contacto
            </button>
          </form>
        </div>

        <div>
          <p className="synera-subtitle" style={{ marginBottom: 6 }}>
            Lista de contactos
          </p>
          {contacts.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#b3a7d9" }}>
              Aún no tienes contactos. Empieza agregando uno arriba.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {contacts.map((c) => (
                <div
                  key={c.id}
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
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 30% 0, #ffffff, ${c.avatar_color || "#a45cff"})`,
                      boxShadow: `0 0 14px ${(c.avatar_color || "#a45cff")}88`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{c.alias}</div>
                    <div style={{ fontSize: "0.78rem", color: "#b3a7d9" }}>{c.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactsScreen;
