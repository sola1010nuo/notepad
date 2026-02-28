const { app, BrowserWindow } = require('electron');
const path = require('path');

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
    },
  });

  const devUrl = process.env.ELECTRON_START_URL;

  // 🔎 先印出來，確認 Electron 真的有拿到 env（超重要）
  console.log("ELECTRON_START_URL =", devUrl);

  if (devUrl) {
    win.loadURL(devUrl);
    // win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "client", "build", "index.html"));
  }
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});