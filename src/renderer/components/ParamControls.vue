<template>
  <div class="params">
    <div class="param" v-for="([k, v], idx) in numericEntries" :key="k">
      <label class="k" :title="k">{{ prettyName(k) }}</label>
      <div class="ctrls">
        <input
          class="range"
          type="range"
          :min="range(k, v).min"
          :max="range(k, v).max"
          :step="range(k, v).step"
          :value="v"
          @input="e => onRange(k, e)"
        />
        <input
          class="num"
          type="number"
          :step="isInt(k, v) ? 1 : 'any'"
          :value="v"
          @input="e => onNumber(k, e)"
        />
        <button class="dice" title="Randomize within range" @click.prevent="() => onRandom(k)">🎲</button>
      </div>
      <div class="hint" v-if="defs && defs[k] && (defs[k].min !== undefined || defs[k].max !== undefined)">
        <span>min: {{ defs[k].min ?? 'auto' }}, max: {{ defs[k].max ?? 'auto' }}, step: {{ defs[k].step ?? 'auto' }}</span>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ParamDef = { type?: 'number'|'int'|'range'|'choice'; min?: number; max?: number; step?: number; choices?: any[] }

const props = defineProps<{ params?: Record<string, any> | null | undefined, defs?: Record<string, ParamDef> | null | undefined }>()
const emit = defineEmits<{ (e: 'update', key: string, value: number): void }>()

const numericEntries = computed(() => {
  const p = props.params || {}
  return Object.entries(p).filter(([, val]) => typeof val === 'number') as Array<[string, number]>
})

function prettyName(k: string) {
  return k.replace(/[_-]+/g, ' ')
}

function isInt(k: string, v: number) {
  const t = props.defs?.[k]?.type
  return t === 'int' || Number.isInteger(v)
}

function heurRange(key: string, val: number) {
  // Heuristics based on key names and current value
  const lowerKey = key.toLowerCase()
  if (/^(n|count|bins|steps?)$/.test(lowerKey)) return { min: 1, max: Math.max(10, Math.ceil(val * 5) || 100), step: 1 }
  if (/freq|frequency|rate/.test(lowerKey)) return { min: 0, max: Math.max(5, Math.ceil(val * 5) || 5), step: 0.1 }
  if (/alpha|beta|gamma|lr|learning/.test(lowerKey)) return { min: 0, max: 1, step: 0.01 }
  if (/seed/.test(lowerKey)) return { min: 0, max: 1_000_000, step: 1 }
  // default around current value
  const span = Math.max(1, Math.abs(val) || 10)
  const min = Math.floor(val - span)
  const max = Math.ceil(val + span)
  const step = isInt(key, val) ? 1 : +(span / 50).toFixed(3)
  return { min, max, step }
}

function range(key: string, val: number) {
  const d = props.defs?.[key]
  const h = heurRange(key, val)
  return {
    min: d?.min ?? h.min,
    max: d?.max ?? h.max,
    step: d?.step ?? h.step
  }
}

function onRange(key: string, e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update', key, isInt(key, v) ? Math.round(v) : v)
}

function onNumber(key: string, e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (!Number.isFinite(v)) return
  emit('update', key, isInt(key, v) ? Math.round(v) : v)
}

function onRandom(key: string) {
  const p = props.params || {}
  const v = Number(p[key])
  const { min, max, step } = range(key, v)
  const steps = Math.max(1, Math.floor((max - min) / (Number(step) || 1)))
  const r = Math.floor(Math.random() * (steps + 1))
  const val = min + r * (Number(step) || 1)
  emit('update', key, isInt(key, v) ? Math.round(val) : val)
}
</script>

<style scoped>
.params { display: grid; gap: 8px; }
.param { display: grid; gap: 6px; }
.k { font-weight: 600; opacity: 0.9; }
.ctrls { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; }
.range { width: 100%; accent-color: var(--ac); }
.num { width: 88px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--bd); background: rgba(255,255,255,0.05); color: var(--fg); }
.dice { border: 1px solid var(--bd); background: transparent; color: var(--fg); border-radius: 6px; padding: 2px 6px; cursor: pointer; }
.hint { font-size: 11px; opacity: 0.6; }
</style>
