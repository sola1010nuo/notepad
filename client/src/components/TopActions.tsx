//＋新增 / 重新整理
import React from "react";
import type { Theme } from "../styles/theme";

export default function TopActions(props: {
  theme: Theme;
  loading: boolean;
  onAdd: () => void;
  onRefresh: () => void;
}) {
  const { theme, loading, onAdd, onRefresh } = props;

  const btnStyle: React.CSSProperties = {
    padding: "8px 12px",
    background: theme.btnBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
      <button onClick={onAdd} disabled={loading} style={btnStyle}>
        ＋ 新增
      </button>

      <button onClick={onRefresh} disabled={loading} style={btnStyle}>
        重新整理
      </button>
    </div>
  );
}