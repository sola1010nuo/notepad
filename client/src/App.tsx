import React, { useEffect, useState } from "react";
import NoteModal from "./components/NoteModal";
import ThemeSwitch from "./components/ThemeSwitch";
import { darkTheme, lightTheme } from "./styles/theme";
import { useNotes } from "./hooks/useNotes";
import { useNoteForm } from "./hooks/useNoteForm";
import TopActions from "./components/TopActions";
import "./styles/nativeDateInput.css";
import NotesList from "./components/NotesList";

type Note = {
  id: string;
  title: string;
  content: string;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const [dark, setDark] = useState(true);
  const { notes, loading, errMsg, setErrMsg, refresh, create, remove } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const form = useNoteForm(showModal);
  const theme = dark ? darkTheme : lightTheme;

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  useEffect(() => {
    if (!showModal) return;
    setErrMsg(null);
  }, [showModal, setErrMsg]);

  async function createNoteFromModal() {
    const v = form.validate();
    if (!v.ok) {
      setErrMsg(v.message);
      return;
    }

    const ok = await create(form.payload as any);
    if (ok) setShowModal(false);
  }

  async function deleteNote(id: string) {
    const ok = window.confirm("確定要刪除這則筆記嗎？");
    if (!ok) return;
    await remove(id);
  }

  // 共用 input style（目前沒用到就留著）
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    background: theme.inputBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxSizing: "border-box",
    minWidth: 0,
  };

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
        <h2 style={{ margin: 0 }}>NotePad</h2>
        <ThemeSwitch dark={dark} theme={theme} onToggle={() => setDark((v) => !v)} />
      </div>

      {/* Top Buttons */}
      <TopActions
        theme={theme}
        loading={loading}
        onAdd={() => {
            setErrMsg(null);
            setShowModal(true);
        }}
        onRefresh={refresh}
        />

      {errMsg && (
        <div style={{ padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8, marginBottom: 12 }}>
          <b>錯誤：</b> {errMsg}
        </div>
      )}

      {/* Notes */}
      <h3 style={{ marginTop: 0 }}>目前筆記（{notes.length}）</h3>

      {/* NoteList */}
      <NotesList notes={notes} theme={theme} dark={dark} onDelete={deleteNote} />

      {/* NoteModal */}
      <NoteModal
        open={showModal}
        theme={theme}
        loading={loading}
        title={form.title}
        setTitle={form.setTitle}
        content={form.content}
        setContent={form.setContent}
        startDate={form.startDate}
        setStartDate={form.setStartDate}
        startTime={form.startTime}
        setStartTime={form.setStartTime}
        endDate={form.endDate}
        setEndDate={form.setEndDate}
        endTime={form.endTime}
        setEndTime={form.setEndTime}
        onClose={() => setShowModal(false)}
        onSave={createNoteFromModal}
      />
    </div>
  );
}