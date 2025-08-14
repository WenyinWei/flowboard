const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let serverProcess = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the Vue development server in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    // and load the index.html of the app in production mode
    mainWindow.loadFile('dist/index.html');
  }

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Start the backend server as a separate process
const startBackendServer = () => {
  const serverPath = path.join(__dirname, 'src', 'backend', 'server.js');
  serverProcess = spawn('node', [serverPath], {
    stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, pipe stdout and stderr
    cwd: __dirname,
    detached: false // Don't detach the process
  });

  // Handle stdout
  serverProcess.stdout.on('data', (data) => {
    console.log(`[Backend Server] ${data}`);
  });

  // Handle stderr
  serverProcess.stderr.on('data', (data) => {
    console.error(`[Backend Server Error] ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Backend server process exited with code ${code}`);
  });

  serverProcess.on('error', (error) => {
    console.error('Failed to start backend server:', error);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Start the backend server
  startBackendServer();
  
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Close the backend server when the app is quit
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

// Handle gracefully shutting down the backend server
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.