import React from "react";
import TopActions from "./TopActions";
import SearchBox from "./SearchBox";
import NotesList from "./NotesList";
import type { Theme } from "../styles/theme";
import type { Note } from "../hooks/useNotes";

// NotesMainSection.tsx
// 記事本主內容區的顯示元件。
// 負責渲染搜尋、操作列、已過期區塊與一般記事本區塊。
// 資料與事件由 App.tsx 傳入。

type Props = {
  theme: Theme;
  dark: boolean;
  loading: boolean;
  errMsg: string | null;
  selectedTag: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;

  filteredNotes: Note[];
  expiredNotes: Note[];
  activeNotes: Note[];

  deleteMode: boolean;
  selectedForDelete: Set<string>;

  onAdd: () => void;
  onToggleDelete: () => void;
  onConfirmBulkDelete: () => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onRemindToggle: (id: string, newRemind: number) => void;
  onSelect: (id: string, checked: boolean) => void;

  onDeleteExpiredNotes: () => void;
  onDeleteActiveNotes: () => void;
  onDeleteTaggedNotes: () => void;
};

export default function NotesMainSection(props: Props) {
  // ===== props =====
  // 接收 App.tsx 傳入的資料與事件
  const {
    theme,
    dark,
    loading,
    errMsg,
    selectedTag,
    searchTerm,
    setSearchTerm,
    filteredNotes,
    expiredNotes,
    activeNotes,
    deleteMode,
    selectedForDelete,
    onAdd,
    onToggleDelete,
    onConfirmBulkDelete,
    onDelete,
    onEdit,
    onRemindToggle,
    onSelect,
    onDeleteExpiredNotes,
    onDeleteActiveNotes,
    onDeleteTaggedNotes,
  } = props;

  return (
    <div style={{ flex: 1 }}>
      {/* ===== top actions =====
          顯示新增按鈕、批次刪除模式切換、批次刪除確認 */}
      <TopActions
        theme={theme}
        loading={loading}
        onAdd={onAdd}
        deleteMode={deleteMode}
        onToggleDelete={onToggleDelete}
        onConfirmDelete={onConfirmBulkDelete}
      />

      {/* ===== error message =====
          如果有錯誤訊息，就顯示在主內容上方 */}
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

      {/* ===== search and status =====
          搜尋框 + 目前正在看的分類（全部 / 某個 tag）+ 筆記數量 */}
      <SearchBox
        theme={theme}
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <h3 style={{ marginTop: 0 }}>
        {selectedTag ? `標籤：${selectedTag}` : "全部"}（{filteredNotes.length}）
      </h3>

      {/* ===== expired notes =====
          顯示已過期記事本區塊
          只有在 expiredNotes 有資料時才顯示 */}
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
              onClick={onDeleteExpiredNotes}
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
            onDelete={onDelete}
            onEdit={onEdit}
            onRemindToggle={onRemindToggle}
            deleteMode={deleteMode}
            selectedIds={selectedForDelete}
            onSelect={onSelect}
          />
        </div>
      )}

      {/* ===== active notes =====
          顯示一般記事本區塊
          如果目前有選 tag，全部刪除按鈕會刪掉這個 tag 下的記事本；
          否則就是刪掉所有一般記事本。 */}
      <div>
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
              borderLeft: `4px solid ${theme.border}`,
              paddingLeft: 10,
            }}
          >
            記事本（{activeNotes.length}）
          </h4>

          <button
            onClick={selectedTag ? onDeleteTaggedNotes : onDeleteActiveNotes}
            disabled={activeNotes.length === 0}
            style={{
              border: `1px solid ${theme.border}`,
              background: dark ? "rgba(239,68,68,0.12)" : "#fff5f5",
              color: theme.text,
              padding: "6px 12px",
              borderRadius: 8,
              cursor: activeNotes.length === 0 ? "not-allowed" : "pointer",
              fontSize: 13,
              opacity: activeNotes.length === 0 ? 0.5 : 1,
            }}
          >
            全部刪除
          </button>
        </div>

        <NotesList
          notes={activeNotes}
          theme={theme}
          dark={dark}
          onDelete={onDelete}
          onEdit={onEdit}
          onRemindToggle={onRemindToggle}
          deleteMode={deleteMode}
          selectedIds={selectedForDelete}
          onSelect={onSelect}
          emptyText="目前沒有一般記事本"
        />
      </div>
    </div>
  );
}