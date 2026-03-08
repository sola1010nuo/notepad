import React from "react";
import type { Theme } from "../styles/theme";

type Props = {
  open: boolean;
  theme: Theme;
  dark: boolean;
  setDark: (dark: boolean) => void;
  onClose: () => void;
};

export default function SettingsModal(props: Props) {
  const { open, theme, dark, setDark, onClose } = props;

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
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onKeyDown={(e) => {
          // ESC 鍵關閉
          if (e.key === "Escape") {
            onClose();
          }
        }}
        style={{
          width: "min(500px, 100%)",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>設定</h3>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.text,
              borderRadius: 999,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {/* 主題切換 */}
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>主題：</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDark(false)}
                style={{
                  padding: "8px 12px",
                  background: !dark ? theme.btnBg : "transparent",
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  opacity: !dark ? 1 : 0.6,
                }}
              >
                🔆 日間
              </button>
              <button
                onClick={() => setDark(true)}
                style={{
                  padding: "8px 12px",
                  background: dark ? theme.btnBg : "transparent",
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  opacity: dark ? 1 : 0.6,
                }}
              >
                🌙 夜間
              </button>
            </div>
          </div>

          {/* 其他設定項目可以加在這裡 */}
          <div>
            <p style={{ color: theme.muted }}>更多設定功能即將到來...</p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}