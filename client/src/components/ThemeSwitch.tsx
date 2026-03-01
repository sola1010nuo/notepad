import React from "react";
import type { Theme } from "../styles/theme";

export default function ThemeSwitch(props: {
  dark: boolean;
  theme?: Theme; // ✅ 加保險
  onToggle: () => void;
}) {
  const { dark, theme, onToggle } = props;

  const border = theme?.border ?? "#999";
  const btnBg = theme?.btnBg ?? "#eee";

  return (
    <button
      onClick={onToggle}
      aria-label="toggle theme"
      style={{
        width: 52,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: dark ? "#22c55e" : btnBg,
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: dark ? 26 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.18s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}