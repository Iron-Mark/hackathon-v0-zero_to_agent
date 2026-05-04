import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const cjs = require('./index.js')
const HireProof = cjs.default || cjs.HireProof || cjs

export const HireProofError = cjs.HireProofError
export { HireProof }
export default HireProof
