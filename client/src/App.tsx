import React, { useEffect, useState } from "react";
import NoteModal from "./components/NoteModal";
import NoteEditModal from "./components/NoteEditModal";
import Sidebar from "./components/Sidebar";
import { darkTheme, lightTheme } from "./styles/theme";
import { useNotes } from "./hooks/useNotes";
import { useNoteForm } from "./hooks/useNoteForm";
import type { Note } from "./hooks/useNotes";
import ConfirmModal from "./components/ConfirmModal";
import SettingsModal from "./components/SettingsModal";
import AppHeader from "./components/AppHeader";
import { useBackup } from "./hooks/useBackup";
import ImportConfirmModal from "./components/ImportConfirmModal";
import { useFilteredNotes } from "./hooks/useFilteredNotes";
import NotesMainSection from "./components/NotesMainSection";
import "./styles/nativeDateInput.css";
import DeleteConfirmModals from "./components/DeleteConfirmModals";

// App.tsx
// 整個記事本頁面的主控中心：
// 負責管理 state、處理事件、組合 hooks，並把資料傳給各子元件。

function getInitialRemindAdvanceMinutes() {
  const saved = localStorage.getItem("remindAdvanceMinutes");
  const parsed = Number(saved);

  if (!Number.isNaN(parsed) && parsed >= 0) {
    return parsed;
  }

  return 30; // 預設 30 分鐘
}

