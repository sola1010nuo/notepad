//匯入資料確認頁面

import React from "react";
import type { Theme } from "../styles/theme";

type Props = {
  open: boolean;
  theme: Theme;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ImportConfirmModal({
  open,
  theme,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: "90vw",
          background: theme.card,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          確認匯入備份
        </div>

        <div
          style={{
            fontSize: 14,
            color: theme.muted,
            lineHeight: 1.6,
          }}
        >
          匯入會覆蓋目前所有筆記與設定，確定要繼續嗎？
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.text,
              cursor: "pointer",
            }}
          >
            取消
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            確定匯入
          </button>
        </div>
      </div>
    </div>
  );
}