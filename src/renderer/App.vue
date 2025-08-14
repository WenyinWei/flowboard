<template>
  <div class="wrap">
    <h1>FlowBoard</h1>
    <Board />
  </div>
</template>

<script setup lang="ts">
import Board from './components/Board.vue'
import './themes/quant-cool.css'
import './themes/kfc-red.css'
import './themes/stock-dark-rg.css'
import './themes/cyberpunk.css'
import './themes/terminal-green.css'
import './themes/ocean-blue.css'
import './themes/matrix-black.css'
</script>

<style>
body, html, #app { height: 100%; margin: 0; }
.wrap { padding: 12px; font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial; color: #eaeef6; background: #0a0d12; }
.row { display: block; }
</style>
