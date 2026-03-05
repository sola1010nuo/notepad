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
import ConfirmModal from "./components/ConfirmModal";
import { getInputStyle } from "./styles/ui";



export default function App() {
  const [dark, setDark] = useState(true);
  const { notes, loading, errMsg, setErrMsg, create, update, remove, batchRemove } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [modalLoading, setModalLoading] = useState(false);
  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const form = useNoteForm(showModal);
  const theme = dark ? darkTheme : lightTheme;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openBulkConfirm, setOpenBulkConfirm] = useState(false);

  const allTags = Array.from(
    new Set(notes.filter((n) => n.tag).map((n) => n.tag as string))
  ).sort();
  

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  // 每次打開 Modal 清掉錯誤和設置標籤
  useEffect(() => {
    if (!showModal) return;
    setErrMsg(null);
    // Modal 打開後，如果有選中的標籤就設置它
    if (selectedTag) {
      form.setTag(selectedTag);
    }
  }, [showModal, setErrMsg, selectedTag, form]);

  async function createNoteFromModal() {
    const v = form.validate();
    if (!v.ok) {
      setErrMsg(v.message);
      return;
    }

    setModalLoading(true);
    const ok = await create(form.payload as any);
    setModalLoading(false);
    if (ok) setShowModal(false);
  }

  async function deleteNote(id: string) {
     setConfirmDeleteId(id);
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
  setOpenBulkConfirm(true);
  }

  async function handleEditSave(id: string, data: any) {
    setModalLoading(true);
    const ok = await update(id, data);
    setModalLoading(false);
    if (ok) {
      setEditingNote(null);
    }
  }

  async function handleRemindToggle(id: string, newRemind: number) {
    await update(id, { remind: newRemind });
  }

  // 搜尋筆記（標題或內容包含搜尋字串，且符合選擇的標籤）
  const filteredNotes = notes.filter((n) => {
    // tag filter first
    if (selectedTag && n.tag !== selectedTag) return false;
    // search filter (case‑insensitive)
    const txt = searchTerm.trim().toLowerCase();
    if (!txt) return true;
    if (n.title.toLowerCase().includes(txt)) return true;
    if (n.content.toLowerCase().includes(txt)) return true;
    return false;
  });



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
          {/* search box */}
          <div style={{ marginBottom: 8 }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋標題或內容"
              style={getInputStyle(theme)}
            />
          </div>

          <h3 style={{ marginTop: 0 }}>
            {selectedTag ? `標籤：${selectedTag}` : "全部"}（{filteredNotes.length}）
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
        key={`modal-${showModal}`}
        open={showModal}
        theme={theme}
        loading={modalLoading}
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
        key={`edit-${editingNote?.id || 'none'}`}
        open={!!editingNote}
        theme={theme}
        loading={modalLoading}
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditSave}
      />

        {/*批量刪除*/}
      <ConfirmModal
        open={openBulkConfirm}
        theme={theme}
        message={`確定刪除 ${selectedForDelete.size} ？`}
        onCancel={() => setOpenBulkConfirm(false)}
        onConfirm={async () => {
            const idsToDelete = Array.from(selectedForDelete);

            await batchRemove(idsToDelete);

            setSelectedForDelete(new Set());
            setDeleteMode(false);
            setOpenBulkConfirm(false);
        }}
    />
        {/* X 刪除 */}
      <ConfirmModal
        open={!!confirmDeleteId}
        theme={theme}
        message="確定刪除"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
            if (!confirmDeleteId) return;
            await remove(confirmDeleteId);
            setConfirmDeleteId(null);
        }}
        />
    </div>
  );
}