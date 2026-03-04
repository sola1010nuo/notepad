import React from "react";
import type { Theme } from "../styles/theme";
import type { Note } from "../hooks/useNotes";

type NoteListProps = {
  notes: Note[];
  theme: Theme;
  dark: boolean;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onRemindToggle?: (id: string, newRemind: number) => void;
  // bulk-delete mode
  deleteMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string, checked: boolean) => void;
};

// 安全格式化日期
const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "";
  try {
    const dt = new Date(dateStr);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function NotesList(props: NoteListProps) {
  const { notes, theme, dark, onDelete, onEdit, onRemindToggle, deleteMode, selectedIds, onSelect } = props;

  if (notes.length === 0) {
    return <div style={{ color: theme.muted }}>目前沒有筆記</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {notes.map((n) => (
        <div
          key={n.id}
          onClick={() => {
            if (deleteMode) {
              // 删除模式
              onSelect?.(n.id, !selectedIds?.has(n.id));
            } else {
              // 編輯模式
              onEdit(n);
            }
          }}
          style={{
            border: `1px solid ${theme.border}`,
            background: theme.card,
            borderRadius: 10,
            padding: 12,
            position: "relative",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {!deleteMode && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* 提醒 switch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 14 }}></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemindToggle?.(n.id, n.remind === 1 ? 0 : 1);
                  }}
                  aria-label="toggle remind"
                  style={{
                    width: 40,
                    height: 20,
                    borderRadius: 999,
                    border: `1px solid ${theme.border}`,
                    background: n.remind === 1 ? "#f59e0b" : "transparent",
                    position: "relative",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: n.remind === 1 ? 20 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.18s ease",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>
              {/* 刪除按鈕 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                }}
                title="刪除"
                aria-label="delete note"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: dark ? "rgba(255,255,255,0.06)" : "transparent",
                  color: theme.text,
                  fontSize: 16,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "2px 7px",
                  borderRadius: 999,
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ fontWeight: 700, paddingRight: 34, marginBottom: 8 }}>
            {deleteMode && (
            <input
              type="checkbox"
              checked={selectedIds?.has(n.id) ?? false}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onSelect?.(n.id, e.target.checked)}
              style={{ marginRight: 8 }}
            />
          )}
          {n.title}
          </div>


          <div
            style={{
              whiteSpace: "pre-wrap",
              marginBottom: 12,
              color: theme.muted,
              fontSize: 14,
            }}
          >
            {n.content.length > 100 ? n.content.substring(0, 100) + "..." : n.content}
          </div>

          {/* 標籤、提醒、時間 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
              color: theme.muted,
              alignItems: "center",
            }}
          >
            {n.tag && (
              <span
                style={{
                  display: "inline-block",
                  background: theme.inputBg,
                  padding: "2px 8px",
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                }}
              >
                🏷️ {n.tag}
              </span>
            )}
            {/* 時間為 12:00 視為沒設定，直接略過 */}
            {n.startAt && (() => {
              const dt = new Date(n.startAt);
              const isPlaceholder = dt.getHours() === 12 && dt.getMinutes() === 0;
              const dateOnly = dt.toLocaleDateString("zh-TW", {
                month: "2-digit",
                day: "2-digit",
              });
              if (isPlaceholder) {
                return (
                  <span
                    style={{
                      display: "inline-block",
                      background: theme.inputBg,
                      padding: "2px 8px",
                      borderRadius: 12,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    📅 {dateOnly}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    display: "inline-block",
                    background: theme.inputBg,
                    padding: "2px 8px",
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  📅 {dt.toLocaleString("zh-TW", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              );
            })()}
            {n.endAt && (() => {
              const dt = new Date(n.endAt);
              const isPlaceholder = dt.getHours() === 12 && dt.getMinutes() === 0;
              const dateOnly = dt.toLocaleDateString("zh-TW", {
                month: "2-digit",
                day: "2-digit",
              });
              if (isPlaceholder) {
                return (
                  <span
                    style={{
                      display: "inline-block",
                      background: theme.inputBg,
                      padding: "2px 8px",
                      borderRadius: 12,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    ⏰ {dateOnly}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    display: "inline-block",
                    background: theme.inputBg,
                    padding: "2px 8px",
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  ⏰ {dt.toLocaleString("zh-TW", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}