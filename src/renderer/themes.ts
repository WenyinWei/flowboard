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
  }
}

export const ThemeNames = Object.keys(Themes)
