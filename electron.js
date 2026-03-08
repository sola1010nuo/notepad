const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const reminderManager = require("./reminderManager");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("no-proxy-server");
app.commandLine.appendSwitch("proxy-auto-detect", "false");

// during development we may load TypeScript files directly
if (process.env.ELECTRON_START_URL) {
  try {
    require('ts-node').register({ transpileOnly: true });
  } catch (e) {
    // ts-node might not be installed; ignore if so
  }
}

// start the express server from our TypeScript source via ts-node if needed
let serverStarted = false;

const fs = require('fs');

async function startServer() {
  try {
    // determine whether we should use the compiled output or raw source
    let serverModulePath;
    const compiled = path.join(__dirname, 'server', 'dist', 'index.js');
    if (fs.existsSync(compiled)) {
      serverModulePath = compiled;
    } else {
      serverModulePath = path.join(__dirname, 'server', 'src', 'index');
    }

    // eslint-disable-next-line import/no-dynamic-require, global-require
    const serverModule = require(serverModulePath);
    if (serverModule && typeof serverModule.startServer === 'function') {
      await serverModule.startServer();
      serverStarted = true;
    }
  } catch (err) {
    console.error('Failed to start server:', err);
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

  // 先印出來，確認 Electron 真的有拿到 env
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});