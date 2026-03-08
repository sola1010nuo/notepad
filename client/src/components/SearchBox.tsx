import React from "react";
import type { Theme } from "../styles/theme";
import { getInputStyle } from "../styles/ui";

type Props = {
  theme: Theme;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBox({ theme, value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜尋標題或內容"
        style={getInputStyle(theme)}
      />
    </div>
  );
}