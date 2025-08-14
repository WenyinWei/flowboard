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
  preload: path.join(__dirname, 'preload.cjs'),
  webSecurity: !isDev,
  allowRunningInsecureContent: isDev
    }
  });

  // Forward renderer console to main console for easier debugging
  try {
    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const lvl = ['log','warn','error','debug','info'][level] || String(level)
      console.log(`[renderer:${lvl}] ${message} (${sourceId}:${line})`)
    })
  } catch {}

  if (isDev) {
  console.log('[main] Dev mode, loading Vite dev server at http://localhost:5173');
  win.loadURL('http://localhost:5173');
  win.webContents.openDevTools({ mode: 'detach' });
  } else {
  const file = path.join(__dirname, '..', 'dist', 'index.html');
  console.log('[main] Prod mode, loading file://', file);
  win.loadFile(file);
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
  const res = { python: py, julia: jl };
  console.log('[main] detect-interpreters =>', res);
  return res;
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
  let { language, code, params, interpreter, path: codePath } = payload || {};
  console.log('[main] run-cell invoked with:', {
    language,
    codeLen: code ? String(code).length : 0,
    paramsKeys: params && typeof params === 'object' ? Object.keys(params) : undefined,
    interpreter,
    codePath
  });
  if (codePath && fs.existsSync(codePath)) {
    try { code = fs.readFileSync(codePath, 'utf8') } catch {}
  }
  if (!language || !code) return { ok: false, error: 'Missing language or code' };
  const cmd = interpreter
    || interpCache[language]
    || (await (language === 'python'
          ? (process.platform==='win32' ? detectVariants([{ cmd:'py', args:['-3','-V'] },{ cmd:'python', args:['--version'] },{ cmd:'python3', args:['--version'] }]) : detect(['python3','python']))
          : detect(['julia'])));
  if (!cmd) {
    console.error('[main] No interpreter found for', language);
    return { ok: false, error: `No ${language} interpreter found` };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flowboard-'));
  const scriptPath = path.join(tempDir, language === 'python' ? 'cell.py' : 'cell.jl');
  const inputPath = path.join(tempDir, 'input.json');
  const outImg = path.join(tempDir, 'output.png');
  const outJson = path.join(tempDir, 'output.json');

  if (language === 'python') {
  const userPath = path.join(tempDir, 'user.py');
  fs.writeFileSync(userPath, code, 'utf8');
  const wrapper = `
import os, sys, json

# Load params/inputs
params = {}
inputs = []
try:
  inp = os.environ.get('FLOWBOARD_INPUT')
  if inp and os.path.exists(inp):
    with open(inp, 'r', encoding='utf-8') as f:
      params = json.load(f)
  if isinstance(params, dict):
    inputs = params.get('inputs', []) or []
except Exception:
  params = {}
  inputs = []

# Convenience: bind x/y from inputs
x = None
y = None
try:
  if isinstance(inputs, list):
    for it in inputs:
      if isinstance(it, dict):
        if x is None and 'x' in it:
          x = it['x']
        if y is None and 'y' in it:
          y = it['y']
        if 'value' in it:
          if x is None and isinstance(it['value'], list):
            x = it['value']
          elif y is None and isinstance(it['value'], list):
            y = it['value']
      elif isinstance(it, list):
        if x is None:
          x = it
        elif y is None:
          y = it
except Exception:
  pass

__flow_locals__ = { 'params': params, 'inputs': inputs, 'x': x, 'y': y }

code_path = ` + JSON.stringify(path.join(tempDir, 'user.py')) + `
with open(code_path, 'r', encoding='utf-8') as f:
  __src__ = f.read()

_last_expr_value = None
_suppress = False
try:
  import ast
  # Try to enable rich-colored tracebacks with locals
  try:
    import rich.traceback as _rt
    _rt.install(show_locals=True, width=120)
  except Exception:
    pass
  # Promote simple params as top-level variables (int/float/bool/str)
  try:
    if isinstance(params, dict):
      for __k, __v in params.items():
        if isinstance(__v, (int, float, bool, str)):
          __flow_locals__[__k] = __v
  except Exception:
    pass
  _lines = [ln.rstrip() for ln in __src__.splitlines() if ln.strip()!='']
  if _lines and _lines[-1].endswith(';'):
    _suppress = True
  mod = ast.parse(__src__, mode='exec')
  if getattr(mod, 'body', None) and isinstance(mod.body[-1], ast.Expr) and not _suppress:
    last = ast.Expression(mod.body[-1].value)
    exec(compile(ast.Module(mod.body[:-1], type_ignores=[]), '<flowboard>', 'exec'), __flow_locals__)
    _last_expr_value = eval(compile(last, '<flowboard>', 'eval'), __flow_locals__)
  else:
    exec(compile(mod, '<flowboard>', 'exec'), __flow_locals__)
except SystemExit as e:
  raise
except Exception as e:
  try:
    from rich.console import Console as _Console
    _Console().print_exception(show_locals=True, width=120)
  except Exception:
    import traceback
    traceback.print_exc()
  sys.exit(1)

# Save matplotlib figure if any
try:
  out_img = os.environ.get('FLOWBOARD_OUTPUT_IMAGE')
  import matplotlib
  matplotlib.use('Agg')
  import matplotlib.pyplot as plt
  if plt.get_fignums() and out_img:
    plt.savefig(out_img, dpi=120, bbox_inches='tight')
except Exception:
  pass

# Write JSON output for last expression value (or x/y fallback)
try:
  out_json = os.environ.get('FLOWBOARD_OUTPUT_JSON')
  if out_json and not _suppress:
    payload = _last_expr_value
    # Fallback: if no last expr, but x/y present, emit them
    if payload is None:
      try:
        _x = __flow_locals__.get('x'); _y = __flow_locals__.get('y')
        if _x is not None or _y is not None:
          payload = { 'x': _x, 'y': _y }
      except Exception:
        pass
    def _default(o):
      try:
        import numpy as _np
        if isinstance(o, _np.ndarray):
          return o.tolist()
      except Exception:
        pass
      try:
        import pandas as _pd
        if isinstance(o, (_pd.Series, _pd.DataFrame)):
          return o.to_dict(orient='list') if isinstance(o, _pd.DataFrame) else o.tolist()
      except Exception:
        pass
      if hasattr(o, 'tolist'):
        try:
          return o.tolist()
        except Exception:
          pass
      return str(o)
    with open(out_json, 'w', encoding='utf-8') as f:
      json.dump({ 'value': payload }, f, default=_default)
except Exception:
  pass
`
  fs.writeFileSync(scriptPath, wrapper, 'utf8');
  } else {
  fs.writeFileSync(scriptPath, code, 'utf8');
  }
  fs.writeFileSync(inputPath, JSON.stringify(params ?? {}), 'utf8');

  const env = { ...process.env, FLOWBOARD_INPUT: inputPath, FLOWBOARD_OUTPUT_IMAGE: outImg, FLOWBOARD_OUTPUT_JSON: outJson, PYTHONIOENCODING: 'utf-8', TERM: 'xterm-256color', RICH_FORCE_TERMINAL: '1', PY_COLORS: '1' };

  console.log('[main] Spawning', cmd, 'with script:', scriptPath);
  const args = (process.platform === 'win32' && cmd === 'py') ? ['-3', scriptPath] : [scriptPath]
  const proc = spawn(cmd, args, { env });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());
  proc.on('error', (err) => {
    console.error('[main] Spawn error:', err?.message || err);
  });

  const codeExit = await new Promise(resolve => proc.on('exit', resolve));
  console.log('[main] Process exit code:', codeExit, 'stdout bytes:', stdout.length, 'stderr bytes:', stderr.length);
  const imageExists = fs.existsSync(outImg);
  let data;
  try {
    if (fs.existsSync(outJson)) {
      const txt = fs.readFileSync(outJson, 'utf8');
      data = JSON.parse(txt);
    }
  } catch (e) {
    // ignore JSON errors; user script may not have produced JSON
  }
  if (codeExit === 0) {
    const res = { ok: true, stdout, imagePath: imageExists ? outImg : undefined, data };
    if (stderr && stderr.trim()) res.warning = stderr;
    return res;
  }
  return { ok: false, error: stderr || `Process exited with code ${codeExit}`, stdout };
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
  const { language, code, hintName, path: existingPath } = payload || {};
  if (existingPath && fs.existsSync(existingPath)) {
    const resOpen = await shell.openPath(existingPath);
    if (resOpen) return { ok: false, error: resOpen };
    return { ok: true, path: existingPath };
  }
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
