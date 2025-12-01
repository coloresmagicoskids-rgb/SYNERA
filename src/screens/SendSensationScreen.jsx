// src/screens/SendSensationScreen.jsx
import React, { useState } from "react";

function SendSensationScreen({ user, contacts, onBack, onSend }) {
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || null
  );
  const [intensity, setIntensity] = useState("media");
  const [label, setLabel] = useState("ánimo");

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || null;

  const handleSend = () => {
    if (!user || !user.email) {
      alert("Primero debes completar tu usuario.");
      return;
    }

    if (!selectedContact) {
      alert("Selecciona un contacto.");
      return;
    }

    const payload = {
      sender_email: user.email,
      sender_alias: user.alias,

      receiver_email: selectedContact.email,
      receiver_alias: selectedContact.alias,

      intensity,
      label,
      color: selectedContact.avatar_color || "#a855f7",
    };

    onSend(payload);
  };

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <button className="synera-back" onClick={onBack}>
          Volver
        </button>

        <h2>Enviar sensación</h2>

        {/* Campo: contacto */}
        <div className="synera-field">
          <label>Para</label>
          <select
            value={selectedContactId || ""}
            onChange={(e) => setSelectedContactId(e.target.value)}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.alias} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {/* Campo: tipo */}
        <div className="synera-field">
          <label>Tipo de sensación</label>
          <select value={label} onChange={(e) => setLabel(e.target.value)}>
            <option value="ánimo">Ánimo</option>
            <option value="gratitud">Gratitud</option>
            <option value="calma">Calma</option>
            <option value="amor">Amor</option>
          </select>
        </div>

        {/* Intensidad */}
        <div className="synera-field">
          <label>Intensidad</label>
          <div className="synera-intensity-row">
            <button
              className={intensity === "suave" ? "active" : ""}
              onClick={() => setIntensity("suave")}
            >
              Suave
            </button>
            <button
              className={intensity === "media" ? "active" : ""}
              onClick={() => setIntensity("media")}
            >
              Media
            </button>
            <button
              className={intensity === "alta" ? "active" : ""}
              onClick={() => setIntensity("alta")}
            >
              Alta
            </button>
          </div>
        </div>

        <button className="synera-main-btn" onClick={handleSend}>
          Enviar sensación
        </button>
      </div>
    </div>
  );
}

export default SendSensationScreen;