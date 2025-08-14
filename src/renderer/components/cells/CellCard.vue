<template>
  <div class="card" :style="styleVars" :class="[runningInfo.status, themeClass]">
    <header class="hdr">
      <div class="title">{{ cell.label }}</div>
  <div class="actions">
  <button class="btn" @mousedown.stop @click="$emit('switchMode','node')">●</button>
  <button class="btn" @mousedown.stop @click="$emit('switchMode','visual')">▣</button>
    <button class="btn run" @mousedown.stop @click="onRun">Run</button>
  <button class="btn" title="Run downstream" @mousedown.stop @click="onRunDownstream">▼</button>
      </div>
    </header>
    <div class="body">
      <div class="job">{{ jobLabel }}</div>
      <div class="io two-cols">
        <!-- Left column: Inputs + Params editor -->
        <div class="col-l">
          <div class="section in" v-if="(cell.inputs && cell.inputs.length)">
            <div class="chips">
              <span class="chip" v-for="p in (cell.inputs||[])" :key="p.id" :title="p.id">⬅ {{ p.id }}</span>
            </div>
          </div>
          <div class="section params" v-if="hasNumericParams">
            <strong>Params</strong>
            <ParamControls :params="cell.config.params" @update="onParamUpdate" />
          </div>
        </div>
        <!-- Right column: Outputs -->
        <div class="col-r">
          <div class="section out" v-if="(cell.outputs && cell.outputs.length)">
            <div class="chips">
              <span class="chip out" v-for="p in (cell.outputs||[])" :key="p.id" :title="p.id">{{ p.id }} ➡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="ftr">
      <div
        class="timer"
        :class="[statusClass, { clickable: !!detailText }]"
        :title="detailText || ''"
        @click="onTimerClick"
      >
        <span class="elapsed">{{ humanTime(runningInfo.elapsed) }}</span>
        <span class="spinner" v-if="runningInfo.status==='running'">⟳</span>
        <span v-else-if="runningInfo.status==='success'">✅</span>
        <span v-else-if="runningInfo.status==='error'">❌</span>
        <span v-else-if="runningInfo.status==='warning'">⚠️</span>
      </div>
    </footer>
    <AnsiModal v-model="showDetail" :title="modalTitle" :text="detailText || ''" />
  </div>
</template>

<script setup lang="ts">
import type { CellState, CellTheme } from '../../store/workflow'
import { computed, ref } from 'vue'
import AnsiModal from '../AnsiModal.vue'
import ParamControls from '../ParamControls.vue'

const props = defineProps<{ cell: CellState; theme: CellTheme; runningInfo: { status: string; elapsed: number } }>()
const emit = defineEmits<{ (e: 'run'): void; (e: 'run-downstream'): void; (e: 'switchMode', mode: 'node' | 'visual'): void }>()

const styleVars = computed(() => ({
  '--bg': props.theme.background ?? '#101418',
  '--fg': props.theme.foreground ?? '#dfe6ef',
  '--ac': props.theme.accent ?? '#1f8fff',
  '--ac2': props.theme.accent2 ?? '#15bd66',
  '--bd': props.theme.border ?? '#2a2f38'
}))

const statusClass = computed(() => props.runningInfo.status)
const themeClass = computed(() => `theme-${(props.theme.name||'default').replace(/[^a-z0-9-]/gi, '-')}`)

// Full error/warning text for hover/click
const detailText = computed(() => {
  if (props.runningInfo.status === 'error') return props.cell.lastError || ''
  if (props.runningInfo.status === 'warning') return props.cell.lastWarning || ''
  return ''
})
const showDetail = ref(false)
const modalTitle = computed(() => props.runningInfo.status === 'error' ? 'Error' : (props.runningInfo.status === 'warning' ? 'Warning' : ''))
function onTimerClick() { if (detailText.value) showDetail.value = true }

const jobLabel = computed(() => {
  const t = props.cell.config.type
  switch (t) {
    case 'sum': return 'Sum a series'
    case 'mean': return 'Mean of series'
    case 'variance': return 'Variance of series'
    case 'sin': return 'Generate sine wave'
    case 'brownian': return 'Simulate Brownian motion'
    case 'custom': return `${props.cell.config.language?.toUpperCase()} script`
    default: return t
  }
})

const paramEntries = computed(() => {
  const p = (props.cell.config as any)?.params || {}
  return Object.entries(p).filter(([_,v]) => typeof v === 'number') as Array<[string, number]>
})
const hasNumericParams = computed(() => paramEntries.value.length > 0)
function isInt(v: number) { return Number.isInteger(v) }
function onParamUpdate(key: string, val: number) {
  if (!props.cell.config.params) props.cell.config.params = {}
  const wasInt = Number.isInteger(((props.cell.config as any)?.params||{})[key])
  ;(props.cell.config.params as any)[key] = wasInt ? Math.round(val) : val
}

function onRun() {
  console.log('[renderer] CellCard run click', props.cell.id)
  emit('run')
}

function onRunDownstream() {
  console.log('[renderer] CellCard run downstream click', props.cell.id)
  emit('run-downstream')
}

function humanTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
</script>

<style scoped>
.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  width: 100%;
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--bd);
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35), inset 0 0 0px rgba(0,0,0,0.0);
  transition: box-shadow 300ms ease, filter 300ms ease, transform 200ms ease;
}
.hdr { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; }
.title { font-weight: 600; }
.actions { display: flex; gap: 6px; }
.btn { background: transparent; color: var(--fg); border: 1px solid var(--bd); border-radius: 6px; padding: 2px 6px; cursor: pointer; }
.btn.run { border-color: var(--ac); color: var(--ac); }
.body { padding: 10px; font-size: 12px; opacity: 0.95; display: grid; gap: 10px; }
.job { font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; }
.io.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start; }
.col-l, .col-r { display: grid; gap: 10px; align-content: start; }
.section strong { font-weight: 600; font-size: 12px; opacity: 0.9 }
.chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.chip { font-size: 11px; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--bd); background: rgba(255,255,255,0.03); color: var(--fg); }
.chip.out { border-color: var(--ac); color: var(--ac); }
.dim { opacity: 0.6 }
.ftr { display: flex; justify-content: end; padding: 6px 10px; }
.ftr { position: relative; }
.timer { position: absolute; right: 10px; bottom: 6px; display: inline-flex; align-items: center; gap: 6px; padding: 2px 6px; border: 1px solid var(--bd); border-radius: 6px; background: rgba(255,255,255,0.03); white-space: nowrap; z-index: 2; }
.timer.clickable { cursor: pointer; }
.spinner { display: inline-block; animation: spin 1s linear infinite; }
.elapsed { opacity: 0.85; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.timer.success { border-color: #2ecc71 }
.timer.error { border-color: #e74c3c }
.timer.warning { border-color: #f1c40f }

/* Dynamic glow when running */
.card.running {
  animation: pulseGlow 1.2s ease-in-out infinite;
  box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0), 0 0 24px rgba(31,143,255,0.25), 0 0 48px rgba(31,143,255,0.12);
}

@keyframes pulseGlow {
  0% { filter: drop-shadow(0 0 0px rgba(31,143,255,0.0)); }
  50% { filter: drop-shadow(0 0 8px rgba(31,143,255,0.45)); }
  100% { filter: drop-shadow(0 0 0px rgba(31,143,255,0.0)); }
}
</style>
