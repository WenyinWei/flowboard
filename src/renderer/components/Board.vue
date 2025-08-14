<template>
  <div class="board" ref="boardRef" @mousedown="onBoardDown">
    <div class="toolbar">
      <label>Global Theme:
        <select v-model="globalName" @change="applyGlobalTheme">
          <option v-for="n in themeNames" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
  <button class="btn" @click="addPyDemo">New: Matplotlib sine</button>
  <button class="btn" @click="addPyScatter">New: Matplotlib scatter</button>
  <button class="btn" @click="addPyHist">New: Matplotlib hist</button>
      <button class="btn" @click="addJlDemo">New: Julia Plots example</button>
      <button class="btn" @click="runDownstream" :disabled="!wf.selectedCellId">Run downstream</button>
      <label class="rt">Interpreter:
        <select v-model="interpPick" @change="applyInterpreter" title="Set interpreter for selected cells">
          <option value="">auto</option>
          <option :value="wf.runtimes?.python" v-if="wf.runtimes?.python">python ({{ wf.runtimes?.python }})</option>
          <option :value="wf.runtimes?.julia" v-if="wf.runtimes?.julia">julia ({{ wf.runtimes?.julia }})</option>
        </select>
      </label>
      <span class="rollup" v-if="wf.selectedCellId">
        <span class="chip running">{{ rollup.running }}</span>
        <span class="chip success">{{ rollup.success }}</span>
        <span class="chip error">{{ rollup.error }}</span>
      </span>
  <button class="btn" @click="saveFlow">Save</button>
  <button class="btn" @click="loadFlow">Load</button>
  <span class="sep"></span>
  <button class="btn" title="Align Left" @click="align('left')">⟸</button>
  <button class="btn" title="Align Right" @click="align('right')">⟹</button>
  <button class="btn" title="Align Top" @click="align('top')">⟰</button>
  <button class="btn" title="Align Bottom" @click="align('bottom')">⟱</button>
  <button class="btn" title="Distribute Horizontally" @click="distribute('h')">⇔</button>
  <button class="btn" title="Distribute Vertically" @click="distribute('v')">⇕</button>
    </div>

    <!-- connection layer -->
  <svg class="links">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L8,4 L0,8 z" fill="#6aa2ff" />
        </marker>
      </defs>
      <g>
        <path v-for="(l,i) in wf.links" :key="i" :d="linkPath(l)" :class="{ dashed: isCrowded(l) }" marker-end="url(#arrow)" />
        <path v-if="dragLink" :d="tempLinkPath()" :class="['temp', { dashed: hoverTarget && hoverTarget.overCap }]" />
      </g>
    </svg>

    <!-- cells with inline ports -->
    <CellView
      v-for="c in wf.cells"
      :key="c.id+'v'"
      :cell="c"
      :theme="c.theme ?? wf.globalTheme"
  @run="(id) => { console.log('[renderer] Board received run for', id); runJustCell(id) }"
  @run-downstream="(id) => { console.log('[renderer] Board received run-downstream for', id); runSelfAndDownstream(id) }"
      @port-out-down="(portId, ev) => startLink(c.id, portId, ev)"
      @port-in-up="(portId) => endLink(c.id, portId)"
    />

    <!-- ghost cell while creating from dangling output -->
    <div v-if="ghost" class="ghost" :style="{ transform: `translate3d(${ghost.x}px, ${ghost.y}px, 0)` }">New cell…</div>
  <!-- marquee selection rectangle -->
  <div v-if="marquee" class="marquee" :style="marqueeStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { useWorkflow } from '../store/workflow'
import CellView from './CellView.vue'
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { runBuiltin } from '../engine/builtin'
import { Themes, ThemeNames as themeNames } from '../themes'

