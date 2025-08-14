import type { CellState } from '../store/workflow'

export type ExecResult = { ok: true; data: any } | { ok: false; error: string; warning?: string }

export function runBuiltin(cell: CellState): ExecResult {
  try {
    const p: any = cell.config.params ?? {}
    switch (cell.config.type) {
  case 'sum': return { ok: true, data: sum(fromValuesOrInputs(p)) }
  case 'mean': return { ok: true, data: mean(fromValuesOrInputs(p)) }
  case 'variance': return { ok: true, data: variance(fromValuesOrInputs(p)) }
      case 'stddev': return { ok: true, data: Math.sqrt(variance(fromValuesOrInputs(p))) }
      case 'sma': return { ok: true, data: { series: sma(asNumArray(p.values) || fromFirstSeries(p.inputs), p.window ?? 20) } }
      case 'ema': return { ok: true, data: { series: ema(asNumArray(p.values) || fromFirstSeries(p.inputs), p.window ?? 20) } }
      case 'ar1': return { ok: true, data: { series: ar1(p.n ?? 500, p.phi ?? 0.9, p.sigma ?? 1) } }
      case 'ou': return { ok: true, data: { series: ou(p.n ?? 500, p.theta ?? 1.0, p.mu ?? 0, p.sigma ?? 1, p.dt ?? 1/252) } }
      case 'gbm': return { ok: true, data: { series: gbm(p.n ?? 500, p.mu ?? 0.05, p.sigma ?? 0.2, p.dt ?? 1/252, p.s0 ?? 1.0) } }
      case 'square': return { ok: true, data: powerVal(p.x ?? 0, 2) }
      case 'cube': return { ok: true, data: powerVal(p.x ?? 0, 3) }
      case 'power': return { ok: true, data: powerVal(p.x ?? 0, p.n ?? 2) }
      case 'sin': return { ok: true, data: sampleFn(Math.sin, p) }
      case 'cos': return { ok: true, data: sampleFn(Math.cos, p) }
      case 'tan': return { ok: true, data: sampleFn(Math.tan, p) }
      case 'brownian': return { ok: true, data: brownian(p.steps ?? 1000, p.dt ?? 1/252, p.sigma ?? 1) }
      case 'csv-source': return { ok: true, data: csvSource(p) }
      case 'sql-source': return { ok: true, data: sqlSource(p) }
      case 'plotly': return { ok: true, data: { passthrough: true, lib: 'plotly', series: fromFirstSeries(p.inputs) } }
      case 'echarts': return { ok: true, data: { passthrough: true, lib: 'echarts', series: fromFirstSeries(p.inputs) } }
      default:
        return { ok: false, error: `Unsupported builtin type: ${cell.config.type}` }
    }
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) }
  }
}

function sum(arr: number[]) { return arr.reduce((a,b)=>a+b,0) }
function mean(arr: number[]) { return arr.length ? sum(arr)/arr.length : 0 }
function variance(arr: number[]) {
  const m = mean(arr)
  return arr.length ? arr.reduce((acc,x)=>acc+(x-m)*(x-m),0)/arr.length : 0
}
function powerVal(x: number, n: number) { return Math.pow(x, n) }

function asNumArray(v: any): number[] {
  if (Array.isArray(v)) return v.map(Number).filter(n => Number.isFinite(n))
  if (typeof v === 'number') return [v]
  return []
}

function fromValuesOrInputs(p: any): number[] {
  const v = asNumArray(p.values)
  if (v.length) return v
  const inp = p.inputs
  if (!inp) return []
  // Accept: number[], number[][], [{series:number[]}|number]
  const flat: number[] = []
  if (Array.isArray(inp)) {
    for (const it of inp) {
      if (Array.isArray(it)) flat.push(...asNumArray(it))
      else if (typeof it === 'number') flat.push(it)
      else if (it && Array.isArray(it.series)) flat.push(...asNumArray(it.series))
    }
  }
  return flat
}

function fromFirstSeries(inp: any): number[] {
  if (!inp) return []
  if (Array.isArray(inp)) {
    for (const it of inp) {
      if (Array.isArray(it)) return asNumArray(it)
      if (it && Array.isArray(it.series)) return asNumArray(it.series)
    }
  }
  return []
}

function sampleFn(fn: (x:number)=>number, p: any) {
  const n = Math.max(2, Math.floor(p.samples ?? 256))
  const freq = p.freq ?? 1
  const out = new Array(n)
  for (let i=0;i<n;i++) {
    const t = i/n * 2*Math.PI * freq
    out[i] = fn(t)
  }
  return { series: out }
}

// Simple Brownian motion (Wiener process) increments ~ N(0, sigma^2 * dt)
function brownian(steps: number, dt: number, sigma: number) {
  const res = new Float64Array(steps)
  let x = 0
  for (let i=0;i<steps;i++) {
    const z = boxMuller()
    const dx = sigma * Math.sqrt(dt) * z
    x += dx
    res[i] = x
  }
  return { series: Array.from(res) }
}

function boxMuller() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Technicals and stochastic models
function sma(series: number[], w: number) {
  const n = series.length; if (!n || w<=1) return series.slice()
  const out = new Array(n).fill(NaN)
  let s = 0
  for (let i=0;i<n;i++) {
    s += series[i]
    if (i>=w) s -= series[i-w]
    if (i>=w-1) out[i] = s/w
  }
  return out
}
function ema(series: number[], w: number) {
  const n = series.length; if (!n || w<=1) return series.slice()
  const out = new Array(n)
  const alpha = 2/(w+1)
  out[0] = series[0]
  for (let i=1;i<n;i++) out[i] = alpha*series[i] + (1-alpha)*out[i-1]
  return out
}
function ar1(n: number, phi: number, sigma: number) {
  const out = new Array(n)
  let x = 0
  for (let i=0;i<n;i++) { x = phi*x + sigma*boxMuller(); out[i] = x }
  return out
}
function ou(n: number, theta: number, mu: number, sigma: number, dt: number) {
  const out = new Array(n)
  let x = mu
  for (let i=0;i<n;i++) { x += theta*(mu - x)*dt + sigma*Math.sqrt(dt)*boxMuller(); out[i] = x }
  return out
}
function gbm(n: number, mu: number, sigma: number, dt: number, s0: number) {
  const out = new Array(n)
  let s = s0
  for (let i=0;i<n;i++) { const z = boxMuller(); s = s * Math.exp((mu - 0.5*sigma*sigma)*dt + sigma*Math.sqrt(dt)*z); out[i] = s }
  return out
}

// Light data sources (placeholder)
function csvSource(p: any) {
  // Expect p.rows (array of numbers) or p.series
  const series = asNumArray(p.series) || fromFirstSeries(p.inputs)
  return { series }
}
function sqlSource(p: any) {
  // Placeholder: just echo inputs; real implementation would live in electron/main.
  const series = fromFirstSeries(p.inputs)
  return { series }
}
