import type { CellTheme } from './store/workflow'

export const Themes: Record<string, CellTheme> = {
  'quant-cool': {
    name: 'quant-cool',
    background: '#0c0f12',
    foreground: '#dfe6ef',
    accent: '#1f8fff',
    accent2: '#15bd66',
    border: '#2a2f38'
  },
  'stock-dark-rg': {
    name: 'stock-dark-rg',
    background: '#0b0b0c',
    foreground: '#e6e6e6',
    accent: '#e74c3c',
    accent2: '#2ecc71',
    border: '#2a2a2a'
  },
  'kfc-red': {
    name: 'kfc-red',
    background: '#fff0f0',
    foreground: '#3b0b0b',
    accent: '#e4002b',
    accent2: '#b3001f',
    border: '#f2b3b3'
  },
  'cyberpunk': {
    name: 'cyberpunk',
    background: '#120016',
    foreground: '#e9e3ff',
    accent: '#00e5ff',
    accent2: '#ff00d4',
    border: '#2a1038'
  },
  'terminal-green': {
    name: 'terminal-green',
    background: '#001b00',
    foreground: '#b7ffb7',
    accent: '#00ff66',
    accent2: '#39ff14',
    border: '#0b2a0b'
  },
  'ocean-blue': {
    name: 'ocean-blue',
    background: '#07121f',
    foreground: '#e6f6ff',
    accent: '#15b2ff',
    accent2: '#00ffd1',
    border: '#12324a'
  },
  'matrix-black': {
    name: 'matrix-black',
    background: '#000000',
    foreground: '#b3ffb3',
    accent: '#00ff66',
    accent2: '#00cc44',
    border: '#0d1b0d'
  }
}

export const ThemeNames = Object.keys(Themes)
