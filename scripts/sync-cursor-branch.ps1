# Run before starting Cursor integration work (multi-machine)
git fetch --all --prune
git pull origin feature/cursor-integration
npm install
Write-Host "HEAD: $(git rev-parse --short HEAD) on $(git branch --show-current)"
