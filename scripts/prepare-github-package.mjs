import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outRoot = resolve(root, '.github-package-stage')

const packages = {
  sdk: {
    source: 'sdk',
    name: '@iron-mark/hireproof-sdk',
    description:
      'GitHub Packages build of the HireProof TypeScript SDK for job-scam verification audits.',
  },
  cli: {
    source: 'packages/hireproof-cli',
    name: '@iron-mark/hireproof-cli',
    description:
      'GitHub Packages build of the HireProof CLI for terminal job-scam verification audits.',
  },
  langchain: {
    source: 'packages/hireproof-langchain',
    name: '@iron-mark/hireproof-langchain',
    description:
      'GitHub Packages build of the HireProof LangChain tool for job-application safety gates.',
  },
  n8n: {
    source: 'integrations/n8n-nodes-hireproof',
    name: '@iron-mark/n8n-nodes-hireproof',
    description:
      'GitHub Packages build of the HireProof n8n node for job-safety automation workflows.',
  },
}

const targetKey = process.argv[2]
const config = packages[targetKey]

if (!config) {
  console.error(`Unknown package key: ${targetKey || '(missing)'}`)
  console.error(`Expected one of: ${Object.keys(packages).join(', ')}`)
  process.exit(1)
}

const source = resolve(root, config.source)
const target = resolve(outRoot, targetKey)

await rm(target, { recursive: true, force: true })
await mkdir(outRoot, { recursive: true })
await cp(source, target, {
  recursive: true,
  filter: (path) => !path.includes('node_modules') && !path.endsWith('.tgz'),
})

const packageJsonPath = resolve(target, 'package.json')
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

packageJson.name = config.name
packageJson.description = config.description
packageJson.publishConfig = {
  registry: 'https://npm.pkg.github.com',
}
packageJson.repository = {
  type: 'git',
  url: 'git+https://github.com/Iron-Mark/hackathon-v0-zero_to_agent.git',
  directory: config.source,
}
packageJson.bugs = {
  url: 'https://github.com/Iron-Mark/hackathon-v0-zero_to_agent/issues',
}
packageJson.homepage =
  packageJson.homepage || 'https://github.com/Iron-Mark/hackathon-v0-zero_to_agent#readme'

await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
console.log(`Prepared ${packageJson.name}@${packageJson.version} in ${target}`)
