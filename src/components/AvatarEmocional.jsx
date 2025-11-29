import React from "react";

function AvatarEmocional({ color = "#a45cff", intensity = 2 }) {
  const scale = intensity === 1 ? 1 : intensity === 2 ? 1.06 : 1.12;
  const shadow = intensity === 1 ? "0 0 18px" : intensity === 2 ? "0 0 26px" : "0 0 36px";

  const style = {
    width: 130,
    height: 130,
    borderRadius: "50%",
    background: `radial-gradient(circle at 30% 0, #ffffff, ${color})`,
    boxShadow: `${shadow} ${color}cc`,
    transform: `scale(${scale})`,
    transition: "transform 220ms ease-out, box-shadow 220ms ease-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const coreStyle = {
    width: "55%",
    height: "55%",
    borderRadius: "50%",
    background: "rgba(5, 0, 12, 0.8)",
    boxShadow: "0 0 18px rgba(0, 0, 0, 0.75) inset",
  };

  return (
    <div style={style}>
      <div style={coreStyle} />
    </div>
  );
}

export default AvatarEmocional;
