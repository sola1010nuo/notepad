import React from "react";
import ThemeSwitch from "./ThemeSwitch";
import type { Theme } from "../styles/theme";

type Props = {
  theme: Theme;
  dark: boolean;
  onToggleDark: () => void;
  onOpenSettings: () => void;
};

export default function AppHeader({
  theme,
  dark,
  onToggleDark,
  onOpenSettings,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 1200,
        margin: "0 auto",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>NotePad</h2>

        <button
          onClick={onOpenSettings}
          style={{
            border: `1px solid ${theme.border}`,
            background: "transparent",
            color: theme.text,
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: 16,
          }}
          title="設定"
        >
          ⚙️
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{dark ? "🌙" : "🔆"}</span>

        <ThemeSwitch
          dark={dark}
          theme={theme}
          onToggle={onToggleDark}
        />
      </div>
    </div>
  );
}