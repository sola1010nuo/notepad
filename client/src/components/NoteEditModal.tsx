import React, { useState, useEffect, useMemo } from "react";
import type { Theme } from "../styles/theme";
import { getInputStyle } from "../styles/ui";
import type { Note } from "../hooks/useNotes";

type Props = {
  open: boolean;
  theme: Theme;
  loading: boolean;
  note: Note | null;

  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
};

export default function NoteEditModal(props: Props) {
  const { open, theme, loading, note } = props;
  const inputStyle = getInputStyle(theme);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [remind, setRemind] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // ✅ inline 錯誤（避免 alert 造成卡輸入）
  const [timeError, setTimeError] = useState("");

  const safeClose = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setTimeout(() => {
      props.onClose();
    }, 0);
  };

  // ✅ ESC anywhere (open 時有效)
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

  // note 改變時，更新表單
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || "");
    setContent(note.content || "");
    setTag(note.tag || "");
    setRemind(note.remind === 1);

    // 清掉舊錯誤
    setTimeError("");

    if (note.startAt) {
      const dt = new Date(note.startAt);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const date = String(dt.getDate()).padStart(2, "0");
      const hour = dt.getHours();
      const minute = dt.getMinutes();
      setStartDate(`${year}-${month}-${date}`);
      if (hour === 12 && minute === 0) setStartTime("");
      else setStartTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    } else {
      setStartDate("");
      setStartTime("");
    }

    if (note.endAt) {
      const dt = new Date(note.endAt);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const date = String(dt.getDate()).padStart(2, "0");
      const hour = dt.getHours();
      const minute = dt.getMinutes();
      setEndDate(`${year}-${month}-${date}`);
      if (hour === 12 && minute === 0) setEndTime("");
      else setEndTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    } else {
      setEndDate("");
      setEndTime("");
    }
  }, [note, open]);

  const combineToISO = (dateStr: string, timeStr: string): string | null => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
      const dt = new Date(year, month - 1, day, hours, minutes);
      return dt.toISOString();
    } catch {
      return null;
    }
  };

  // ✅ 同新增：只要兩邊都有日期就比，時間沒填當 00:00
  const invalidTime = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(`${startDate}T${startTime?.trim() ? startTime : "00:00"}:00`);
    const e = new Date(`${endDate}T${endTime?.trim() ? endTime : "00:00"}:00`);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
    return s.getTime() > e.getTime();
  }, [startDate, startTime, endDate, endTime]);

  // ✅ 使用者改時間就清掉錯誤
  useEffect(() => {
    if (timeError) setTimeError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, startTime, endDate, endTime]);

  const handleSave = async () => {
    if (!note) return;

    // ✅ 防呆：不 alert，顯示 inline error
    if (invalidTime) {
      setTimeError("開始時間不能比結束時間晚");
      return;
    }

    const startAt = combineToISO(startDate, startTime || "");
    const endAt = combineToISO(endDate, endTime || "");

    const payload = {
      title: title.trim() || "(無標題)",
      content: content.trim(),
      startAt,
      endAt,
      tag: tag.trim() || null,
      remind: remind ? 1 : 0,
    };

    await props.onSave(note.id, payload);
  };

  if (!open || !note) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
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
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>編輯筆記</h3>
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="標題" style={inputStyle} />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="內容"
            rows={6}
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
                <input className="hide-native-hint" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                <input className="hide-native-hint" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>結束時間</div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
                <input className="hide-native-hint" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                <input className="hide-native-hint" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* ✅ inline 錯誤訊息 */}
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

          {/* Tag 和 Remind Switch */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>標籤</div>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="例: 工作、學習、生活" style={inputStyle} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>提醒</div>
              <button
                onClick={() => setRemind(!remind)}
                aria-label="toggle remind"
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 999,
                  border: `1px solid ${theme.border}`,
                  background: remind ? "#f59e0b" : "transparent",
                  position: "relative",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: remind ? 26 : 3,
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
              onClick={handleSave}
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