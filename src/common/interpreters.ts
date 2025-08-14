import { execFile } from 'child_process'
import { platform } from 'os'

export interface InterpreterPaths { python?: string; julia?: string }

// NOTE: This file will be used in the main process later; for now we expose type and stub in preload

export function detectPython(candidates: string[] = []): Promise<string | undefined> {
  const defaults = platform() === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python']
  const list = [...candidates, ...defaults]
  return tryVersions(list)
}

export function detectJulia(candidates: string[] = []): Promise<string | undefined> {
  const defaults = platform() === 'win32'
    ? ['julia']
    : ['julia']
  const list = [...candidates, ...defaults]
  return tryVersions(list)
}

function tryVersions(list: string[]): Promise<string | undefined> {
  return new Promise(resolve => {
    let i = 0
    const next = () => {
      if (i >= list.length) return resolve(undefined)
      const cmd = list[i++]
      const child = execFile(cmd, ['--version'])
      let settled = false
      child.on('error', () => { if (!settled) { settled = true; next() } })
      child.on('exit', (code) => { if (!settled) { settled = true; code === 0 ? resolve(cmd) : next() } })
    }
    next()
  })
}
