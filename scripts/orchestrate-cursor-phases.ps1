# HireProof Cursor phase orchestrator (Windows wrapper)
# Sets Codex defaults for this machine, then runs the Node orchestrator.
$ErrorActionPreference = 'Stop'

if (-not $env:CODEX_ORCHESTRATE_MODEL) { $env:CODEX_ORCHESTRATE_MODEL = 'gpt-5.5' }
if (-not $env:CODEX_ORCHESTRATE_REASONING_EFFORT) { $env:CODEX_ORCHESTRATE_REASONING_EFFORT = 'high' }
if (-not $env:CODEX_ORCHESTRATE_SANDBOX) { $env:CODEX_ORCHESTRATE_SANDBOX = 'read-only' }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir 'orchestrate-cursor-phases.mjs'
& node $nodeScript @args
exit $LASTEXITCODE
