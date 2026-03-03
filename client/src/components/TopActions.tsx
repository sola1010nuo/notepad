import React from "react";
import type { Theme } from "../styles/theme";

export default function TopActions(props: {
  theme: Theme;
  loading: boolean;
  onAdd: () => void;
  deleteMode?: boolean;
  onToggleDelete?: () => void;
  onConfirmDelete?: () => void;
}) {
  const { theme, loading, onAdd, deleteMode, onToggleDelete, onConfirmDelete } = props;

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
      {typeof deleteMode !== "undefined" && onToggleDelete && (
        <button
          onClick={onToggleDelete}
          disabled={loading}
          style={btnStyle}
        >
          {deleteMode ? "取消" : "🗑️ 刪除"}
        </button>
      )}
      {deleteMode && onConfirmDelete && (
        <button
          onClick={onConfirmDelete}
          disabled={loading}
          style={btnStyle}
        >
          確認刪除
        </button>
      )}
    </div>
  );
}
