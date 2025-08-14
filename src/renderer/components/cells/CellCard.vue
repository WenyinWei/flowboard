<template>
  <div class="card" :style="styleVars">
    <header class="hdr">
      <div class="title">{{ cell.label }}</div>
      <div class="actions">
  <button class="btn" @click="$emit('switchMode','node')">●</button>
  <button class="btn" @click="$emit('switchMode','visual')">▣</button>
        <button class="btn run" @click="$emit('run')">Run</button>
  <button class="btn" title="Run downstream" @click="$emit('run')">▼</button>
      </div>
    </header>
    <div class="body">
      <div class="job">Job: {{ jobLabel }}</div>
      <div class="io" v-if="(cell.inputs && cell.inputs.length) || (cell.outputs && cell.outputs.length)">
        <div class="in" v-if="cell.inputs && cell.inputs.length">
          <strong>Inputs</strong>
          <ul>
            <li v-for="p in (cell.inputs||[])" :key="p.id">{{ p.id }}</li>
          </ul>
        </div>
        <div class="out" v-if="cell.outputs && cell.outputs.length">
          <strong>Outputs</strong>
          <ul>
            <li v-for="p in (cell.outputs||[])" :key="p.id">{{ p.id }}</li>
          </ul>
        </div>
      </div>
    </div>
    <footer class="ftr">
      <div class="timer" :class="statusClass">
        <span class="spinner" v-if="runningInfo.status==='running'">⟳</span>
        <span v-else-if="runningInfo.status==='success'">✅</span>
        <span v-else-if="runningInfo.status==='error'">❌</span>
        <span v-else-if="runningInfo.status==='warning'">⚠️</span>
        <span class="elapsed">{{ humanTime(runningInfo.elapsed) }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CellState, CellTheme } from '../../store/workflow'
import { computed } from 'vue'

const props = defineProps<{ cell: CellState; theme: CellTheme; runningInfo: { status: string; elapsed: number } }>()
const emit = defineEmits<{ (e: 'run'): void; (e: 'switchMode', mode: 'node' | 'visual'): void }>()

const styleVars = computed(() => ({
  '--bg': props.theme.background ?? '#101418',
  '--fg': props.theme.foreground ?? '#dfe6ef',
  '--ac': props.theme.accent ?? '#1f8fff',
  '--ac2': props.theme.accent2 ?? '#15bd66',
  '--bd': props.theme.border ?? '#2a2f38'
}))

const statusClass = computed(() => props.runningInfo.status)

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
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}
.hdr { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; }
.title { font-weight: 600; }
.actions { display: flex; gap: 6px; }
.btn { background: transparent; color: var(--fg); border: 1px solid var(--bd); border-radius: 6px; padding: 2px 6px; cursor: pointer; }
.btn.run { border-color: var(--ac); color: var(--ac); }
.body { padding: 10px; font-size: 12px; opacity: 0.95; display: grid; gap: 8px; }
.job { font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; }
.io { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.io ul { margin: 6px 0 0 16px; padding: 0; }
.dim { opacity: 0.6 }
.ftr { display: flex; justify-content: end; padding: 6px 10px; }
.timer { display: inline-flex; align-items: center; gap: 6px; padding: 2px 6px; border: 1px solid var(--bd); border-radius: 6px; background: rgba(255,255,255,0.03); }
.spinner { display: inline-block; animation: spin 1s linear infinite; }
.elapsed { opacity: 0.85; }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.timer.success { border-color: #2ecc71 }
.timer.error { border-color: #e74c3c }
.timer.warning { border-color: #f1c40f }
</style>
