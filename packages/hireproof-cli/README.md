# HireProof CLI

Command-line access to the HireProof job-post audit API.

The CLI is for developers, power users, and automations that need a terminal-friendly way to audit a job post without opening the web app. Human output uses a branded terminal report by default, while `--json` stays clean for scripts and agents.

## Install

From the repo while developing:

```powershell
npm install
node packages\hireproof-cli\bin\hireproof.mjs --help
```

After publishing, the intended usage is:

```powershell
npx @hireproof/cli audit --text "Remote frontend intern. PHP 80,000/week. No interview. Telegram only."
```

## Commands

### Audit Inline Text

```powershell
hireproof audit --text "Remote frontend intern. PHP 80,000/week. No interview. Telegram only."
```

Default human output includes:

- HireProof terminal report header.
- Verdict, confidence, and risk score bar.
- Summary, extracted claims, red flags, green flags, next steps, and evidence.
- Report link when the API returns one.

### Audit A File

```powershell
hireproof audit --file .\job-post.txt
```

or:

```powershell
hireproof audit .\job-post.txt
```

### JSON Output

```powershell
hireproof audit --file .\job-post.txt --json
```

`--json` prints only the API JSON response. It does not include colors, banners, boxes, or extra status text.

### Plain And Colorless Output

```powershell
hireproof audit --file .\job-post.txt --plain
hireproof audit --file .\job-post.txt --no-color
hireproof audit --file .\job-post.txt --verbose
```

- `--plain`: old-style compact text output with no boxed layout.
- `--no-color`: keep the rich layout, but remove ANSI color.
- `--verbose`: show more evidence items and longer human-readable detail.

The rich layout uses HireProof's brand green accent for terminal headings and readiness states, plus verdict-specific colors for safe, caution, and high-risk results. The CLI disables color automatically when output is not a TTY or when `NO_COLOR` is set.

### Health

```powershell
hireproof health
```

### Config

```powershell
hireproof config set baseUrl https://hireproof-sigma.vercel.app
hireproof config set apiKey hireproof_agent_demo_key
hireproof config list
```

## Options

Shared:

- `--base-url <url>`: HireProof server URL. Defaults to config, `HIREPROOF_URL`, or `https://hireproof-sigma.vercel.app`.
- `--api-key <key>`: API key. Defaults to config, `HIREPROOF_API_KEY`, or the public demo key.
- `--json`: Print raw JSON where supported.
- `--plain`: Print compact non-boxed text where supported.
- `--no-color`: Disable ANSI color in rich output.
- `--verbose`: Show more detail in human output.

Audit:

- `--text <text>`: Job post or recruiter message text.
- `--file <path>`: Read text from a file.
- `--url <url>`: Optional job post URL context.
- `--location <place>`: Optional location context.
- `--mode <demo|live>`: Audit mode.
- `--webhook-url <url>`: Ask the API for async processing.

## Honest Status

This package is repo-shipped and tested. It is not published to npm until the package owner runs the external publish flow.
