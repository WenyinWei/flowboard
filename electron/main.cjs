const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const Ajv = require('ajv');

const isDev = process.env.VITE_DEV_SERVER === 'true';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // Warm up interpreter cache
  warmDetect();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Try a series of candidates (cmd + args) and return the first working command string
function detectVariants(variants) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= variants.length) return resolve(undefined);
      const v = variants[i++];
      const child = execFile(v.cmd, v.args || []);
      let settled = false;
      child.on('error', () => { if (!settled) { settled = true; tryNext(); } });
      child.on('exit', (code) => { if (!settled) { settled = true; code === 0 ? resolve(v.cmd) : tryNext(); } });
    };
    tryNext();
  });
}

function detect(cmds) {
  // Back-compat simple detector (cmds: string[])
  return detectVariants(cmds.map(c => ({ cmd: c, args: ['--version'] })));
}

ipcMain.handle('detect-interpreters', async () => {
  const isWin = process.platform === 'win32';
  // Prefer py launcher on Windows, then python/python3
  const py = isWin
    ? await detectVariants([
        { cmd: 'py', args: ['-3', '-V'] },
        { cmd: 'python', args: ['--version'] },
        { cmd: 'python3', args: ['--version'] }
      ])
    : await detect(['python3', 'python']);
  const jl = await detect(['julia']);
  return { python: py, julia: jl };
});

let interpCache = { python: undefined, julia: undefined };
async function warmDetect() {
  const isWin = process.platform === 'win32';
  interpCache.python = isWin
    ? await detectVariants([
        { cmd: 'py', args: ['-3', '-V'] },
        { cmd: 'python', args: ['--version'] },
        { cmd: 'python3', args: ['--version'] }
      ])
    : await detect(['python3', 'python']);
  interpCache.julia = await detect(['julia']);
}

ipcMain.handle('run-cell', async (evt, payload) => {
  const { language, code, params, interpreter } = payload || {};
  if (!language || !code) return { ok: false, error: 'Missing language or code' };
  const cmd = interpreter
    || interpCache[language]
    || (await (language === 'python'
          ? (process.platform==='win32' ? detectVariants([{ cmd:'py', args:['-3','-V'] },{ cmd:'python', args:['--version'] },{ cmd:'python3', args:['--version'] }]) : detect(['python3','python']))
          : detect(['julia'])));
  if (!cmd) return { ok: false, error: `No ${language} interpreter found` };

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowboard-'));
  const scriptPath = path.join(tempDir, language === 'python' ? 'cell.py' : 'cell.jl');
  const inputPath = path.join(tempDir, 'input.json');
  const outImg = path.join(tempDir, 'output.png');

  fs.writeFileSync(scriptPath, code, 'utf8');
  fs.writeFileSync(inputPath, JSON.stringify(params ?? {}), 'utf8');

  const env = { ...process.env, FLOWBOARD_INPUT: inputPath, FLOWBOARD_OUTPUT_IMAGE: outImg };

  const proc = spawn(cmd, [scriptPath], { env });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());

  const codeExit = await new Promise(resolve => proc.on('exit', resolve));
  const imageExists = fs.existsSync(outImg);
  return codeExit === 0
    ? { ok: true, stdout, imagePath: imageExists ? outImg : undefined }
    : { ok: false, error: stderr || `Process exited with code ${codeExit}`, stdout };
});

// Detect C++ compilers (best-effort): cl (MSVC), g++, clang++
ipcMain.handle('detect-compilers', async () => {
  const isWin = process.platform === 'win32';
  const found = { msvc: undefined, gxx: undefined, clangxx: undefined };
  // g++
  found.gxx = await detectVariants([{ cmd: 'g++', args: ['--version'] }]);
  // clang++
  found.clangxx = await detectVariants([{ cmd: 'clang++', args: ['--version'] }]);
  // MSVC cl: try a few flags; in non-DevPrompt environments this may fail, that's okay
  if (isWin) {
    found.msvc = await new Promise(resolve => {
      const child = execFile('cl', ['/Bv']);
      let settled = false;
      child.on('error', () => { if (!settled) { settled = true; resolve(undefined); } });
      child.on('exit', (code) => { if (!settled) { settled = true; resolve(code === 0 ? 'cl' : undefined); } });
    });
  }
  return found;
});

// Open provided code in the system default editor by writing a temp file and letting OS handle it
ipcMain.handle('open-in-editor', async (evt, payload) => {
  const { language, code, hintName } = payload || {};
  if (!code) return { ok: false, error: 'No code provided' };
  const ext = language === 'python' ? '.py' : language === 'julia' ? '.jl' : '.txt';
  const fileName = (hintName && typeof hintName === 'string' ? hintName.replace(/[^\w.-]/g, '_') : 'cell') + ext;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowboard-edit-'));
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, String(code), 'utf8');
  const res = await shell.openPath(filePath);
  if (res) return { ok: false, error: res };
  return { ok: true, path: filePath };
});

ipcMain.handle('save-workflow', async (evt, state) => {
  const res = await dialog.showSaveDialog({ filters: [{ name: 'Flow', extensions: ['flow'] }, { name: 'JSON', extensions: ['json'] }], defaultPath: 'workflow.flow' })
  if (res.canceled || !res.filePath) return { ok: false, error: 'canceled' }
  fs.writeFileSync(res.filePath, JSON.stringify(state, null, 2), 'utf8')
  return { ok: true, path: res.filePath }
})

ipcMain.handle('load-workflow', async () => {
  const res = await dialog.showOpenDialog({ filters: [{ name: 'Flow', extensions: ['flow','json'] }], properties: ['openFile'] })
  if (res.canceled || !res.filePaths?.[0]) return { ok: false, error: 'canceled' }
  const text = fs.readFileSync(res.filePaths[0], 'utf8')
  try {
    const data = JSON.parse(text)
    if (!data || typeof data !== 'object') throw new Error('Invalid file')
    // Validate against schema if available
    try {
      const schemaPath = path.join(__dirname, '..', 'src', 'flow.schema.json')
      if (fs.existsSync(schemaPath)) {
        const ajv = new Ajv({ allErrors: true })
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
        const validate = ajv.compile(schema)
        const valid = validate(data)
        if (!valid) throw new Error('Schema validation failed: ' + ajv.errorsText(validate.errors))
      }
    } catch (e) {
      // Fallback to light checks if schema unavailable or invalid
      const ok = data && data.id && data.name && Array.isArray(data.cells) && Array.isArray(data.links)
      if (!ok) throw e
    }
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: String(e?.message || e) }
  }
})
