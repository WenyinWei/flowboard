import { copyFile, mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function run() {
  const srcMain = join(__dirname, 'main.cjs')
  const srcPreload = join(__dirname, 'preload.cjs')
  const outDir = join(__dirname, '..', 'dist-electron')
  await mkdir(outDir, { recursive: true })
  await copyFile(srcMain, join(outDir, 'main.cjs'))
  await copyFile(srcPreload, join(outDir, 'preload.cjs'))
  console.log('Copied Electron files to dist-electron/')
}

run().catch(err => { console.error(err); process.exit(1) })
