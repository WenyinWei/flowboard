<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
  <div class="modal" :class="{ fullscreen }" :style="modalStyle">
        <header class="hdr">
          <div class="title">{{ title }}</div>
          <div class="actions">
            <button class="btn" title="Copy raw text" @click="copy">⧉</button>
            <button class="btn" title="Toggle full screen" @click="toggleFull">{{ fullscreen ? '⤢' : '⤡' }}</button>
            <button class="btn" title="Close" @click="close">✕</button>
          </div>
        </header>
  <div class="content" v-html="html"></div>
  <div v-if="!fullscreen" class="resizer" @mousedown="onResizeStart" />
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import AnsiToHtml from 'ansi-to-html'

const props = defineProps<{ modelValue: boolean; title?: string; text: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function close() { emit('update:modelValue', false) }
const fullscreen = ref(false)
function toggleFull() { fullscreen.value = !fullscreen.value }
async function copy() { try { await navigator.clipboard.writeText(props.text || '') } catch {} }

const converter = new AnsiToHtml({ escapeXML: true, fg: '#dfe6ef', bg: '#0c0f12' })
const html = computed(() => {
  const t = props.text || ''
  // Convert ANSI to HTML; ansi-to-html escapes HTML by default when escapeXML is true
  return `<pre class="ansi">${converter.toHtml(t)}</pre>`
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

// Modal sizing and resizing (bind content and window together)
const minW = 480, minH = 200
const modalW = ref(Math.min(1000, Math.floor(window.innerWidth * 0.9)))
const modalH = ref(Math.min(700, Math.floor(window.innerHeight * 0.8)))
const modalStyle = computed(() => fullscreen.value ? {} : ({ width: `${modalW.value}px`, height: `${modalH.value}px` }))

let startX = 0, startY = 0, startW = 0, startH = 0
function onResizeStart(e: MouseEvent) {
  startX = e.clientX; startY = e.clientY
  startW = modalW.value; startH = modalH.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  e.preventDefault(); e.stopPropagation()
}
function onResizeMove(e: MouseEvent) {
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  const maxW = Math.floor(window.innerWidth * 0.95)
  const maxH = Math.floor(window.innerHeight * 0.9)
  modalW.value = Math.max(minW, Math.min(maxW, startW + dx))
  modalH.value = Math.max(minH, Math.min(maxH, startH + dy))
}
function onResizeEnd() {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: grid; place-items: center; z-index: 9999; }
.modal { position: relative; width: min(1200px, 95vw); max-height: 90vh; border-radius: 10px; border: 1px solid #2a2f38; background: #0c0f12; color: #dfe6ef; overflow: hidden; display: grid; grid-template-rows: auto 1fr; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.modal.fullscreen { width: 100vw; height: 100vh; max-height: none; border-radius: 0; }
.hdr { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #2a2f38; }
.actions { display: flex; gap: 6px; }
.title { font-weight: 600; }
.btn { background: transparent; color: inherit; border: 1px solid #2a2f38; border-radius: 6px; padding: 2px 6px; cursor: pointer; }
 .content { padding: 12px; overflow: auto; }
.ansi { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; white-space: pre-wrap; word-break: break-word; }
 .resizer { position: absolute; right: 4px; bottom: 4px; width: 16px; height: 16px; cursor: se-resize; background: linear-gradient(135deg, transparent 50%, #2a2f38 50%), linear-gradient(45deg, transparent 50%, #2a2f38 50%); background-size: 8px 8px; background-repeat: no-repeat; background-position: 0 100%, 100% 0; opacity: 0.6; }
</style>
