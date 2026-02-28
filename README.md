# Universal Note App

## Overview
The Universal Note App is a web application that allows users to create, edit, and view notes. It is built using React for the client-side and Node.js with Express for the server-side. This application provides a simple and intuitive interface for managing notes.

## Features
- Create new notes
- Edit existing notes
- View notes in detail
- Responsive design for mobile and desktop

## Project Structure
```
universal-note-app
├── client                # Client-side application
│   ├── public            # Public assets
│   ├── src               # Source code
│   ├── package.json      # Client dependencies
│   └── tsconfig.json     # Client TypeScript configuration
├── server                # Server-side application
│   ├── src               # Source code
│   ├── package.json      # Server dependencies
│   └── tsconfig.json     # Server TypeScript configuration
├── shared                # Shared types
├── scripts               # Scripts for automation
├── .gitignore            # Git ignore file
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Dockerfile for building the application
├── package.json          # Root project dependencies
└── tsconfig.json         # Root TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Docker (optional)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd universal-note-app
   ```

2. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```
   cd server
   npm install
   ```

### Running the Application
There are now three available modes:

1. **Web (original)**

   To run the app in the browser with separate client and server:

   - Start the server:
     ```bash
     cd server
     npm start
     ```

   - Start the client:
     ```bash
     cd client
     npm start
     ```

   - Or start both with Docker:
     ```bash
     docker-compose up
     ```

2. **Electron (development)**

   Launch a desktop window that points at the React development server. The backend is started automatically.

   ```bash
   npm install          # ensure root deps are installed
   cd client && npm install
   cd server && npm install
   cd ..

   npm run electron:dev
   ```

   This sets `ELECTRON_START_URL` so the window loads `http://localhost:3000`.

3. **Electron (packaged)**

   Build both parts and create a distributable executable. On Windows it will produce an `.exe` installer.

   ```bash
   npm run dist
   ```

   Output is placed in `dist_electron/`.


## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.