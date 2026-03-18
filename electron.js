const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const reminderManager = require("./reminderManager");
const fs = require("fs");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("no-proxy-server");
app.commandLine.appendSwitch("proxy-auto-detect", "false");

// during development we may load TypeScript files directly
if (process.env.ELECTRON_START_URL) {
  try {
    require("ts-node").register({ transpileOnly: true });
  } catch (e) {
    // ts-node might not be installed; ignore if so
  }
}

// start the express server from our TypeScript source via ts-node if needed
let serverStarted = false;

async function startServer() {
  try {
    // determine whether we should use the compiled output or raw source
    let serverModulePath;
    const compiled = path.join(__dirname, "server", "dist", "index.js");
    if (fs.existsSync(compiled)) {
      serverModulePath = compiled;
    } else {
      serverModulePath = path.join(__dirname, "server", "src", "index");
    }

    const serverModule = require(serverModulePath);
    if (serverModule && typeof serverModule.startServer === "function") {
      await serverModule.startServer();
      serverStarted = true;
    }
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const devUrl = process.env.ELECTRON_START_URL;

  console.log("ELECTRON_START_URL =", devUrl);

  if (devUrl) {
    win.loadURL(devUrl);
    // win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "client", "build", "index.html"));
  }
}

if (process.platform === "win32") {
  app.setAppUserModelId(process.execPath);
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  ipcMain.handle("reminder:update-all", async (_event, payload) => {
    const { notes, remindAdvanceMinutes } = payload || {};
    reminderManager.updateAll(notes, remindAdvanceMinutes);
    return { ok: true };
  });

  ipcMain.handle("reminder:reset-one", async (_event, noteId) => {
    reminderManager.resetNotified(noteId);
    return { ok: true };
  });

  ipcMain.handle("reminder:remove-one", async (_event, noteId) => {
    reminderManager.removeNote(noteId);
    return { ok: true };
  });

  ipcMain.handle("backup:save-file", async (_event, { content, defaultFileName }) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "匯出備份",
        defaultPath: defaultFileName,
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (result.canceled || !result.filePath) {
        return { ok: false, canceled: true };
      }

      fs.writeFileSync(result.filePath, content, "utf-8");
      return { ok: true, canceled: false, filePath: result.filePath };
    } catch (err) {
      console.error("backup:save-file failed:", err);
      return {
        ok: false,
        canceled: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  ipcMain.handle("backup:open-file", async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: "匯入備份",
        properties: ["openFile"],
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { ok: false, canceled: true };
      }

      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, "utf-8");

      return {
        ok: true,
        canceled: false,
        filePath,
        content,
      };
    } catch (err) {
      console.error("backup:open-file failed:", err);
      return {
        ok: false,
        canceled: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});