export default function App() {
  const [dark, setDark] = useState(true);
  const {
    notes,
    loading,
    errMsg,
    setErrMsg,
    create,
    update,
    remove,
    batchRemove,
  } = useNotes();

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [modalLoading, setModalLoading] = useState(false);
  const form = useNoteForm(showModal);
  const theme = dark ? darkTheme : lightTheme;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openBulkConfirm, setOpenBulkConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openExpiredDeleteConfirm, setOpenExpiredDeleteConfirm] = useState(false);
  const [openActiveDeleteConfirm, setOpenActiveDeleteConfirm] = useState(false);
  const [openTagDeleteConfirm, setOpenTagDeleteConfirm] = useState(false);

  const [remindAdvanceMinutes, setRemindAdvanceMinutes] = useState<number>(
    getInitialRemindAdvanceMinutes
  );

  const allTags = Array.from(
    new Set(
      notes
        .flatMap((n) => (n.tag ?? "").split(","))
        .map((t) => t.trim())
        .filter((tag): tag is string => Boolean(tag))
    )
  ).sort((a, b) => a.localeCompare(b));

  const {
    backupMessage,
    backupMessageType,
    handleExportBackup,
    handleImportBackup,
    importConfirmOpen,
    confirmImportBackup,
    cancelImportBackup,
  } = useBackup({
    dark,
    remindAdvanceMinutes,
    setDark,
    setRemindAdvanceMinutes,
  });

  const { filteredNotes, expiredNotes, activeNotes } = useFilteredNotes({
    notes,
    selectedTag,
    searchTerm,
  });

  async function handleImportFromSettings() {
    setShowSettingsModal(false);
    await handleImportBackup();
  }

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  useEffect(() => {
    if (!showModal) return;
    setErrMsg(null);
    if (selectedTag) {
      form.setTag(selectedTag);
    }
  }, [showModal, setErrMsg, selectedTag, form]);

  useEffect(() => {
    localStorage.setItem("remindAdvanceMinutes", remindAdvanceMinutes.toString());
  }, [remindAdvanceMinutes]);

  useEffect(() => {
    console.log("[Renderer] remindAdvanceMinutes =", remindAdvanceMinutes);
    console.log(
      "[Renderer] notes =",
      notes.map((n) => ({
        id: n.id,
        title: n.title,
        startAt: n.startAt,
        endAt: n.endAt,
      }))
    );

    if (!window.electronAPI?.updateReminders) return;

    window.electronAPI
      .updateReminders({
        notes,
        remindAdvanceMinutes,
      })
      .then(() => {
        console.log("[Renderer] reminders synced");
      })
      .catch((err) => {
        console.error("[Renderer] failed to sync reminders:", err);
      });
  }, [notes, remindAdvanceMinutes]);

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
      if (d) setSelectedForDelete(new Set());
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

  function handleDeleteExpiredNotes() {
    if (expiredNotes.length === 0) return;
    setOpenExpiredDeleteConfirm(true);
  }

  function handleDeleteActiveNotes() {
    if (activeNotes.length === 0) return;
    setOpenActiveDeleteConfirm(true);
  }

  function handleDeleteTaggedNotes() {
    if (activeNotes.length === 0) return;
    setOpenTagDeleteConfirm(true);
  }

  async function handleEditSave(id: string, data: any) {
    setModalLoading(true);
    const ok = await update(id, data);
    setModalLoading(false);

    if (ok) {
      await window.electronAPI?.resetReminder(id);
      setEditingNote(null);
    }
  }

  async function handleRemindToggle(id: string, newRemind: number) {
    await update(id, { remind: newRemind });
  }

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
      <AppHeader
        theme={theme}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <div style={{ display: "flex", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        <Sidebar
          theme={theme}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        <NotesMainSection
          theme={theme}
          dark={dark}
          loading={loading}
          errMsg={errMsg}
          selectedTag={selectedTag}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredNotes={filteredNotes}
          expiredNotes={expiredNotes}
          activeNotes={activeNotes}
          deleteMode={deleteMode}
          selectedForDelete={selectedForDelete}
          onAdd={() => {
            setErrMsg(null);
            setShowModal(true);
          }}
          onToggleDelete={toggleDeleteMode}
          onConfirmBulkDelete={confirmBulkDelete}
          onDelete={deleteNote}
          onEdit={setEditingNote}
          onRemindToggle={handleRemindToggle}
          onSelect={handleSelect}
          onDeleteExpiredNotes={handleDeleteExpiredNotes}
          onDeleteActiveNotes={handleDeleteActiveNotes}
          onDeleteTaggedNotes={handleDeleteTaggedNotes}
        />
      </div>

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
        existingTags={allTags}
        remind={form.remind}
        setRemind={form.setRemind}
        onClose={() => setShowModal(false)}
        onSave={createNoteFromModal}
      />

      <NoteEditModal
        key={`edit-${editingNote?.id || "none"}`}
        open={!!editingNote}
        theme={theme}
        loading={modalLoading}
        note={editingNote}
        existingTags={allTags}
        onClose={() => setEditingNote(null)}
        onSave={handleEditSave}
      />

      <DeleteConfirmModals
        theme={theme}
        selectedTag={selectedTag}
        selectedForDelete={selectedForDelete}
        confirmDeleteId={confirmDeleteId}
        openBulkConfirm={openBulkConfirm}
        openExpiredDeleteConfirm={openExpiredDeleteConfirm}
        openActiveDeleteConfirm={openActiveDeleteConfirm}
        openTagDeleteConfirm={openTagDeleteConfirm}
        expiredNotes={expiredNotes}
        activeNotes={activeNotes}
        onCloseSingleDelete={() => setConfirmDeleteId(null)}
        onConfirmSingleDelete={async () => {
          if (!confirmDeleteId) return;
          await remove(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCloseBulkDelete={() => setOpenBulkConfirm(false)}
        onConfirmBulkDelete={async () => {
          const idsToDelete = Array.from(selectedForDelete);
          await batchRemove(idsToDelete);
          setSelectedForDelete(new Set());
          setDeleteMode(false);
          setOpenBulkConfirm(false);
        }}
        onCloseExpiredDelete={() => setOpenExpiredDeleteConfirm(false)}
        onConfirmExpiredDelete={async () => {
          const idsToDelete = expiredNotes.map((n) => n.id);
          await batchRemove(idsToDelete);

          setSelectedForDelete((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });

          setOpenExpiredDeleteConfirm(false);
        }}
        onCloseActiveDelete={() => setOpenActiveDeleteConfirm(false)}
        onConfirmActiveDelete={async () => {
          const idsToDelete = activeNotes.map((n) => n.id);
          await batchRemove(idsToDelete);

          setSelectedForDelete((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });

          setOpenActiveDeleteConfirm(false);
        }}
        onCloseTagDelete={() => setOpenTagDeleteConfirm(false)}
        onConfirmTagDelete={async () => {
          const idsToDelete = activeNotes.map((n) => n.id);
          await batchRemove(idsToDelete);

          setSelectedForDelete((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });

          setOpenTagDeleteConfirm(false);
        }}
      />

      <SettingsModal
        open={showSettingsModal}
        theme={theme}
        dark={dark}
        setDark={setDark}
        remindAdvanceMinutes={remindAdvanceMinutes}
        setRemindAdvanceMinutes={setRemindAdvanceMinutes}
        onClose={() => setShowSettingsModal(false)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportFromSettings}
        backupMessage={backupMessage}
        backupMessageType={backupMessageType}
      />

      <ImportConfirmModal
        open={importConfirmOpen}
        theme={theme}
        onConfirm={confirmImportBackup}
        onCancel={cancelImportBackup}
      />
    </div>
  );
}