import React, { useEffect, useState } from "react";
import NoteModal from "./components/NoteModal";
import NoteEditModal from "./components/NoteEditModal";
import Sidebar from "./components/Sidebar";
import { darkTheme, lightTheme } from "./styles/theme";
import { useNotes } from "./hooks/useNotes";
import { useNoteForm } from "./hooks/useNoteForm";
import TopActions from "./components/TopActions";
import "./styles/nativeDateInput.css";
import NotesList from "./components/NotesList";
import type { Note } from "./hooks/useNotes";
import ConfirmModal from "./components/ConfirmModal";
import SettingsModal from "./components/SettingsModal";
import AppHeader from "./components/AppHeader";
import SearchBox from "./components/SearchBox";

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

  const [remindAdvanceMinutes, setRemindAdvanceMinutes] = useState<number>(
    getInitialRemindAdvanceMinutes
  );

  const allTags = Array.from(
    new Set(notes.filter((n) => n.tag).map((n) => n.tag as string))
  ).sort();

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
  }, [theme.bg]);

  // 每次打開新增 Modal 清掉錯誤，並帶入目前選中的 tag
  useEffect(() => {
    if (!showModal) return;
    setErrMsg(null);
    if (selectedTag) {
      form.setTag(selectedTag);
    }
  }, [showModal, setErrMsg, selectedTag, form]);

  // 記住全域提醒提前時間
  useEffect(() => {
    localStorage.setItem("remindAdvanceMinutes", remindAdvanceMinutes.toString());
  }, [remindAdvanceMinutes]);


  ///
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

  // 搜尋筆記（標題或內容包含搜尋字串，且符合選擇的標籤）
  const filteredNotes = notes.filter((n) => {
    if (selectedTag && n.tag !== selectedTag) return false;

    const txt = searchTerm.trim().toLowerCase();
    if (!txt) return true;
    if (n.title.toLowerCase().includes(txt)) return true;
    if (n.content.toLowerCase().includes(txt)) return true;

    return false;
  });

  /// 過期與未過期分開顯示
  const now = Date.now();
  const expiredNotes = filteredNotes.filter((n) => {
    if (!n.endAt) return false;

    const endTime = new Date(n.endAt).getTime();
    if (Number.isNaN(endTime)) return false;

    return endTime < now;
  });

  const activeNotes = filteredNotes.filter((n) => {
    if (!n.endAt) return true;

    const endTime = new Date(n.endAt).getTime();
    if (Number.isNaN(endTime)) return true;

    return endTime >= now;
  });
 /// 

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

    {/* App Header */}
    <AppHeader
        theme={theme}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
        onOpenSettings={() => setShowSettingsModal(true)}
    />

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
            <div
              style={{
                padding: 10,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <b>錯誤：</b> {errMsg}
            </div>
          )}

          {/* search box */}
         <SearchBox
            theme={theme}
            value={searchTerm}
            onChange={setSearchTerm}
            />

          <h3 style={{ marginTop: 0 }}>
            {selectedTag ? `標籤：${selectedTag}` : "全部"}（{filteredNotes.length}）
          </h3>

           {/* 已過期的記事本 */}
            {expiredNotes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    color: theme.text,
                    borderLeft: "4px solid #ef4444",
                    paddingLeft: 10,
                  }}
                >
                  已過期（{expiredNotes.length}）
                </h4>

                <button
                  onClick={handleDeleteExpiredNotes}
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: dark ? "rgba(239,68,68,0.12)" : "#fff5f5",
                    color: theme.text,
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  全部刪除
                </button>
              </div>

              <NotesList
                notes={expiredNotes}
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
          )}

          {/* 一般記事本 */}
          <div>
            <h4
              style={{
                margin: "0 0 10px 0",
                color: theme.text,
                borderLeft: `4px solid ${theme.border}`,
                paddingLeft: 10,
              }}
            >
              記事本（{activeNotes.length}）
            </h4>

            <NotesList
              notes={activeNotes}
              theme={theme}
              dark={dark}
              onDelete={deleteNote}
              onEdit={setEditingNote}
              onRemindToggle={handleRemindToggle}
              deleteMode={deleteMode}
              selectedIds={selectedForDelete}
              onSelect={handleSelect}
              emptyText="目前沒有一般記事本"
            />
          </div>
        </div>
      </div>

      {/* 新增筆記 Modal */}
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

      {/* 編輯筆記 Modal */}
      <NoteEditModal
        key={`edit-${editingNote?.id || "none"}`}
        open={!!editingNote}
        theme={theme}
        loading={modalLoading}
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditSave}
      />

      {/* 批量刪除確認 */}
      <ConfirmModal
        open={openBulkConfirm}
        theme={theme}
        message={`確定刪除 ${selectedForDelete.size} 筆？`}
        onCancel={() => setOpenBulkConfirm(false)}
        onConfirm={async () => {
          const idsToDelete = Array.from(selectedForDelete);
          await batchRemove(idsToDelete);
          setSelectedForDelete(new Set());
          setDeleteMode(false);
          setOpenBulkConfirm(false);
        }}
      />

      {/* 單筆刪除確認 */}
      <ConfirmModal
        open={!!confirmDeleteId}
        theme={theme}
        message="確定刪除？"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await remove(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />

      {/* 刪除全部已過期記事本確認 */}
      <ConfirmModal
        open={openExpiredDeleteConfirm}
        theme={theme}
        message={`確定刪除 ${expiredNotes.length} 筆已過期記事本？`}
        onCancel={() => setOpenExpiredDeleteConfirm(false)}
        onConfirm={async () => {
          const idsToDelete = expiredNotes.map((n) => n.id);
          await batchRemove(idsToDelete);

          setSelectedForDelete((prev) => {
            const next = new Set(prev);
            idsToDelete.forEach((id) => next.delete(id));
            return next;
          });

          setOpenExpiredDeleteConfirm(false);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        theme={theme}
        dark={dark}
        setDark={setDark}
        remindAdvanceMinutes={remindAdvanceMinutes}
        setRemindAdvanceMinutes={setRemindAdvanceMinutes}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}