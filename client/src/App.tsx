import React, { useEffect, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = ""; 
// ✅ 如果你有設定 proxy（推薦），保持空字串即可，fetch("/api/notes") 會自動走同網域代理
// ❗如果沒有 proxy，你可以改成例如：const API_BASE = "http://localhost:4000";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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
        body: JSON.stringify({ title: title.trim() || "(無標題)", content: content.trim() }),
      });
      if (!res.ok) throw new Error(`POST /api/notes failed: ${res.status}`);

      // ✅ 新增成功後：清空輸入 + 重新抓列表，馬上看到新增的東西
      setTitle("");
      setContent("");
      await fetchNotes();
    } catch (e: any) {
      setErrMsg(e?.message ?? "新增失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Universal Note App</h2>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="標題"
          style={{ padding: 8 }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="內容"
          rows={4}
          style={{ padding: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={createNote} disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "新增中..." : "新增"}
          </button>
          <button onClick={fetchNotes} style={{ padding: "8px 12px" }}>
            重新整理
          </button>
        </div>

        {errMsg && (
          <div style={{ padding: 10, border: "1px solid #ddd" }}>
            <b>錯誤：</b> {errMsg}
          </div>
        )}
      </div>

      <h3>目前筆記（{notes.length}）</h3>

      {notes.length === 0 ? (
        <div style={{ opacity: 0.7 }}>目前沒有筆記（或 API 還沒通）</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {notes.map((n) => (
            <div key={n.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <b>{n.title}</b>
                <span style={{ opacity: 0.7, fontSize: 12 }}>
                  更新：{new Date(n.updatedAt).toLocaleString()}
                </span>
              </div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{n.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}