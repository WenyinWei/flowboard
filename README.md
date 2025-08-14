# FlowBoard

A cross-platform workflow dashboard (Electron + Vue + Vite) prototype with an ultra-low-latency drag demo.

## Dev

1. Install dependencies
2. Run Vite dev server and launch Electron

```powershell
npm install
# in one terminal
npm run dev
# in another terminal
$env:VITE_DEV_SERVER='true'; npm run start
```

Or use a single step if you wire concurrently.

## Build

```powershell
npm run build
```

Then start Electron against dist:

```powershell
npm run start
```

## Notes
- Drag demo bypasses Vue reactivity for pointer move, writes CSS transform under requestAnimationFrame, and commits position only on mouseup.
- Node styled with will-change: transform for GPU compositing.
