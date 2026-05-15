#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { runResearchAgent } from '../lib/research-agent.mjs'

function printHelp() {
  console.log(`HireProof research agent

Usage:
  node scripts/research-agent.mjs --prompt "Investigate this job post"
  node scripts/research-agent.mjs --file ./job-post.txt --enable-codex

Options:
  --prompt <text>       Research prompt or suspicious job/recruiter text.
  --file <path>         Read the prompt from a UTF-8 text file.
  --primary <provider>  cursor, codex, or none. Default: RESEARCH_AGENT_PRIMARY or cursor.
  --fallback <provider> cursor, codex, or none. Default: RESEARCH_AGENT_FALLBACK or codex.
  --enable-codex        Permit Codex SDK fallback for this run.
  --json                Print only the JSON result.
  --help                Show this help.
`)
}

function parseArgs(argv) {
  const options = { json: false, enableCodex: false }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    if (arg === '--help' || arg === '-h') options.help = true
    else if (arg === '--json') options.json = true
    else if (arg === '--enable-codex') options.enableCodex = true
    else if (arg === '--prompt' || arg === '-p') {
      options.prompt = next
      index += 1
    } else if (arg === '--file' || arg === '-f') {
      options.file = next
      index += 1
    } else if (arg === '--primary') {
      options.primary = next
      index += 1
    } else if (arg === '--fallback') {
      options.fallback = next
      index += 1
    } else if (!options.prompt) {
      options.prompt = arg
    }
  }

  return options
}

function printReadable(result) {
  console.log(`Provider: ${result.provider}`)
  console.log(`Status: ${result.status}`)
  console.log('')
  console.log(result.summary || 'No summary returned.')

  const sections = [
    ['Findings', result.findings],
    ['Evidence', result.evidence],
    ['Commands', result.commands],
    ['Next steps', result.nextSteps],
  ]

  for (const [title, items] of sections) {
    if (!items?.length) continue
    console.log('')
    console.log(`${title}:`)
    for (const item of items) console.log(`- ${item}`)
  }

  if (result.attempts?.length > 1) {
    console.log('')
    console.log('Attempts:')
    for (const attempt of result.attempts) {
      console.log(`- ${attempt.provider}: ${attempt.status}`)
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printHelp()
    return
  }

  let prompt = options.prompt || ''
  if (options.file) {
    const filePath = path.resolve(process.cwd(), options.file)
    prompt = await fs.readFile(filePath, 'utf8')
  }

  if (!prompt.trim()) {
    printHelp()
    process.exitCode = 1
    return
  }

  const result = await runResearchAgent({
    prompt,
    primary: options.primary,
    fallback: options.fallback,
    enableCodex: options.enableCodex,
  })

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    printReadable(result)
  }

  if (result.status !== 'ok') process.exitCode = 2
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
