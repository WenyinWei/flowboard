<template>
  <div class="node" :style="styleVars">
    <div class="glyph">{{ glyph }}</div>
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
    <div class="switches">
      <button class="btn" @click="$emit('switchMode','card')">▭</button>
  <button class="btn" @click="$emit('switchMode','visual')">▣</button>
  <button class="btn run" @click="$emit('run')">▶</button>
  <button class="btn" title="Run downstream" @click="$emit('run')">▼</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CellState, CellTheme } from '../../store/workflow'
import { computed, ref } from 'vue'
import AnsiModal from '../AnsiModal.vue'

const props = defineProps<{ cell: CellState; theme: CellTheme; runningInfo: { status: string; elapsed: number } }>()

const glyph = computed(() => {
  switch (props.cell.config.type) {
    case 'sum': return 'Σ'
    case 'mean': return 'x̄'
    case 'variance': return 'σ²'
    case 'sin': return 'sin'
    case 'cos': return 'cos'
    case 'tan': return 'tan'
    case 'square': return 'x²'
    case 'cube': return 'x³'
    case 'power': return 'x^n'
    case 'brownian': return 'Bₜ'
    default: return '𝑓'
  }
})

const styleVars = computed(() => ({
  '--bg': props.theme.background ?? '#101418',
  '--fg': props.theme.foreground ?? '#dfe6ef',
  '--ac': props.theme.accent ?? '#1f8fff',
  '--bd': props.theme.border ?? '#2a2f38'
}))

const statusClass = computed(() => props.runningInfo.status)

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
</script>

<style scoped>
.node {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid var(--bd);
  background: var(--bg);
  color: var(--fg);
  display: grid;
  place-items: center;
  position: relative;
}
.glyph { font-size: 24px; font-weight: 700; }
.timer { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); font-size: 12px; padding: 1px 6px; border-radius: 6px; border: 1px solid var(--bd); background: rgba(255,255,255,0.05); display: inline-flex; gap: 6px; align-items: center; white-space: nowrap; }
.timer.clickable { cursor: pointer; }
.spinner { animation: spin 1s linear infinite; }
.switches { position: absolute; top: 4px; right: 4px; display: flex; gap: 4px; }
.btn { background: transparent; color: var(--fg); border: 1px solid var(--bd); border-radius: 6px; padding: 2px 6px; cursor: pointer; }
.btn.run { border-color: var(--ac); color: var(--ac); }
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
</style>
