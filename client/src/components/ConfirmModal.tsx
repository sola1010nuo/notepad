import React, { useEffect, useRef } from "react";
import type { Theme } from "../styles/theme";

type Props = {
  open: boolean;
  theme: Theme;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ open, theme, message, onCancel, onConfirm }: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      tabIndex={-1}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 16,
          color: theme.text,
        }}
      >
        <div style={{ marginBottom: 12 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{
              padding: "8px 12px",
              background: theme.btnBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}