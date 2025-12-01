// src/screens/LinksScreen.jsx
import React, { useState } from "react";

/**
 * Pantalla de VÍNCULOS
 * - Muestra una lista de vínculos emocionales
 * - Permite crear uno nuevo a partir de un contacto existente
 * - Permite ajustar el nivel del vínculo (1–10)
 */
function LinksScreen({ user, contacts, links, onAddLink, onUpdateLevel, onBack }) {
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || ""
  );
  const [bondLevel, setBondLevel] = useState(7);
  const [note, setNote] = useState("");

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || null;

  const handleCreateLink = () => {
    if (!user || !user.email) {
      alert("Primero debes completar tu usuario.");
      return;
    }
    if (!selectedContact) {
      alert("Selecciona un contacto para crear el vínculo.");
      return;
    }

    const payload = {
      linked_email: selectedContact.email,
      linked_alias: selectedContact.alias,
      bond_level: bondLevel,
      note: note.trim() || null,
      color: selectedContact.avatar_color || "#a855f7",
    };

    onAddLink(payload);
    setNote("");
  };

  const handleChangeLevel = (linkId, newLevel) => {
    if (newLevel < 1) newLevel = 1;
    if (newLevel > 10) newLevel = 10;
    onUpdateLevel(linkId, newLevel);
  };

  return (
    <div className="synera-panel">
      <button className="synera-back" onClick={onBack}>
        Volver
      </button>

      <h2>Vínculos</h2>
      <p className="synera-sub">
        Aquí ves los lazos emocionales más importantes para ti: personas,
        intensidad del vínculo y notas significativas.
      </p>

      {/* Crear nuevo vínculo */}
      <div className="synera-card">
        <h3>Crear nuevo vínculo</h3>

        <div className="synera-field">
          <label>Persona (desde tus contactos)</label>
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.alias} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div className="synera-field">
          <label>Nivel del vínculo: {bondLevel} / 10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={bondLevel}
            onChange={(e) => setBondLevel(parseInt(e.target.value, 10))}
          />
          <div className="synera-intensity-row">
            <span>Suave</span>
            <span>Profundo</span>
          </div>
        </div>

        <div className="synera-field">
          <label>Nota (opcional)</label>
          <textarea
            rows={2}
            placeholder="Por ejemplo: 'Mi refugio en días difíciles'."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button className="synera-main-btn" onClick={handleCreateLink}>
          Guardar vínculo
        </button>
      </div>

      {/* Lista de vínculos existentes */}
      <div className="synera-section">
        <h3>Mapa de vínculos</h3>
        {links.length === 0 && (
          <p className="synera-sub">
            Aún no has creado vínculos. Empieza con las personas que más
            significan para ti.
          </p>
        )}

        <div className="synera-list">
          {links.map((link) => (
            <div key={link.id} className="synera-link-item">
              <div className="synera-link-avatar">
                <div
                  className="synera-link-circle"
                  style={{ backgroundColor: link.color || "#a855f7" }}
                />
              </div>

              <div className="synera-link-main">
                <div className="synera-link-title">
                  <strong>{link.linked_alias}</strong>
                </div>
                <div className="synera-link-email">{link.linked_email}</div>
                {link.note && (
                  <div className="synera-link-note">
                    <em>{link.note}</em>
                  </div>
                )}
              </div>

              <div className="synera-link-level">
                <div className="synera-link-level-label">
                  Vínculo: {link.bond_level} / 10
                </div>
                <div className="synera-link-level-buttons">
                  <button
                    onClick={() =>
                      handleChangeLevel(link.id, link.bond_level - 1)
                    }
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      handleChangeLevel(link.id, link.bond_level + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LinksScreen;
