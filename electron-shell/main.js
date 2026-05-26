const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

let mainWindow;
let serverProcess;

const SERVER_PORT = 3001;

function getAppPath() {
  if (app.isPackaged) {
    // Build config places app/ contents under resources/app/app/
    return path.join(process.resourcesPath, 'app', 'app');
  }
  return path.join(__dirname, 'app');
}

// Find a usable node.exe on the system
function findNodePath() {
  // Common Windows node locations
  const candidates = [
    'node',
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
  ];

  for (const candidate of candidates) {
    try {
      execSync(`"${candidate}" --version`, { stdio: 'ignore', windowsHide: true });
      return candidate;
    } catch (_) {
      // try next
    }
  }
  return null;
}

function startServer() {
  const appPath = getAppPath();
  const serverEntry = path.join(appPath, 'dist-server', 'server', 'index.js');

  const nodePath = findNodePath();
  if (!nodePath) {
    dialog.showErrorBox(
      'Node.js Not Found',
      'Claude Code UI requires Node.js 18+ to be installed.\n\nPlease install Node.js from https://nodejs.org/ and restart the app.'
    );
    app.quit();
    return;
  }

  const env = {
    ...process.env,
    SERVER_PORT: String(SERVER_PORT),
    HOST: '127.0.0.1',
    DIST_PATH: path.join(appPath, 'dist'),
    VITE_IS_PLATFORM: 'true',
    VITE_CONTEXT_WINDOW: '160000',
    CONTEXT_WINDOW: '160000',
    NODE_PATH: path.join(appPath, 'node_modules'),
  };

  serverProcess = spawn(nodePath, [serverEntry], {
    cwd: appPath,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  serverProcess.stdout.on('data', (d) => console.log('[server]', d.toString().trim()));
  serverProcess.stderr.on('data', (d) => console.error('[server]', d.toString().trim()));
  serverProcess.on('exit', (code) => console.log('Server exited:', code));
}

function waitForServer(timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      if (Date.now() - start > timeout) return reject(new Error('Server timeout'));
      const req = http.get(`http://127.0.0.1:${SERVER_PORT}`, () => resolve());
      req.on('error', () => setTimeout(check, 500));
      req.end();
    }
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Claude Code UI',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${SERVER_PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', async () => {
  startServer();
  try {
    await waitForServer();
    createWindow();
  } catch (e) {
    console.error('Server failed to start:', e.message);
    dialog.showErrorBox(
      'Server Failed to Start',
      'The Claude Code UI server failed to start within 30 seconds.\n\nPlease check that Node.js is installed and try again.'
    );
    app.quit();
  }
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'], { windowsHide: true });
    } else {
      serverProcess.kill();
    }
  }
});
