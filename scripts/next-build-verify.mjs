#!/usr/bin/env node

import { spawn } from 'node:child_process'

function runBuild(args) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['next', 'build', ...args], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
        NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=4096',
      },
    })

    child.on('error', (error) => resolve({ code: 1, signal: null, error }))
    child.on('close', (code, signal) => resolve({ code, signal, error: null }))
  })
}

const result = await runBuild(['--webpack'])

if (result.code === 0) {
  process.exitCode = 0
} else {
  if (result.signal) {
    console.error(`Next build ended with signal ${result.signal}. In restricted containers this often means the worker was terminated before Next emitted an application error.`)
  }
  if (result.error) console.error(result.error.message)
  process.exitCode = result.code || 1
}
