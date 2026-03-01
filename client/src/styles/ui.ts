import type React from "react";
import type { Theme } from "./theme";

export function getInputStyle(theme: Theme): React.CSSProperties {
  return {
    width: "100%",
    padding: 10,
    background: theme.inputBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxSizing: "border-box",
    minWidth: 0,
  };
}