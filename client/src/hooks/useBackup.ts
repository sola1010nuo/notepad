// 匯入匯出
import { useState } from "react";
import { exportBackup, importBackup, type BackupPayload } from "../services/api";

type UseBackupParams = {
  dark: boolean;
  remindAdvanceMinutes: number;
  setDark: (dark: boolean) => void;
  setRemindAdvanceMinutes: (minutes: number) => void;
};

export function useBackup({
  dark,
  remindAdvanceMinutes,
  setDark,
  setRemindAdvanceMinutes,
}: UseBackupParams) {
  const [backupMessage, setBackupMessage] = useState("");
  const [backupMessageType, setBackupMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);

  function showMessage(message: string, type: "success" | "error") {
    setBackupMessage(message);
    setBackupMessageType(type);

    setTimeout(() => {
      setBackupMessage("");
      setBackupMessageType("");
    }, 2000);
  }

  async function handleExportBackup() {
    try {
      const backup = await exportBackup({
        darkMode: dark,
        remindAdvanceMinutes,
      });

      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);

      const defaultFileName = `note-backup-${ts}.json`;

      if (!window.electronAPI?.saveBackupFile) {
        showMessage("目前無法使用桌面版匯出功能", "error");
        return;
      }

      const result = await window.electronAPI.saveBackupFile(
        JSON.stringify(backup, null, 2),
        defaultFileName
      );

      if (result?.canceled) return;

      if (!result?.ok) {
        showMessage("匯出失敗", "error");
        return;
      }

      showMessage("匯出成功", "success");
    } catch (err) {
      console.error(err);
      showMessage("匯出失敗", "error");
    }
  }

  async function handleImportBackup() {
    try {
      if (!window.electronAPI?.openBackupFile) {
        showMessage("目前無法使用桌面版匯入功能", "error");
        return;
      }

      const picked = await window.electronAPI.openBackupFile();

      if (picked?.canceled) return;

      if (!picked?.ok || !picked?.content) {
        showMessage("讀取備份檔失敗", "error");
        return;
      }

      const parsed = JSON.parse(picked.content) as BackupPayload;

      setPendingBackup(parsed);
      setImportConfirmOpen(true);
    } catch (err) {
      console.error(err);
      showMessage("匯入失敗，請確認備份檔格式是否正確", "error");
    }
  }

  async function confirmImportBackup() {
    if (!pendingBackup) return;

    try {
      const result = await importBackup(pendingBackup);

      setDark(result.settings.darkMode);
      setRemindAdvanceMinutes(result.settings.remindAdvanceMinutes);

      localStorage.setItem("darkMode", JSON.stringify(result.settings.darkMode));
      localStorage.setItem(
        "remindAdvanceMinutes",
        String(result.settings.remindAdvanceMinutes)
      );

      setImportConfirmOpen(false);
      setPendingBackup(null);

      window.location.reload();
    } catch (err) {
      console.error(err);
      setImportConfirmOpen(false);
      setPendingBackup(null);
      showMessage("匯入失敗，請確認備份檔格式是否正確", "error");
    }
  }

  function cancelImportBackup() {
    setImportConfirmOpen(false);
    setPendingBackup(null);
  }

  return {
    backupMessage,
    backupMessageType,
    handleExportBackup,
    handleImportBackup,
    importConfirmOpen,
    confirmImportBackup,
    cancelImportBackup,
  };
}