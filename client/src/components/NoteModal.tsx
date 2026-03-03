import React from "react";
import type { Theme } from "../styles/theme";
import { getInputStyle } from "../styles/ui";

type Props = {
  open: boolean;
  theme: Theme;
  loading: boolean;

  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;

  startDate: string;
  setStartDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;

  endDate: string;
  setEndDate: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;

  tag: string;
  setTag: (v: string) => void;
  remind: boolean;
  setRemind: (v: boolean) => void;

  onClose: () => void;
  onSave: () => void;
};

export default function NoteModal(props: Props) {
  const { open, theme, loading } = props;
  const inputStyle = getInputStyle(theme);

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
            props.onClose();
          }
        }}
        style={{
          width: "min(720px, 100%)",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>新增筆記</h3>
          <button
            onClick={props.onClose}
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

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            value={props.title}
            onChange={(e) => props.setTitle(e.target.value)}
            placeholder="標題"
            style={inputStyle}
          />

          <textarea
            value={props.content}
            onChange={(e) => props.setContent(e.target.value)}
            placeholder="內容"
            rows={4}
            style={inputStyle}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>開始時間</div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
                <input
                  className="hide-native-hint"
                  type="date"
                  value={props.startDate}
                  onChange={(e) => props.setStartDate(e.target.value)}
                  style={inputStyle}
                />
                <input
                  className="hide-native-hint"
                  type="time"
                  value={props.startTime}
                  onChange={(e) => props.setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>結束時間</div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
                <input
                  className="hide-native-hint"
                  type="date"
                  value={props.endDate}
                  onChange={(e) => props.setEndDate(e.target.value)}
                  style={inputStyle}
                />
                <input
                  className="hide-native-hint"
                  type="time"
                  value={props.endTime}
                  onChange={(e) => props.setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Tag and Remind Switch */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>標籤</div>
              <input
                value={props.tag}
                onChange={(e) => props.setTag(e.target.value)}
                placeholder="例: 工作、學習、生活"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>提醒</div>
              <button
                onClick={() => props.setRemind(!props.remind)}
                aria-label="toggle remind"
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 999,
                  border: `1px solid ${theme.border}`,
                  background: props.remind ? "#f59e0b" : "transparent",
                  position: "relative",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: props.remind ? 26 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.18s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button
              onClick={props.onClose}
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
              onClick={props.onSave}
              disabled={loading}
              style={{
                padding: "8px 12px",
                background: theme.btnBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {loading ? "儲存中..." : "儲存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}