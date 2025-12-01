// src/screens/LinksScreen.jsx
import React, { useState } from "react";

function LinksScreen({ contacts = [], links = [], onCreateLink, onBack }) {
  const [personId, setPersonId] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!personId) return;
    onCreateLink({
      person_id: personId,
      intensity,
      note,
      created_at: new Date().toISOString(),
    });
    setNote("");
  };

  return (
    <div className="synera-screen">

      {/* TARJETA CENTRADA — MISMO DISEÑO QUE CONTACTOS */}
      <div className="synera-card">

        {/* Volver */}
        <button
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            marginBottom: 12,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.02)",
            color: "#f5f0ff",
            fontSize: "0.8rem",
          }}
        >
          Volver
        </button>

        {/* Título */}
        <h2 className="synera-title" style={{ marginBottom: 6 }}>
          Vínculos
        </h2>
        <p className="synera-subtitle" style={{ marginBottom: 18 }}>
          Aquí ves los lazos emocionales más importantes: personas, intensidad del vínculo
          y notas significativas.
        </p>

        {/* Crear nuevo vínculo */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            padding: 16,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <p
            style={{
              marginBottom: 10,
              color: "#d7c8ff",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            Crear nuevo vínculo
          </p>

          {/* Selección de contacto */}
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            <option value="">Persona (desde tus contactos)</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.alias} ({c.email})
              </option>
            ))}
          </select>

          {/* Intensidad */}
          <label style={{ fontSize: "0.85rem", color: "#cbbaff" }}>
            Nivel del vínculo: {intensity} / 10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <p style={{ fontSize: "0.75rem", marginBottom: 10, color: "#bda9ff" }}>
            {intensity <= 3
              ? "Suave"
              : intensity <= 7
              ? "Profundo"
              : "Muy intenso"}
          </p>

          {/* Nota */}
          <input
            placeholder="Nota (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
            }}
          />

          {/* Botón */}
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 999,
              background: "rgba(164,92,255,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Guardar vínculo
          </button>
        </div>

        {/* LISTA DE VÍNCULOS */}
        <h3 className="synera-subtitle" style={{ marginBottom: 10 }}>
          Mapa de vínculos
        </h3>

        {links.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "#b8a8e6" }}>
            Aún no has creado vínculos. Empieza con las personas que más significan para ti.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l, i) => {
              const person = contacts.find((c) => c.id === l.person_id);
              return (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <strong style={{ color: "#fff" }}>{person?.alias}</strong>
                  <span style={{ color: "#d5c7ff", fontSize: "0.85rem" }}>
                    Nivel: {l.intensity} / 10
                  </span>
                  {l.note && (
                    <span style={{ color: "#c1b3f8", fontSize: "0.8rem" }}>
                      Nota: {l.note}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LinksScreen;