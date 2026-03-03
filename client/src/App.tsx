import React, { useEffect, useState } from "react";
import NoteModal from "./components/NoteModal";
import NoteEditModal from "./components/NoteEditModal";
import ThemeSwitch from "./components/ThemeSwitch";
import Sidebar from "./components/Sidebar";
import { darkTheme, lightTheme } from "./styles/theme";
import { useNotes } from "./hooks/useNotes";
import { useNoteForm } from "./hooks/useNoteForm";
import TopActions from "./components/TopActions";
import "./styles/nativeDateInput.css";
import NotesList from "./components/NotesList";
import type { Note } from "./hooks/useNotes";



export default function App() {
  const [dark, setDark] = useState(true);
  const { notes, loading, errMsg, setErrMsg, create, update, remove } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const form = useNoteForm(showModal);
  const theme = dark ? darkTheme : lightTheme;


  const allTags = Array.from(
    new Set(notes.filter((n) => n.tag).map((n) => n.tag as string))
  ).sort();
  

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  // 每次打開 Modal 清掉錯誤
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

  function toggleDeleteMode() {
    setDeleteMode((d) => {
      if (d) setSelectedForDelete(new Set()); // exiting clear selections
      return !d;
    });
  }

  function handleSelect(id: string, checked: boolean) {
    setSelectedForDelete((prev) => {
      const s = new Set(prev);
      if (checked) s.add(id);
      else s.delete(id);
      return s;
    });
  }

  async function confirmBulkDelete() {
    if (selectedForDelete.size === 0) return;
    const ok = window.confirm(`確定刪除 ${selectedForDelete.size} 筆記？`);
    if (!ok) return;
    for (const id of selectedForDelete) {
      await remove(id);
    }
    setSelectedForDelete(new Set());
    setDeleteMode(false);
  }

  async function handleEditSave(id: string, data: any) {
    const ok = await update(id, data);
    if (ok) {
      setEditingNote(null);
    }
  }

  async function handleRemindToggle(id: string, newRemind: number) {
    await update(id, { remind: newRemind });
  }

  // 根據選中的標籤過濾筆記
  const filteredNotes = selectedTag ? notes.filter((n) => n.tag === selectedTag) : notes;



  return (
    <div
      style={{
        padding: 16,
        fontFamily: "sans-serif",
        background: theme.panel,
        color: theme.text,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>NotePad</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{dark ? "🌙" : "🔆"}</span>
          <ThemeSwitch dark={dark} theme={theme} onToggle={() => setDark((v) => !v)} />
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "flex", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        {/* Sidebar */}
        <Sidebar
          theme={theme}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Top Buttons */}
          <TopActions
            theme={theme}
            loading={loading}
            onAdd={() => {
              setErrMsg(null);
              // 標籤頁面按新增 自動設置
              if (selectedTag) {
                form.setTag(selectedTag);
              }
              setShowModal(true);
            }}
            deleteMode={deleteMode}
            onToggleDelete={toggleDeleteMode}
            onConfirmDelete={confirmBulkDelete}
          />

          {errMsg && (
            <div style={{ padding: 10, border: `1px solid ${theme.border}`, borderRadius: 8, marginBottom: 12 }}>
              <b>錯誤：</b> {errMsg}
            </div>
          )}

          {/* Notes */}
          <h3 style={{ marginTop: 0 }}>
            {selectedTag ? `標籤：${selectedTag}` : "全部筆記"}（{filteredNotes.length}）
          </h3>

          {/* NoteList */}
          <NotesList
            notes={filteredNotes}
            theme={theme}
            dark={dark}
            onDelete={deleteNote}
            onEdit={setEditingNote}
            onRemindToggle={handleRemindToggle}
            deleteMode={deleteMode}
            selectedIds={selectedForDelete}
            onSelect={handleSelect}
          />
        </div>
      </div>

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
        tag={form.tag}
        setTag={form.setTag}
        remind={form.remind}
        setRemind={form.setRemind}
        onClose={() => setShowModal(false)}
        onSave={createNoteFromModal}
      />

      {/* NoteEditModal */}
      <NoteEditModal
        open={!!editingNote}
        theme={theme}
        loading={loading}
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}