<template>
  <div class="visual" :style="styleVars" :class="[runningInfo.status, themeClass]">
    <div class="toolbar">
    <button class="btn" @mousedown.stop @click="$emit('switchMode','card')">▭</button>
    <button class="btn" @mousedown.stop @click="$emit('switchMode','node')">●</button>
  <button class="btn run" @mousedown.stop @click="onRun">Run</button>
    <button class="btn" title="Run downstream" @mousedown.stop @click="onRunDownstream">▼</button>
    </div>
    <div class="canvas">
      <img v-if="cell.status==='success' && imagePath" :src="imageSrc" class="img" />
      <canvas ref="canvasRef" v-else-if="cell.status==='success'"></canvas>
      <div v-else-if="cell.status==='error'">Execution failed: {{ cell.lastError }}</div>
      <div v-else>Waiting for result...</div>
    </div>
  <div
      class="timer"
      :class="[statusClass, { clickable: !!detailText }]"
      :title="detailText || ''"
      @click="onTimerClick"
    >
      <span class="elapsed">{{ humanTime(runningInfo.elapsed) }}</span>
      <span v-if="runningInfo.status==='running'" class="spinner">⟳</span>
      <span v-else-if="runningInfo.status==='success'">✅</span>
      <span v-else-if="runningInfo.status==='error'">❌</span>
      <span v-else-if="runningInfo.status==='warning'">⚠️</span>
    </div>
  <AnsiModal v-model="showDetail" :title="modalTitle" :text="detailText || ''" />
  </div>
</template>

<script setup lang="ts">
import type { CellState, CellTheme } from '../../store/workflow'
import { computed, onMounted, onUpdated, ref } from 'vue'
import AnsiModal from '../AnsiModal.vue'
const imagePath = computed(() => (props.cell.lastResult?.imagePath as string) || '')
const imageSrc = computed(() => imagePath.value ? `file://${imagePath.value}` : '')

const props = defineProps<{ cell: CellState; theme: CellTheme; runningInfo: { status: string; elapsed: number } }>()

const styleVars = computed(() => ({
  '--bg': props.theme.background ?? '#101418',
  '--fg': props.theme.foreground ?? '#dfe6ef',
  '--ac': props.theme.accent ?? '#1f8fff',
  '--bd': props.theme.border ?? '#2a2f38'
}))

const statusClass = computed(() => props.runningInfo.status)
const themeClass = computed(() => `theme-${(props.theme.name||'default').replace(/[^a-z0-9-]/gi, '-')}`)

const detailText = computed(() => {
  if (props.runningInfo.status === 'error') return props.cell.lastError || ''
  if (props.runningInfo.status === 'warning') return props.cell.lastWarning || ''
  return ''
})
const showDetail = ref(false)
const modalTitle = computed(() => props.runningInfo.status === 'error' ? 'Error' : (props.runningInfo.status === 'warning' ? 'Warning' : ''))
function onTimerClick() { if (detailText.value) showDetail.value = true }

function humanTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function onRun() {
  console.log('[renderer] CellVisual run click', props.cell.id)
  // Emit upward
  // @ts-ignore
  ;(emit as any)('run')
}

function onRunDownstream() {
  console.log('[renderer] CellVisual run downstream click', props.cell.id)
  // @ts-ignore
  ;(emit as any)('run-downstream')
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

function render()
{
  const c = canvasRef.value; if (!c) return
  const parent = c.parentElement as HTMLElement
  const w = Math.max(100, parent.clientWidth - 8)
  const h = Math.max(80, parent.clientHeight - 8)
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  ctx.clearRect(0,0,w,h)
  ctx.strokeStyle = '#5ec8ff'
  ctx.lineWidth = 1.5
  const data = (props.cell.lastResult?.series as number[]) ?? []
  if (data.length < 2) return
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  ctx.beginPath()
  for (let i=0;i<data.length;i++) {
    const x = (i/(data.length-1)) * (w-10) + 5
    const y = h - ((data[i]-min)/span) * (h-10) - 5
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
  }
  ctx.stroke()
}

onMounted(render)
onUpdated(render)
</script>

<style scoped>
.visual { width: 100%; height: 100%; border-radius: 10px; border: 1px solid var(--bd); background: var(--bg); color: var(--fg); position: relative; display: grid; grid-template-rows: auto 1fr auto; transition: filter 250ms ease, box-shadow 250ms ease; box-shadow: 0 10px 28px rgba(0,0,0,0.35); }
.toolbar { padding: 6px; display: flex; gap: 6px; justify-content: space-between; }
.canvas { padding: 12px; }
.btn { background: transparent; color: var(--fg); border: 1px solid var(--bd); border-radius: 6px; padding: 2px 6px; cursor: pointer; }
.btn.run { border-color: var(--ac); color: var(--ac); }
.timer { position: absolute; right: 8px; bottom: 8px; display: inline-flex; gap: 6px; align-items: center; border: 1px solid var(--bd); border-radius: 6px; padding: 2px 6px; background: rgba(255,255,255,0.05); white-space: nowrap; z-index: 2; }
.timer.clickable { cursor: pointer; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

.visual.running { animation: vglow 1.2s ease-in-out infinite; }
@keyframes vglow {
  0% { filter: drop-shadow(0 0 0 rgba(21,189,102,0)); box-shadow: 0 10px 28px rgba(0,0,0,0.35); }
  50% { filter: drop-shadow(0 0 10px rgba(21,189,102,0.6)); box-shadow: 0 10px 28px rgba(0,0,0,0.35), 0 0 28px rgba(21,189,102,0.25); }
  100% { filter: drop-shadow(0 0 0 rgba(21,189,102,0)); box-shadow: 0 10px 28px rgba(0,0,0,0.35); }
}
</style>
