import { defineStore } from 'pinia'

export type CellMode = 'node' | 'card' | 'visual'
export type CellType =
  | 'sum' | 'mean' | 'variance' | 'stddev'
  | 'sma' | 'ema'
  | 'ar1' | 'ou' | 'gbm'
  | 'power' | 'square' | 'cube'
  | 'sin' | 'cos' | 'tan' | 'brownian'
  | 'csv-source' | 'sql-source'
  | 'plotly' | 'echarts'
  | 'custom'
export type RunStatus = 'idle' | 'running' | 'success' | 'error' | 'warning'
export type Language = 'python' | 'julia'

export interface ModeRect { x: number; y: number; w: number; h: number }

export interface CellTheme {
  // minimal theme tokens, per card override
  name?: string
  background?: string
  foreground?: string
  accent?: string
  accent2?: string
  border?: string
}

export interface CellConfig {
  type: CellType
  language: Language
  code?: string
  params?: Record<string, number>
  theme?: CellTheme // optional per-cell theme
  interpreter?: string // optional per-cell interpreter path/command
}

export interface PortDef {
  id: string
  capacity?: number // only for inputs; default 1
}

export interface CellState {
  id: string
  label: string
  mode: CellMode
  rects: Record<CellMode, ModeRect> // cached rect per-mode
  config: CellConfig
  status: RunStatus
  startedAt?: number
  endedAt?: number
  lastDurationMs?: number
  lastWarning?: string
  lastError?: string
  lastResult?: any
  inputs?: PortDef[]
  outputs?: PortDef[]
}

export interface Link { from: { cellId: string; port: string }; to: { cellId: string; port: string } }

export interface WorkflowState {
  id: string
  name: string
  globalTheme: CellTheme
  language: Language
  runtimes?: { python?: string; julia?: string; compilers?: { msvc?: string; gxx?: string; clangxx?: string } }
  cells: CellState[]
  links: Link[]
  selectedCellId?: string
  selectedIds: string[]
}

function now() { return performance.now() }

export const useWorkflow = defineStore('workflow', {
  state: (): WorkflowState => ({
    id: 'wf-1',
    name: 'New Flow',
    language: 'python',
    globalTheme: {
      name: 'quant-cool',
      background: '#0c0f12',
      foreground: '#dfe6ef',
      accent: '#1f8fff',
      accent2: '#15bd66',
      border: '#2a2f38'
    },
  runtimes: {},
    cells: [],
  links: [],
  selectedCellId: undefined,
  selectedIds: []
  }),
  actions: {
    addCell(partial: Partial<CellState>) {
      const id = partial.id ?? `cell-${Math.random().toString(36).slice(2, 8)}`
      const base: CellState = {
        id,
        label: partial.label ?? id,
        mode: partial.mode ?? 'card',
        rects: partial.rects ?? {
          node: { x: 120, y: 120, w: 80, h: 80 },
          card: { x: 200, y: 160, w: 300, h: 180 },
          visual: { x: 560, y: 160, w: 480, h: 320 }
        },
        config: partial.config as CellConfig,
        status: 'idle'
      }
  // default ports: sources have no inputs; unary ops default to 1 input; plot adapters expect one input but no outputs
  const t = base.config.type
  const isSource = (t === 'csv-source' || t === 'sql-source')
  const isGenerator = (t === 'sin' || t === 'cos' || t === 'tan' || t === 'brownian' || t === 'ar1' || t === 'ou' || t === 'gbm')
  const isAdapter = (t === 'plotly' || t === 'echarts')
  base.inputs = partial.inputs ?? (isSource || isGenerator ? [] : [{ id: 'in', capacity: 1 }])
  base.outputs = partial.outputs ?? (isAdapter ? [] : [{ id: 'out' }])
      this.cells.push(base)
      return base.id
    },
    setSelected(cellId?: string) {
      this.selectedCellId = cellId
      this.selectedIds = cellId ? [cellId] : []
    },
    selectExclusive(cellId: string) {
      this.selectedCellId = cellId
      this.selectedIds = [cellId]
    },
    toggleSelected(cellId: string) {
      const i = this.selectedIds.indexOf(cellId)
      if (i >= 0) this.selectedIds.splice(i, 1)
      else this.selectedIds.push(cellId)
      this.selectedCellId = this.selectedIds[0]
    },
    clearSelection() {
      this.selectedIds = []
      this.selectedCellId = undefined
    },
    setSelectedMany(ids: string[]) {
      this.selectedIds = Array.from(new Set(ids))
      this.selectedCellId = this.selectedIds[0]
    },
    setMode(cellId: string, mode: CellMode) {
      const c = this.cells.find(c => c.id === cellId)
      if (c) c.mode = mode
    },
    setCellInterpreter(cellId: string, interpreter?: string) {
      const c = this.cells.find(c => c.id === cellId)
      if (c) c.config.interpreter = interpreter
    },
    setRuntimes(rt: WorkflowState['runtimes']) {
      this.runtimes = { ...(this.runtimes||{}), ...(rt||{}) }
    },
    setInterpreterForSelected(interpreter?: string) {
      for (const id of this.selectedIds) {
        const c = this.cells.find(x => x.id === id)
        if (c) c.config.interpreter = interpreter
      }
    },
    setRect(cellId: string, mode: CellMode, rect: ModeRect) {
      const c = this.cells.find(c => c.id === cellId)
      if (c) c.rects[mode] = rect
    },
    startRun(cellId: string) {
      const c = this.cells.find(c => c.id === cellId)
      if (!c) return
      c.status = 'running'
      c.startedAt = now()
      c.endedAt = undefined
      c.lastDurationMs = undefined
      c.lastError = undefined
      c.lastWarning = undefined
    },
    finishRun(cellId: string, status: RunStatus) {
      const c = this.cells.find(c => c.id === cellId)
      if (!c) return
      c.status = status
      c.endedAt = now()
      if (c.startedAt) c.lastDurationMs = c.endedAt - c.startedAt
    }
    ,
    addLink(link: Link) {
      // prevent duplicates
      if (!this.links.find(l => l.from.cellId===link.from.cellId && l.from.port===link.from.port && l.to.cellId===link.to.cellId && l.to.port===link.to.port))
        this.links.push(link)
    },
    removeLink(predicate: (l: Link) => boolean) {
      this.links = this.links.filter(l => !predicate(l))
    },
    removeLinksTo(targetCellId: string, targetPort: string) {
      this.links = this.links.filter(l => !(l.to.cellId===targetCellId && l.to.port===targetPort))
    },
    findLinkTo(targetCellId: string, targetPort: string) {
      return this.links.find(l => l.to.cellId===targetCellId && l.to.port===targetPort)
    }
    ,
    importState(s: WorkflowState) {
      this.id = s.id; this.name = s.name; this.language = s.language
      this.globalTheme = { ...s.globalTheme }
  this.runtimes = { ...(s.runtimes||{}) }
      this.cells = JSON.parse(JSON.stringify(s.cells))
      this.links = JSON.parse(JSON.stringify(s.links))
  this.selectedCellId = undefined
  this.selectedIds = []
    }
  }
})
