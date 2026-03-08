import React, { useEffect, useMemo, useState } from "react";
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

  //  用 state 顯示錯誤
  const [timeError, setTimeError] = useState<string>("");

  function toLocalDateTime(dateStr: string, timeStr: string): Date | null {
    if (!dateStr) return null;
    const t = timeStr && timeStr.trim() ? timeStr : "00:00";
    const dt = new Date(`${dateStr}T${t}:00`);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  const invalidTime = useMemo(() => {
    const s = toLocalDateTime(props.startDate, props.startTime);
    const e = toLocalDateTime(props.endDate, props.endTime);
    if (!s || !e) return false;
    return s.getTime() > e.getTime();
  }, [props.startDate, props.startTime, props.endDate, props.endTime]);

  // 使用者只要修改時間，就把錯誤清掉
  useEffect(() => {
    if (timeError) setTimeError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.startDate, props.startTime, props.endDate, props.endTime]);

  const safeClose = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setTimeout(() => props.onClose(), 0);
  };

  // ESC 關閉
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        safeClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(720px, 100%)",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>新增筆記</h3>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              safeClose();
            }}
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

          {/* 時間區 */}
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

          {/*  錯誤訊息 */}
          {!!timeError && (
            <div
              style={{
                marginTop: 2,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: "rgba(239, 68, 68, 0.12)",
                color: theme.text,
                fontSize: 13,
              }}
            >
              {timeError}
            </div>
          )}

          {/* Tag + Remind ...（你原本的保持不變） */}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                safeClose();
              }}
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
              onClick={() => {
                if (invalidTime) {
                  setTimeError("開始時間不能比結束時間晚");
                  return;
                }
                props.onSave();
              }}
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