import React from "react";
import type { Theme } from "../styles/theme";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export default function NotesList(props: {
  notes: Note[];
  theme: Theme;
  dark: boolean;
  onDelete: (id: string) => void;
}) {
  const { notes, theme, dark, onDelete } = props;

  if (notes.length === 0) {
    return <div style={{ color: theme.muted }}>目前沒有筆記（或 API 還沒通）</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {notes.map((n) => (
        <div
          key={n.id}
          style={{
            border: `1px solid ${theme.border}`,
            background: theme.card,
            borderRadius: 10,
            padding: 12,
            position: "relative",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(n.id);
            }}
            title="刪除"
            aria-label="delete note"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
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

          <div style={{ fontWeight: 700, paddingRight: 34 }}>{n.title}</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8, paddingBottom: 18 }}>{n.content}</div>

          <div
            style={{
              position: "absolute",
              right: 10,
              bottom: 8,
              fontSize: 12,
              color: theme.muted,
            }}
          >
            更新：{new Date(n.updatedAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}