import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outFile = join(root, 'dist', 'index.mjs')

const source = `import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const cjs = require('./index.js')
const HireProof = cjs.default || cjs.HireProof || cjs

export const HireProofError = cjs.HireProofError
export { HireProof }
export default HireProof
`

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, source, 'utf8')
