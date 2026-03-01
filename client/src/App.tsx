import React, { useEffect, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = ""; // 有 proxy 就留空，沒有就填 http://localhost:4000 之類

export default function App() {
  const [dark, setDark] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const theme = dark
    ? {
        bg: "#1f1f1f",
        panel: "#1f1f1f",
        card: "#2a2a2a",
        text: "#f5f5f5",
        muted: "#b3b3b3",
        border: "#3a3a3a",
        inputBg: "#2a2a2a",
        btnBg: "#333333",
      }
    : {
        bg: "#ffffff",
        panel: "#ffffff",
        card: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
        border: "#dddddd",
        inputBg: "#ffffff",
        btnBg: "#f3f4f6",
      };

  // 讓整個視窗背景跟著變，避免左右白邊
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  async function fetchNotes() {
    setErrMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/notes`);
      if (!res.ok) throw new Error(`GET /api/notes failed: ${res.status}`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : data.notes ?? []);
    } catch (e: any) {
      setErrMsg(e?.message ?? "讀取失敗");
    }
  }

  async function createNote() {
    if (!title.trim() && !content.trim()) return;

    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "(無標題)",
          content: content.trim(),
        }),
      });
      if (!res.ok) throw new Error(`POST /api/notes failed: ${res.status}`);

      setTitle("");
      setContent("");
      await fetchNotes();
    } catch (e: any) {
      setErrMsg(e?.message ?? "新增失敗");
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id: string) {
    const ok = window.confirm("確定要刪除這則筆記嗎？");
    if (!ok) return;

    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`DELETE /api/notes/${id} failed: ${res.status}`);

      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setErrMsg(e?.message ?? "刪除失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  const ThemeSwitch = () => (
    <button
      onClick={() => setDark((v) => !v)}
      aria-label="toggle theme"
      style={{
        width: 52,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${theme.border}`,
        background: dark ? "#22c55e" : theme.btnBg,
        position: "relative",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: dark ? 26 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.18s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
  
  return (
    
    <div
      style={{
        padding: 16,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "sans-serif",
        background: theme.panel,
        color: theme.text,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Universal Note App</h2>
        <ThemeSwitch />
      </div>

      {/* Editor */}
      <div style={{ display: "grid", gap: 8, marginTop: 12, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="標題"
          style={{
            padding: 8,
            background: theme.inputBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
          }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="內容"
          rows={4}
          style={{
            padding: 8,
            background: theme.inputBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={createNote}
            disabled={loading}
            style={{
              padding: "8px 12px",
              background: theme.btnBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "新增中..." : "新增"}
          </button>
          <button
            onClick={fetchNotes}
            style={{
              padding: "8px 12px",
              background: theme.btnBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            重新整理
          </button>
        </div>

        {errMsg && (
          <div style={{ padding: 10, border: `1px solid ${theme.border}`, borderRadius: 6 }}>
            <b>錯誤：</b> {errMsg}
          </div>
        )}
      </div>

      {/* Notes */}
      <h3 style={{ marginTop: 0 }}>目前筆記（{notes.length}）</h3>

      {notes.length === 0 ? (
        <div style={{ color: theme.muted }}>目前沒有筆記（或 API 還沒通）</div>
      ) : (
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
              {/* Delete X */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(n.id);
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

              <div style={{ whiteSpace: "pre-wrap", marginTop: 8, paddingBottom: 18 }}>
                {n.content}
              </div>

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
      )}
    </div>
  );
}