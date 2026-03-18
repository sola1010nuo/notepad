# Universal Note App

A simple desktop note-taking application built with Electron, React, and SQLite.

This app is designed for personal use with local data storage and basic productivity features such as reminders, tags, and search.

---

## Features

* Create, edit, and delete notes
* Optional start time and end time
* Reminder system with configurable advance time
* Tag-based filtering
* Search by title or content
* Bulk delete notes
* Automatic detection of expired notes
* Local database (data is stored on your device)

---

## How to Use

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

Start frontend:

```bash
npm run client
```

Start backend:

```bash
npm run server
```

Start Electron:

```bash
npm run electron:dev
```

---

### 3. Build the application

```bash
npm run build
```

---

### 4. Package as desktop app (.exe)

```bash
npm run dist
```

After packaging, the output will be in:

```
dist_electron/
```

You can run:

* `UniversalNoteApp Setup.exe` (installer), or
* `win-unpacked/UniversalNoteApp.exe` (portable version)

---

## Notes

* All data is stored locally using SQLite.
* This app does not include cloud sync or account login.
* On Windows, building may require installing Visual Studio with C++ tools if native dependencies fail to compile.

---