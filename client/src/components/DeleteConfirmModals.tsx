import React from "react";
import ConfirmModal from "./ConfirmModal";
import type { Theme } from "../styles/theme";
import type { Note } from "../hooks/useNotes";

// DeleteConfirmModals.tsx
// 專門負責顯示各種刪除確認視窗。
// 所有刪除流程的資料與事件都由 App.tsx 傳入，
// 這個元件只負責把對應的 ConfirmModal 顯示出來。

type Props = {
  theme: Theme;
  selectedTag: string | null;
  selectedForDelete: Set<string>;
  confirmDeleteId: string | null;

  openBulkConfirm: boolean;
  openExpiredDeleteConfirm: boolean;
  openActiveDeleteConfirm: boolean;
  openTagDeleteConfirm: boolean;

  expiredNotes: Note[];
  activeNotes: Note[];

  onCloseSingleDelete: () => void;
  onConfirmSingleDelete: () => void;

  onCloseBulkDelete: () => void;
  onConfirmBulkDelete: () => void;

  onCloseExpiredDelete: () => void;
  onConfirmExpiredDelete: () => void;

  onCloseActiveDelete: () => void;
  onConfirmActiveDelete: () => void;

  onCloseTagDelete: () => void;
  onConfirmTagDelete: () => void;
};

export default function DeleteConfirmModals(props: Props) {
  const {
    theme,
    selectedTag,
    selectedForDelete,
    confirmDeleteId,
    openBulkConfirm,
    openExpiredDeleteConfirm,
    openActiveDeleteConfirm,
    openTagDeleteConfirm,
    expiredNotes,
    activeNotes,
    onCloseSingleDelete,
    onConfirmSingleDelete,
    onCloseBulkDelete,
    onConfirmBulkDelete,
    onCloseExpiredDelete,
    onConfirmExpiredDelete,
    onCloseActiveDelete,
    onConfirmActiveDelete,
    onCloseTagDelete,
    onConfirmTagDelete,
  } = props;

  return (
    <>
      {/* 批次刪除確認 */}
      <ConfirmModal
        open={openBulkConfirm}
        theme={theme}
        message={`確定刪除 ${selectedForDelete.size} 筆？`}
        onCancel={onCloseBulkDelete}
        onConfirm={onConfirmBulkDelete}
      />

      {/* 單筆刪除確認 */}
      <ConfirmModal
        open={!!confirmDeleteId}
        theme={theme}
        message="確定刪除？"
        onCancel={onCloseSingleDelete}
        onConfirm={onConfirmSingleDelete}
      />

      {/* 刪除已過期記事本確認 */}
      <ConfirmModal
        open={openExpiredDeleteConfirm}
        theme={theme}
        message={`確定刪除 ${expiredNotes.length} 筆已過期記事本？`}
        onCancel={onCloseExpiredDelete}
        onConfirm={onConfirmExpiredDelete}
      />

      {/* 刪除一般記事本確認 */}
      <ConfirmModal
        open={openActiveDeleteConfirm}
        theme={theme}
        message={`確定刪除 ${activeNotes.length} 筆記事本？`}
        onCancel={onCloseActiveDelete}
        onConfirm={onConfirmActiveDelete}
      />

      {/* 刪除目前標籤底下記事本確認 */}
      <ConfirmModal
        open={openTagDeleteConfirm}
        theme={theme}
        message={`確定刪除標籤「${selectedTag}」下的 ${activeNotes.length} 筆記事本？`}
        onCancel={onCloseTagDelete}
        onConfirm={onConfirmTagDelete}
      />
    </>
  );
}