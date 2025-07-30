const { app, BrowserWindow } = require('electron');
const path = require('path');

// This function creates the main application window.
const createWindow = () => {
  const win = new BrowserWindow({
    width: 405,  // 9:16 aspect ratio
    height: 720, // 9:16 aspect ratio
    autoHideMenuBar: true, // Hides the default menu bar (File, Edit, etc.)
    webPreferences: {
      // It's good practice to keep these settings for security
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Load your game's index.html file into the window.
  win.loadFile('index.html');
};

// This method is called once Electron is ready.
app.whenReady().then(() => {
  createWindow();

  // This is for macOS. It re-creates a window if the app
  // is activated and no other windows are open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// This quits the app when all windows are closed (for Windows & Linux).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});