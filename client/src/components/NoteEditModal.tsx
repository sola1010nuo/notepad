import React, { useState, useEffect } from "react";
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

  // 当 note 改变时，更新表单
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || "");
    setContent(note.content || "");
    setTag(note.tag || "");
    setRemind(note.remind === 1);

    // 解析时间 - 正确处理本地时间
    if (note.startAt) {
      const dt = new Date(note.startAt);
      // 使用本地时间，不用 ISO 字符串
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const date = String(dt.getDate()).padStart(2, "0");
      const hour = String(dt.getHours()).padStart(2, "0");
      const minute = String(dt.getMinutes()).padStart(2, "0");
      setStartDate(`${year}-${month}-${date}`);
      setStartTime(`${hour}:${minute}`);
    } else {
      setStartDate("");
      setStartTime("");
    }

    if (note.endAt) {
      const dt = new Date(note.endAt);
      // 使用本地时间，不用 ISO 字符串
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const date = String(dt.getDate()).padStart(2, "0");
      const hour = String(dt.getHours()).padStart(2, "0");
      const minute = String(dt.getMinutes()).padStart(2, "0");
      setEndDate(`${year}-${month}-${date}`);
      setEndTime(`${hour}:${minute}`);
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

  const handleSave = async () => {
    if (!note) return;

    const startAt = combineToISO(startDate, startTime);
    const endAt = combineToISO(endDate, endTime);

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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          props.onClose();
        }
      }}
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
        onMouseDown={(e) => e.stopPropagation()}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>編輯筆記</h3>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="標題"
            style={inputStyle}
          />

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
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                開始時間
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
                <input
                  className="hide-native-hint"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
                <input
                  className="hide-native-hint"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                結束時間
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
                <input
                  className="hide-native-hint"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
                <input
                  className="hide-native-hint"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Tag 和 Remind */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                標籤
              </div>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="例: 工作、學習、生活"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>
                提醒
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: theme.inputBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={remind}
                  onChange={(e) => setRemind(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span>{remind ? "已啟用提醒" : "未啟用提醒"}</span>
              </label>
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}
          >
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
