import React from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt?: string; // 你如果有顯示更新時間就保留
};

interface NoteListProps {
  notes: Note[];
  deleteNote: (id: string) => Promise<void>; // 
}

const NoteList: React.FC<NoteListProps> = ({ notes, deleteNote }) => {
  return (
    <div>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            position: "relative",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          {/* ✅ 右上角叉叉 */}
          <button
            onClick={async (e) => {
              e.stopPropagation(); // ✅ 防止觸發卡片點擊事件
              const ok = window.confirm("確定要刪除這則筆記嗎？");
              if (!ok) return;
              await deleteNote(note.id);
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="delete note"
            title="刪除"
          >
            ✕
          </button>

          <div style={{ fontWeight: 600 }}>{note.title}</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{note.content}</div>

          {note.updatedAt && (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              更新：{note.updatedAt}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NoteList;