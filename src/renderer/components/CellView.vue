<template>
  <div class="cell" :class="{ selected: isSelected }" :style="cellStyle" ref="rootRef" @mousedown="onDown" @dblclick="onDblClick" :data-cell-id="cell.id">
    <component :is="comp" :cell="cell" :theme="theme" :runningInfo="runningInfo" @switchMode="switchMode" @run="$emit('run', cell.id)" />
    <!-- inline port handles for precise hit targets -->
  <div class="port in" v-for="p in cell.inputs" :key="'in-'+p.id" :data-port-id="p.id" :title="p.id" @mouseup.stop="$emit('port-in-up', p.id)"></div>
  <div class="port out" v-for="p in cell.outputs" :key="'out-'+p.id" :data-port-id="p.id" :title="p.id" @mousedown.stop="$emit('port-out-down', p.id, $event)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { CellMode, CellState, ModeRect, CellTheme } from '../store/workflow'
import { useWorkflow } from '../store/workflow'
import CellCard from './cells/CellCard.vue'
import CellNode from './cells/CellNode.vue'
import CellVisual from './cells/CellVisual.vue'

const props = defineProps<{ cell: CellState; theme: CellTheme }>()
const emit = defineEmits<{ (e: 'run', id: string): void; (e: 'port-in-up', portId: string): void; (e: 'port-out-down', portId: string, ev: MouseEvent): void }>()

const wf = useWorkflow()
const isSelected = computed(() => wf.selectedIds.includes(props.cell.id))
const rootRef = ref<HTMLDivElement | null>(null)

const comp = computed(() => {
  switch (props.cell.mode) {
    case 'node': return CellNode
    case 'visual': return CellVisual
    default: return CellCard
  }
})

const rect = computed(() => props.cell.rects[props.cell.mode])
const cellStyle = computed(() => ({
  transform: `translate3d(${rect.value.x}px, ${rect.value.y}px, 0)`,
  width: rect.value.w + 'px',
  height: rect.value.h + 'px'
}))

// dragging (mode-local)
let offX = 0, offY = 0
let boardLeft = 0, boardTop = 0
let lastX = rect.value.x, lastY = rect.value.y
let dragging = false
let raf = 0
function onDown(e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) wf.toggleSelected(props.cell.id)
  else wf.selectExclusive(props.cell.id)
  dragging = true
  const r = rootRef.value!.getBoundingClientRect()
  offX = e.clientX - r.left
  offY = e.clientY - r.top
  const board = document.querySelector('.board') as HTMLElement | null
  if (board) {
    const br = board.getBoundingClientRect()
    boardLeft = br.left; boardTop = br.top
  } else { boardLeft = 0; boardTop = 0 }
  document.body.classList.add('flowboard-no-select')
  document.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseup', onUp, { passive: true, once: true })
}
function onMove(e: MouseEvent) {
  if (!dragging) return
  // Use viewport coordinates; Board container is positioned at (0,0) relative to viewport
  const x = e.clientX - boardLeft - offX
  const y = e.clientY - boardTop - offY
  if (!raf) {
    raf = requestAnimationFrame(() => {
      // write directly for live move
      const el = rootRef.value!
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      lastX = x; lastY = y
    // notify board to update link paths
    window.dispatchEvent(new CustomEvent('cell-drag', { detail: { id: props.cell.id, x, y } }))
      raf = 0
    })
  }
}
function onUp(e: MouseEvent) {
  dragging = false
  cancelAnimationFrame(raf)
  raf = 0
  const mode = props.cell.mode
  const r = rootRef.value!.getBoundingClientRect()
  wf.setRect(props.cell.id, mode, { x: lastX, y: lastY, w: r.width, h: r.height })
  document.body.classList.remove('flowboard-no-select')
  window.dispatchEvent(new CustomEvent('cell-moved', { detail: { id: props.cell.id, x: lastX, y: lastY } }))
}

const runningInfo = computed(() => {
  const c = props.cell
  const now = performance.now()
  const elapsed = c.status === 'running' && c.startedAt ? now - c.startedAt : (c.lastDurationMs ?? 0)
  return { status: c.status, elapsed }
})

function switchMode(next: CellMode) {
  wf.setMode(props.cell.id, next)
}

async function onDblClick() {
  // Double-click opens code in system editor if custom code present
  // @ts-ignore
  if (props.cell.config?.code && window.flowboard?.openInEditor) {
    try {
      // @ts-ignore
      await window.flowboard.openInEditor({ language: props.cell.config.language, code: props.cell.config.code, hintName: props.cell.label })
    } catch {}
  }
}

onMounted(() => {})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.cell {
  position: absolute;
  will-change: transform;
  contain: layout paint style;
}
.port { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #6aa2ff; border: 2px solid #1d3a66; pointer-events: auto; cursor: crosshair; }
.port.in { left: -6px; top: 50%; transform: translateY(-50%); background: #3bd18a; border-color: #124a31 }
.port.out { right: -6px; top: 50%; transform: translateY(-50%); }
</style>

<style>
.flowboard-no-select, .flowboard-no-select * {
  user-select: none !important;
  -webkit-user-select: none !important;
}
.cell.selected { outline: 2px solid #5ec8ff; border-radius: 10px; }
</style>