const wf = useWorkflow()
const boardRef = ref<HTMLDivElement|null>(null)
const viewW = window.innerWidth
const viewH = window.innerHeight
const interpPick = ref<string>('')
const linksTick = ref(0)
const marquee = ref<{ x:number;y:number;w:number;h:number }|null>(null)
const marqueeStart = ref<{ x:number;y:number }|null>(null)
const marqueeStyle = computed(() => marquee.value ? ({ left: marquee.value.x+'px', top: marquee.value.y+'px', width: marquee.value.w+'px', height: marquee.value.h+'px' }) : ({}))

onMounted(() => {
  if (wf.cells.length === 0) {
  // Seed initial cells: np.linspace -> sin(x) -> plot
  const codeLin = `
import math, numpy as np
N = 256 if 'N' not in globals() else N
start = 0.0 if 'start' not in globals() else start
stop = 2*math.pi if 'stop' not in globals() else stop
xs = np.linspace(start, stop, int(N))
{'x': xs}
`
  const idX = wf.addCell({ label: 'np.linspace 0..2π', config: { type: 'custom', language: 'python', code: codeLin, params: { N: 256, start: 0, stop: Math.PI*2 } } as any, rects: undefined })
  const cx = wf.cells.find(c=>c.id===idX); if (cx) { cx.inputs = []; cx.outputs = [{ id:'out' }] }

  const codeSin = `
import math
xs = x or []
freq = 1.0 if 'freq' not in globals() else freq
ys = [math.sin(freq*val) for val in xs]
{'x': xs, 'y': ys}
`
  const idSin = wf.addCell({ label: 'sin(x)', config: { type: 'custom', language: 'python', code: codeSin, params: { freq: 1 } } as any, rects: undefined })
  const cs = wf.cells.find(c=>c.id===idSin); if (cs) { cs.inputs = [{ id:'in', capacity: 1 }]; cs.outputs = [{ id:'out' }] }

  const codePlot = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.figure(figsize=(6,3))
if x and y:
  plt.plot(x, y)
  plt.title('sin(x) on (0, 2π)')
else:
  plt.text(0.5, 0.5, 'No data', ha='center', va='center')
# showing a figure is enough; framework will save it and show
plt.gcf()
`
  const idPlot = wf.addCell({ label: 'Plot sin(x)', config: { type: 'custom', language: 'python', code: codePlot, params: {} } as any, rects: undefined })
  wf.setMode(idPlot, 'visual')
  const cp = wf.cells.find(c=>c.id===idPlot); if (cp) { cp.inputs = [{ id:'in', capacity: 4 }]; cp.outputs = [] }

  wf.addLink({ from: { cellId: idX, port: 'out' }, to: { cellId: idSin, port: 'in' } })
  wf.addLink({ from: { cellId: idSin, port: 'out' }, to: { cellId: idPlot, port: 'in' } })
  // Initial run to show plot
  runWithDeps(idPlot)
  }
  const tick = () => { linksTick.value++ }
  window.addEventListener('cell-drag', tick as any)
  window.addEventListener('cell-moved', tick as any)
})
onBeforeUnmount(() => {
  const tick = () => { linksTick.value++ }
  window.removeEventListener('cell-drag', tick as any)
  window.removeEventListener('cell-moved', tick as any)
})

async function runCell(id: string, propagate = true) {
  console.log('[renderer] runCell enter', id)
  wf.startRun(id)
  const cell = wf.cells.find(c => c.id === id)
  if (!cell) return
  // Prefer interpreter route if custom code provided
  // @ts-ignore
  if (cell.config?.code && window.flowboard?.runCell) {
    try {
      // @ts-ignore
  const runtime = cell.config.interpreter || (cell.config.language==='python' ? wf.runtimes?.python : wf.runtimes?.julia)
      // @ts-ignore
  const editedPath = (cell.config.params as any)?._editedPath
  // Important: params lives inside a reactive store; pass a plain JSON clone to IPC to avoid structured-clone errors
  const paramsPlain = JSON.parse(JSON.stringify(cell.config.params || {}))
  console.log('[renderer] Run cell', id, 'type=', cell.config.type, 'lang=', cell.config.language, 'interp=', runtime, 'paramsKeys=', Object.keys(paramsPlain||{}))
  const res = await window.flowboard.runCell({ language: cell.config.language, code: cell.config.code, params: paramsPlain, interpreter: runtime, path: editedPath })
      if (res.ok) {
    console.log('[renderer] Run ok for', id, 'stdout bytes:', (res.stdout||'').length, 'image:', !!res.imagePath)
    // Normalize data: unwrap { value: ... } and lift x/y when present so downstream cells can consume them
    const d = res.data
    const unwrapped = (d && typeof d === 'object' && 'value' in d) ? (d as any).value : d
    let normalized: any
    if (Array.isArray(unwrapped)) normalized = { series: unwrapped }
    else if (unwrapped && typeof unwrapped === 'object' && ('x' in (unwrapped as any) || 'y' in (unwrapped as any))) normalized = { ...(unwrapped as any) }
    else normalized = (d || {})
    cell.lastResult = { ...normalized, stdout: res.stdout, imagePath: res.imagePath }
        if (res.warning) cell.lastWarning = res.warning
        wf.finishRun(id, res.warning ? 'warning' : 'success')
        if (propagate) await autoRunDownstream(id)
      } else {
        console.error('[renderer] Run failed for', id, res)
        cell.lastError = res.error
        wf.finishRun(id, 'error')
      }
    } catch (e:any) {
      console.error('[renderer] Run threw for', id, e)
      cell.lastError = String(e?.message ?? e)
      wf.finishRun(id, 'error')
    }
    return
  }
  // Built-in execution
  const out = runBuiltin(cell)
  if (out.ok) {
    cell.lastResult = out.data
    wf.finishRun(id, 'success')
  if (propagate) await autoRunDownstream(id)
  } else {
    cell.lastError = out.error
    wf.finishRun(id, 'error')
  }
}

// Simple DAG execution for the selected cell: run upstream dependencies first, then this cell.
async function runWithDeps(targetId: string) {
  const visited = new Set<string>()
  const order: string[] = []
  const incoming = (id: string) => wf.links.filter(l => l.to.cellId===id).map(l => l.from.cellId)
  function dfs(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    for (const u of incoming(id)) dfs(u)
    order.push(id)
  }
  dfs(targetId)
  for (const id of order) {
    const cell = wf.cells.find(c => c.id===id)
    if (!cell) continue
    // collect inputs from upstream .lastResult
  const insRaw = wf.links.filter(l => l.to.cellId===id).map(l => wf.cells.find(c => c.id===l.from.cellId)?.lastResult).filter(Boolean)
  // Ensure inputs are plain JSON (structured clonable) for downstream interpreter cells
  const ins = JSON.parse(JSON.stringify(insRaw))
    cell.config.params = { ...(cell.config.params||{}), inputs: ins }
    await runCell(id, false)
  }
}

// Helper: set inputs for a cell from existing upstream results (do not rerun upstream)
function setInputsForCell(id: string) {
  const cell = wf.cells.find(c => c.id===id)
  if (!cell) return
  const insRaw = wf.links.filter(l => l.to.cellId===id).map(l => wf.cells.find(c => c.id===l.from.cellId)?.lastResult).filter(Boolean)
  const ins = JSON.parse(JSON.stringify(insRaw))
  cell.config.params = { ...(cell.config.params||{}), inputs: ins }
}

// Run only this cell (using current upstream outputs as inputs), no deps, no downstream
async function runJustCell(id: string) {
  setInputsForCell(id)
  await runCell(id, false)
}

// Run this cell, then BFS downstream (no upstream deps)
async function runSelfAndDownstream(targetId: string) {
  setInputsForCell(targetId)
  await runCell(targetId, false)
  await autoRunDownstream(targetId)
}

// Auto-run downstream cells in BFS order starting from a cell
async function autoRunDownstream(startId: string) {
  const q: string[] = []
  const seen = new Set<string>([startId])
  // enqueue immediate downstream first
  for (const l of wf.links.filter(l => l.from.cellId===startId)) {
    if (!seen.has(l.to.cellId)) { seen.add(l.to.cellId); q.push(l.to.cellId) }
  }
  while (q.length) {
    const id = q.shift()!
    const cell = wf.cells.find(c => c.id===id)
    if (!cell) continue
  const insRaw = wf.links.filter(l => l.to.cellId===id).map(l => wf.cells.find(c => c.id===l.from.cellId)?.lastResult).filter(Boolean)
  const ins = JSON.parse(JSON.stringify(insRaw))
  cell.config.params = { ...(cell.config.params||{}), inputs: ins }
    await runCell(id, false)
    // enqueue further downstream
    for (const l of wf.links.filter(l => l.from.cellId===id)) {
      if (!seen.has(l.to.cellId)) { seen.add(l.to.cellId); q.push(l.to.cellId) }
    }
  }
}

function addPyDemo() {
  const code = `
import os, json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

params = {}
inp = os.environ.get('FLOWBOARD_INPUT')
if inp and os.path.exists(inp):
    with open(inp,'r') as f:
        params = json.load(f)

import math
xs = [i/100.0 for i in range(0, 628)]
ys = [math.sin(x*(params.get('freq',1))) for x in xs]
plt.figure(figsize=(6,3))
plt.plot(xs, ys)
plt.title('Matplotlib Sine')
out = os.environ.get('FLOWBOARD_OUTPUT_IMAGE') or 'output.png'
plt.savefig(out, dpi=120, bbox_inches='tight')
print('saved:', out)
`
  const id = wf.addCell({ label: 'Py Matplotlib', config: { type: 'custom', language: 'python', code, params: { freq: 2 } } as any, rects: undefined })
  wf.setMode(id, 'visual')
}

function addPyScatter() {
  const code = `
import os, json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import random

params = {}
inp = os.environ.get('FLOWBOARD_INPUT')
if inp and os.path.exists(inp):
    with open(inp,'r') as f:
        params = json.load(f)

n = int(params.get('n', 200))
x = [random.random() for _ in range(n)]
y = [random.random() for _ in range(n)]
plt.figure(figsize=(6,3))
plt.scatter(x, y, s=12, alpha=0.7)
plt.title('Matplotlib Scatter')
out = os.environ.get('FLOWBOARD_OUTPUT_IMAGE') or 'output.png'
plt.savefig(out, dpi=120, bbox_inches='tight')
print('saved:', out)
`
  const id = wf.addCell({ label: 'Py Scatter', config: { type: 'custom', language: 'python', code, params: { n: 300 } } as any, rects: undefined })
  wf.setMode(id, 'visual')
}

function addPyHist() {
  const code = `
import os, json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import random

params = {}
inp = os.environ.get('FLOWBOARD_INPUT')
if inp and os.path.exists(inp):
    with open(inp,'r') as f:
        params = json.load(f)

n = int(params.get('n', 1000))
data = [random.gauss(0,1) for _ in range(n)]
bins = int(params.get('bins', 30))
plt.figure(figsize=(6,3))
plt.hist(data, bins=bins, alpha=0.8)
plt.title('Matplotlib Histogram')
out = os.environ.get('FLOWBOARD_OUTPUT_IMAGE') or 'output.png'
plt.savefig(out, dpi=120, bbox_inches='tight')
print('saved:', out)
`
  const id = wf.addCell({ label: 'Py Histogram', config: { type: 'custom', language: 'python', code, params: { n: 1000, bins: 30 } } as any, rects: undefined })
  wf.setMode(id, 'visual')
}

function addJlDemo() {
  const code = `
using JSON
using Plots
ENV["GKSwstype"] = "100" # headless

params = Dict{String,Any}()
inp = get(ENV, "FLOWBOARD_INPUT", "")
if inp != "" && isfile(inp)
  params = JSON.parse(read(inp, String))
end

freq = haskey(params, "freq") ? params["freq"] : 1
xs = collect(0:0.01:2*pi)
ys = sin.(xs .* freq)
plot(xs, ys, title="Julia Plots Sine", legend=false, size=(600,300))
out = get(ENV, "FLOWBOARD_OUTPUT_IMAGE", "output.png")
savefig(out)
println("saved: "*out)
`
  const id = wf.addCell({ label: 'JL Plots', config: { type: 'custom', language: 'julia', code, params: { freq: 3 } } as any, rects: undefined })
  wf.setMode(id, 'card')
}

const globalName = ref(wf.globalTheme.name ?? 'quant-cool')
function applyGlobalTheme() {
  const t = Themes[globalName.value]
  if (t) wf.globalTheme = { ...t }
}
function applyInterpreter() {
  const val = interpPick.value || undefined
  wf.setInterpreterForSelected(val)
}

function rectsOfSelected() {
  return wf.selectedIds.map(id => {
    const c = wf.cells.find(x=>x.id===id)
    if (!c) return null
    const r = c.rects[c.mode]
    return { id, r, mode: c.mode }
  }).filter(Boolean) as Array<{id:string;r:{x:number;y:number;w:number;h:number};mode:string}>
}

function align(kind: 'left'|'right'|'top'|'bottom') {
  const items = rectsOfSelected(); if (items.length < 2) return
  if (kind==='left') {
    const x = Math.min(...items.map(i=>i.r.x))
    for (const i of items) wf.setRect(i.id, i.mode as any, { ...i.r, x })
  } else if (kind==='right') {
    const right = Math.max(...items.map(i=>i.r.x + i.r.w))
    for (const i of items) wf.setRect(i.id, i.mode as any, { ...i.r, x: right - i.r.w })
  } else if (kind==='top') {
    const y = Math.min(...items.map(i=>i.r.y))
    for (const i of items) wf.setRect(i.id, i.mode as any, { ...i.r, y })
  } else if (kind==='bottom') {
    const bottom = Math.max(...items.map(i=>i.r.y + i.r.h))
    for (const i of items) wf.setRect(i.id, i.mode as any, { ...i.r, y: bottom - i.r.h })
  }
  linksTick.value++
}

function distribute(axis: 'h'|'v') {
  const items = rectsOfSelected(); if (items.length < 3) return
  if (axis==='h') {
    const sorted = items.slice().sort((a,b)=>a.r.x-b.r.x)
    const left = sorted[0].r.x
    const right = Math.max(...sorted.map(i=>i.r.x + i.r.w))
    const span = right - left
    const gaps = sorted.length - 1
    if (span <= 0) return
    for (let idx=0; idx<sorted.length; idx++) {
      const i = sorted[idx]
      const t = gaps>0? (idx/gaps) : 0
      const x = Math.round(left + t * (span - i.r.w))
      wf.setRect(i.id, i.mode as any, { ...i.r, x })
    }
  } else {
    const sorted = items.slice().sort((a,b)=>a.r.y-b.r.y)
    const top = sorted[0].r.y
    const bottom = Math.max(...sorted.map(i=>i.r.y + i.r.h))
    const span = bottom - top
    const gaps = sorted.length - 1
    if (span <= 0) return
    for (let idx=0; idx<sorted.length; idx++) {
      const i = sorted[idx]
      const t = gaps>0? (idx/gaps) : 0
      const y = Math.round(top + t * (span - i.r.h))
      wf.setRect(i.id, i.mode as any, { ...i.r, y })
    }
  }
  linksTick.value++
}

// --- Ports and linking ---
type DragLink = { from: { cellId: string; port: string }, to?: { x: number; y: number } }
const dragLink = ref<DragLink | null>(null)
const ghost = ref<{ x: number; y: number } | null>(null)
const hoverTarget = ref<{ cellId: string; port: string; overCap: boolean } | null>(null)

function cellEl(cId: string) {
  return document.querySelector(`[data-cell-id='${cId}']`) as HTMLElement | null
}
function boardRect() {
  const el = boardRef.value
  if (!el) return { left: 0, top: 0 }
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top }
}

function portPoint(cellId: string, type: 'in'|'out') {
  const el = cellEl(cellId)
  if (!el) return { x: 0, y: 0 }
  const br = boardRect()
  // Prefer the actual port handle center
  const port = el.querySelector(`.port.${type}`) as HTMLElement | null
  if (port) {
    const pr = port.getBoundingClientRect()
    return { x: pr.left + pr.width/2 - br.left, y: pr.top + pr.height/2 - br.top }
  }
  const r = el.getBoundingClientRect()
  const px = type === 'out' ? r.right : r.left
  const py = r.top + r.height/2
  return { x: px - br.left, y: py - br.top }
}

function linkPath(l: { from: {cellId:string; port:string}; to: {cellId:string; port:string} }) {
  // reference linksTick to trigger recompute on cell move
  void linksTick.value
  const a = portPoint(l.from.cellId, 'out')
  const b = portPoint(l.to.cellId, 'in')
  const dx = Math.max(40, (b.x - a.x)/2)
  return `M ${a.x},${a.y} C ${a.x+dx},${a.y} ${b.x-dx},${b.y} ${b.x},${b.y}`
}

function tempLinkPath() {
  if (!dragLink.value) return ''
  const a = portPoint(dragLink.value.from.cellId, 'out')
  const b = dragLink.value.to ?? { x: a.x, y: a.y }
  const dx = Math.max(40, (b.x - a.x)/2)
  return `M ${a.x},${a.y} C ${a.x+dx},${a.y} ${b.x-dx},${b.y} ${b.x},${b.y}`
}

function isCrowded(l: {to:{cellId:string; port:string}}) {
  const existing = wf.links.filter(x => x.to.cellId===l.to.cellId && x.to.port===l.to.port)
  const target = wf.cells.find(c => c.id===l.to.cellId)
  const cap = target?.inputs?.find(p=>p.id===l.to.port)?.capacity ?? 1
  return existing.length > cap
}

function startLink(cellId: string, portId: string, e: MouseEvent) {
  const br = boardRect()
  const x = e.clientX - br.left, y = e.clientY - br.top
  dragLink.value = { from: { cellId, port: portId }, to: { x, y } }
  ghost.value = { x: x + 16, y: y + 16 }
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('mouseup', onDragEnd, { once: true })
}
function onDragging(e: MouseEvent) {
  if (!dragLink.value) return
  const br = boardRect()
  const x = e.clientX - br.left, y = e.clientY - br.top
  dragLink.value.to = { x, y }
  ghost.value = { x: x + 16, y: y + 16 }
  const snap = nearestInput({ x, y })
  if (snap && snap.dist < 40*40) {
    const cap = (wf.cells.find(c=>c.id===snap.cellId)?.inputs?.find(p=>p.id===snap.port)?.capacity) ?? 1
    const cur = wf.links.filter(l => l.to.cellId===snap.cellId && l.to.port===snap.port)
    hoverTarget.value = { cellId: snap.cellId, port: snap.port, overCap: cur.length >= cap }
  } else hoverTarget.value = null
}
function onDragEnd() {
  if (!dragLink.value) return
  // Drop in empty space => create a new cell and link
  const target = snapToInput(dragLink.value.to!)
  if (!target) {
    const id = wf.addCell({ label: 'New', config: { type: 'custom', language: wf.language, params: {} }, rects: undefined })
    wf.addLink({ from: dragLink.value.from, to: { cellId: id, port: 'in' } })
  }
  dragLink.value = null
  ghost.value = null
  hoverTarget.value = null
  window.removeEventListener('mousemove', onDragging)
}

function nearestInput(pos: {x:number;y:number}) {
  let best: { cellId: string; port: string; dist: number } | null = null
  for (const c of wf.cells) {
    for (const p of c.inputs ?? []) {
      const pt = portPoint(c.id, 'in')
      const dx = pt.x - pos.x, dy = pt.y - pos.y
      const d2 = dx*dx + dy*dy
      if (!best || d2 < best.dist) best = { cellId: c.id, port: p.id, dist: d2 }
    }
  }
  return best
}

function snapToInput(pos: {x:number;y:number}) {
  const best = nearestInput(pos)
  if (best && best.dist < 40*40) {
    // enforce capacity; show dashed while over-cap
    const cap = (wf.cells.find(c=>c.id===best!.cellId)?.inputs?.find(p=>p.id===best!.port)?.capacity) ?? 1
    const cur = wf.links.filter(l => l.to.cellId===best!.cellId && l.to.port===best!.port)
    if (cur.length >= cap) {
      // remove the oldest link (simulate eject) and add dashed UI by class; here we just remove
      const removed = cur[0]
      wf.removeLink(l => l === removed)
    }
    wf.addLink({ from: dragLink.value!.from, to: { cellId: best.cellId, port: best.port } })
    return best
  }
  return null
}

function endLink(targetCellId: string, targetPort: string) {
  if (!dragLink.value) return
  const target = { cellId: targetCellId, port: targetPort }
  const cap = wf.cells.find(c=>c.id===targetCellId)?.inputs?.find(p=>p.id===targetPort)?.capacity ?? 1
  const cur = wf.links.filter(l => l.to.cellId===targetCellId && l.to.port===targetPort)
  if (cur.length >= cap) {
    // eject oldest
    wf.removeLink(l => l === cur[0])
  }
  wf.addLink({ from: dragLink.value.from, to: target })
  dragLink.value = null
  ghost.value = null
  hoverTarget.value = null
  window.removeEventListener('mousemove', onDragging)
}

function onBoardDown(e: MouseEvent) {
  // cancel link if clicked empty
  if (dragLink.value) {
    dragLink.value = null
    ghost.value = null
    window.removeEventListener('mousemove', onDragging)
  }
  // start marquee if clicking on empty board area
  const target = e.target as HTMLElement
  const isCell = !!target.closest?.('.cell')
  const isPort = !!target.closest?.('.port')
  if (isCell || isPort) return
  const br = boardRect()
  const sx = e.clientX - br.left
  const sy = e.clientY - br.top
  marqueeStart.value = { x: sx, y: sy }
  marquee.value = { x: sx, y: sy, w: 0, h: 0 }
  const onMove = (ev: MouseEvent) => {
    const x = ev.clientX - br.left
    const y = ev.clientY - br.top
    const x0 = marqueeStart.value!.x, y0 = marqueeStart.value!.y
    const rx = Math.min(x0, x), ry = Math.min(y0, y)
    const rw = Math.abs(x - x0), rh = Math.abs(y - y0)
    marquee.value = { x: rx, y: ry, w: rw, h: rh }
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    if (!marquee.value) return
    const box = marquee.value
    // select cells whose rect intersects box (current mode)
    const ids: string[] = []
    for (const c of wf.cells) {
      const r = c.rects[c.mode]
      const ix = !(r.x > box.x+box.w || r.x+r.w < box.x)
      const iy = !(r.y > box.y+box.h || r.y+r.h < box.y)
      if (ix && iy) ids.push(c.id)
    }
    wf.setSelectedMany(ids)
    marquee.value = null
    marqueeStart.value = null
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp, { once: true })
}

function cellTransform(c: any) {
  const r = c.rects[c.mode]
  return { transform: `translate3d(${r.x}px, ${r.y}px, 0)`, width: r.w+'px', height: r.h+'px' }
}

async function saveFlow() {
  // @ts-ignore
  if (!window.flowboard?.saveWorkflow) return
  const state = { id: wf.id, name: wf.name, version: 1, language: wf.language, globalTheme: wf.globalTheme, cells: wf.cells, links: wf.links }
  // Pass a plain JSON copy to avoid sending reactive proxies over IPC
  const plain = JSON.parse(JSON.stringify(state))
  // @ts-ignore
  await window.flowboard.saveWorkflow(plain)
}

async function loadFlow() {
  // @ts-ignore
  if (!window.flowboard?.loadWorkflow) return
  // @ts-ignore
  const res = await window.flowboard.loadWorkflow()
  if (res?.ok && res.data) {
    wf.importState(res.data)
  }
}

// Roll-up status for downstream nodes of selection
const rollup = computed(() => {
  const start = wf.selectedCellId
  const res = { running: 0, success: 0, error: 0 }
  if (!start) return res
  const q: string[] = [start]
  const seen = new Set<string>([start])
  while (q.length) {
    const id = q.shift()!
    const c = wf.cells.find(x => x.id===id)
    if (c) {
      if (c.status==='running') res.running++
      else if (c.status==='success') res.success++
      else if (c.status==='error') res.error++
    }
    const outs = wf.links.filter(l => l.from.cellId===id).map(l => l.to.cellId)
    for (const v of outs) if (!seen.has(v)) { seen.add(v); q.push(v) }
  }
  return res
})

// Run downstream BFS from the selected cell
async function runDownstream() {
  const start = wf.selectedCellId
  if (!start) return
  const q: string[] = [start]
  const seen = new Set<string>([start])
  const order: string[] = []
  while (q.length) {
    const id = q.shift()!
    order.push(id)
    const outs = wf.links.filter(l => l.from.cellId===id).map(l => l.to.cellId)
    for (const v of outs) if (!seen.has(v)) { seen.add(v); q.push(v) }
  }
  for (const id of order) {
    const cell = wf.cells.find(c => c.id===id)
    if (!cell) continue
  const insRaw = wf.links.filter(l => l.to.cellId===id).map(l => wf.cells.find(c => c.id===l.from.cellId)?.lastResult).filter(Boolean)
  const ins = JSON.parse(JSON.stringify(insRaw))
  cell.config.params = { ...(cell.config.params||{}), inputs: ins }
    await runCell(id)
  }
}
</script>

<style scoped>
.board { position: relative; height: calc(100vh - 90px); background: radial-gradient(600px 300px at 30% 10%, rgba(50,80,120,0.12), transparent), #0b0e12; }
.toolbar { position: sticky; top: 0; z-index: 3; backdrop-filter: blur(6px); background: rgba(10,12,16,0.55); color: #dfe6ef; padding: 6px; border-bottom: 1px solid #232931; }
.links { position: absolute; inset: 0; pointer-events: none; width: 100%; height: 100%; overflow: visible; }
.links path { stroke: #6aa2ff; stroke-width: 2; fill: none; }
.links path.dashed { stroke-dasharray: 6 6; opacity: 0.7 }
.links path.temp { stroke: #9ad8ff; stroke-width: 1.5; opacity: 0.8 }
.links path:hover { filter: drop-shadow(0 0 4px #9ad8ff) }
.btn { margin-left: 8px; padding: 2px 8px; border: 1px solid #2b3340; border-radius: 6px; background: rgba(0,0,0,0.3); color: #e1e7f0; cursor: pointer; }
.sep { display: inline-block; width: 10px; }
.ghost { position: absolute; padding: 4px 8px; border: 1px dashed #6aa2ff; color: #6aa2ff; border-radius: 8px; background: rgba(0,0,0,0.2); pointer-events: none; }
.rollup { margin-left: 8px; display: inline-flex; gap: 6px; align-items: center; }
.chip { display: inline-block; min-width: 20px; text-align: center; padding: 1px 6px; border-radius: 999px; border: 1px solid #2b3340; font-size: 12px; }
.chip.running { border-color: #3498db; color: #3498db }
.chip.success { border-color: #2ecc71; color: #2ecc71 }
.chip.error { border-color: #e74c3c; color: #e74c3c }
.marquee { position: absolute; pointer-events: none; border: 1px dashed #5ec8ff; background: rgba(94,200,255,0.1); }
</style>
