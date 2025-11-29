import React, { useState } from "react";
import AvatarEmocional from "../components/AvatarEmocional.jsx";

const PRESETS = [
  { label: "Calma profunda", color: "#4f46e5" },
  { label: "Energía creativa", color: "#a855f7" },
  { label: "Calor cercano", color: "#fb923c" },
  { label: "Foco suave", color: "#22c55e" },
];

function SetupAvatarScreen({ user, onDone }) {
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || "#a45cff");

  const handleContinue = () => {
    if (!onDone) return;
    onDone({
      ...user,
      avatar_color: selectedColor,
    });
  };

  return (
    <div className="synera-screen">
      <div className="synera-card">
        <h2 className="synera-title">Elige tu energía inicial</h2>
        <p className="synera-subtitle">
          Este núcleo emocional será la forma en que SYNERA te verá en el mundo.
        </p>

        <div style={{ marginBottom: 18 }}>
          <AvatarEmocional color={selectedColor} intensity={2} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => setSelectedColor(preset.color)}
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                border: selectedColor === preset.color ? "1px solid #ffffff" : "1px solid transparent",
                background: "rgba(255,255,255,0.04)",
                fontSize: "0.8rem",
                color: "#f5f0ff",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: preset.color,
                }}
              />
              {preset.label}
            </button>
          ))}
        </div>

        <button className="synera-button-primary" type="button" onClick={handleContinue}>
          Entrar a SYNERA
        </button>
      </div>
    </div>
  );
}

export default SetupAvatarScreen;
