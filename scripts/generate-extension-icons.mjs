import { mkdir, writeFile } from 'node:fs/promises'
import { deflateSync } from 'node:zlib'
import path from 'node:path'

const ICON_DIR = path.join(process.cwd(), 'extension', 'icons')
const SIZES = [16, 32, 48, 128]

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c >>> 0
}

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const lengthSquared = vx * vx + vy * vy
  const t = Math.max(0, Math.min(1, lengthSquared ? (wx * vx + wy * vy) / lengthSquared : 0))
  const dx = px - (ax + t * vx)
  const dy = py - (ay + t * vy)
  return Math.sqrt(dx * dx + dy * dy)
}

function rgbaForPixel(x, y, size) {
  const green = [22, 163, 74, 255]
  const white = [255, 255, 255, 255]
  const transparent = [0, 0, 0, 0]
  const radius = size * 0.22
  const cornerX = Math.min(x, size - 1 - x)
  const cornerY = Math.min(y, size - 1 - y)
  if (cornerX < radius && cornerY < radius) {
    const dx = radius - cornerX
    const dy = radius - cornerY
    if (Math.sqrt(dx * dx + dy * dy) > radius) return transparent
  }

  const cx = size / 2
  const cy = size / 2
  const circleRadius = size * 0.28
  const circleStroke = Math.max(1.5, size * 0.045)
  const circleDistance = Math.abs(Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - circleRadius)
  const checkStroke = Math.max(2, size * 0.055)
  const checkA = [size * 0.34, size * 0.52]
  const checkB = [size * 0.46, size * 0.64]
  const checkC = [size * 0.67, size * 0.38]
  const checkDistance = Math.min(
    distanceToSegment(x, y, checkA[0], checkA[1], checkB[0], checkB[1]),
    distanceToSegment(x, y, checkB[0], checkB[1], checkC[0], checkC[1]),
  )

  if (circleDistance <= circleStroke || checkDistance <= checkStroke) return white
  return green
}

function png(size) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6

  const raw = Buffer.alloc((size * 4 + 1) * size)
  let offset = 0
  for (let y = 0; y < size; y += 1) {
    raw[offset] = 0
    offset += 1
    for (let x = 0; x < size; x += 1) {
      const rgba = rgbaForPixel(x, y, size)
      raw[offset++] = rgba[0]
      raw[offset++] = rgba[1]
      raw[offset++] = rgba[2]
      raw[offset++] = rgba[3]
    }
  }

  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

await mkdir(ICON_DIR, { recursive: true })
for (const size of SIZES) {
  await writeFile(path.join(ICON_DIR, `icon${size}.png`), png(size))
}

console.log(`Generated Chrome extension PNG icons: ${SIZES.map((size) => `icon${size}.png`).join(', ')}`)
