const { contextBridge, ipcRenderer } = require("electron");

console.log("[preload] loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  updateReminders: (payload) => ipcRenderer.invoke("reminder:update-all", payload),
  resetReminder: (noteId) => ipcRenderer.invoke("reminder:reset-one", noteId),
  removeReminder: (noteId) => ipcRenderer.invoke("reminder:remove-one", noteId),

  saveBackupFile: (content, defaultFileName) =>
    ipcRenderer.invoke("backup:save-file", { content, defaultFileName }),

  openBackupFile: () => ipcRenderer.invoke("backup:open-file"),
});