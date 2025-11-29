import React, { useEffect } from "react";

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onFinish && onFinish();
    }, 1800);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="synera-screen">
      <div style={{ textAlign: "center" }}>
        <div className="synera-avatar-circle" />
        <h1 className="synera-title" style={{ marginTop: 12 }}>SYNERA</h1>
        <p className="synera-subtitle">Comunicación viva. Siente la conversación.</p>
      </div>
    </div>
  );
}

export default SplashScreen;
