import React, { useState } from "react";

function AuthScreen({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");

  const handleContinue = (e) => {
    e.preventDefault();
    if (!email || !alias) return;
    onAuthSuccess &&
      onAuthSuccess({
        id: "temp-user-id",
        email,
        alias,
        avatar_color: "#a45cff",
      });
  };

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <h2 className="synera-title">Bienvenido a SYNERA</h2>
        <p className="synera-subtitle">
          Crea tu punto de luz en este nuevo lenguaje de comunicación.
        </p>
        <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            className="synera-input"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="synera-input"
            placeholder="Alias o nombre a mostrar"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <button className="synera-button-primary" type="submit" style={{ marginTop: 14 }}>
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthScreen;
