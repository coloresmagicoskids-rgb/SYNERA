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
    if (!user || (!user.phone && !user.email)) {
      alert("Primero debes completar tu usuario (teléfono o correo).");
      return;
    }

    if (!selectedContact) {
      alert("Selecciona un contacto.");
      return;
    }

    if (!selectedContact.phone && !selectedContact.email) {
      alert("Este contacto no tiene número ni correo configurado.");
      return;
    }

    const payload = {
      // QUIÉN ENVÍA
      sender_email: user.email || null,
      sender_phone: user.phone || null,
      sender_alias: user.alias,

      // QUIÉN RECIBE
      receiver_email: selectedContact.email || null,
      receiver_phone: selectedContact.phone || null,
      receiver_alias: selectedContact.alias,

      // CONTENIDO EMOCIONAL
      intensity,
      label,
      color: selectedContact.avatar_color || "#a855f7",
    };

    onSend(payload);
  };

  return (
    <div className="synera-panel">
      <button className="synera-back" onClick={onBack}>
        Volver
      </button>

      <h2>Enviar sensación</h2>

      <div className="synera-field">
        <label>Para</label>
        <select
          value={selectedContactId || ""}
          onChange={(e) => setSelectedContactId(e.target.value)}
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.alias}{" "}
              {c.phone ? `(${c.phone})` : c.email ? `(${c.email})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="synera-field">
        <label>Tipo de sensación</label>
        <select value={label} onChange={(e) => setLabel(e.target.value)}>
          <option value="ánimo">Ánimo</option>
          <option value="gratitud">Gratitud</option>
          <option value="calma">Calma</option>
          <option value="amor">Amor</option>
        </select>
      </div>

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
  );
}

export default SendSensationScreen;
