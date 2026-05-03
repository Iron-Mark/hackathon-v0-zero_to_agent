import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const target = path.join(root, 'public', 'downloads', 'hireproof-native-integrations.zip')
const includeRoots = [
  'integrations/n8n-nodes-hireproof',
  'integrations/make-hireproof',
  'packages/hireproof-langchain',
]

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function writeZipNumber(buffer, value, offset, bytes) {
  if (bytes === 2) buffer.writeUInt16LE(value, offset)
  else buffer.writeUInt32LE(value >>> 0, offset)
}

async function listFiles(dir, base = root) {
  const files = []
  for (const item of await readdir(path.join(root, dir))) {
    const relative = path.join(dir, item)
    const full = path.join(root, relative)
    const itemStat = await stat(full)
    if (itemStat.isDirectory()) {
      files.push(...await listFiles(relative, base))
    } else {
      files.push(path.relative(base, full).replaceAll(path.sep, '/'))
    }
  }
  return files
}

async function makeZip(files, targetPath) {
  const localParts = []
  const centralParts = []
  let offset = 0

  for (const file of files.sort()) {
    const name = Buffer.from(file)
    const data = await readFile(path.join(root, file))
    const checksum = crc32(data)

    const local = Buffer.alloc(30)
    writeZipNumber(local, 0x04034b50, 0, 4)
    writeZipNumber(local, 20, 4, 2)
    writeZipNumber(local, 0, 6, 2)
    writeZipNumber(local, 0, 8, 2)
    writeZipNumber(local, checksum, 14, 4)
    writeZipNumber(local, data.length, 18, 4)
    writeZipNumber(local, data.length, 22, 4)
    writeZipNumber(local, name.length, 26, 2)
    localParts.push(local, name, data)

    const central = Buffer.alloc(46)
    writeZipNumber(central, 0x02014b50, 0, 4)
    writeZipNumber(central, 20, 4, 2)
    writeZipNumber(central, 20, 6, 2)
    writeZipNumber(central, 0, 8, 2)
    writeZipNumber(central, 0, 10, 2)
    writeZipNumber(central, checksum, 16, 4)
    writeZipNumber(central, data.length, 20, 4)
    writeZipNumber(central, data.length, 24, 4)
    writeZipNumber(central, name.length, 28, 2)
    writeZipNumber(central, offset, 42, 4)
    centralParts.push(central, name)

    offset += local.length + name.length + data.length
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const footer = Buffer.alloc(22)
  writeZipNumber(footer, 0x06054b50, 0, 4)
  writeZipNumber(footer, files.length, 8, 2)
  writeZipNumber(footer, files.length, 10, 2)
  writeZipNumber(footer, centralSize, 12, 4)
  writeZipNumber(footer, offset, 16, 4)

  await mkdir(path.dirname(targetPath), { recursive: true })
  await writeFile(targetPath, Buffer.concat([...localParts, ...centralParts, footer]))
}

const files = []
for (const dir of includeRoots) files.push(...await listFiles(dir))
await makeZip(files, target)

console.log(`Packaged ${path.relative(root, target)} with ${files.length} files.`)
