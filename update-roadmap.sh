#!/bin/bash
# update-roadmap.sh
# Fetches latest data from Google Sheet and pushes to GitHub if anything changed.
# Run manually or via cron — no prompts, fully automated.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$REPO_DIR/update-roadmap.log"
PYTHON="$REPO_DIR/.venv/bin/python3"
SCRIPT="$REPO_DIR/fetch-roadmap-data.py"
CODA_EXPORT_SCRIPT="$REPO_DIR/export-coda-roadmap-data.py"

if [[ ! -x "$PYTHON" ]]; then
  PYTHON="/usr/bin/python3"
fi

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "========== Starting roadmap update =========="

cd "$REPO_DIR"

# Fetch latest data from Google Sheet
log "Running fetch-roadmap-data.py…"
"$PYTHON" "$SCRIPT" >> "$LOG_FILE" 2>&1

# Fetch latest static snapshot from Coda for GitHub Pages
if [[ -f "$CODA_EXPORT_SCRIPT" ]]; then
  log "Running export-coda-roadmap-data.py…"
  "$PYTHON" "$CODA_EXPORT_SCRIPT" >> "$LOG_FILE" 2>&1
fi

FILES=(
  roadmap-data.json
  roadmap-history.json
  roadmap-baseline.json
  coda-roadmap-data.json
  integration-testing-roadmap.html
  sit-roadmap-loader.js
  fetch-roadmap-data.py
  export-coda-roadmap-data.py
  update-roadmap.sh
)

# Check if roadmap files actually changed
if git diff --quiet -- "${FILES[@]}" 2>/dev/null && \
   [[ -z "$(git ls-files --others --exclude-standard -- "${FILES[@]}")" ]]; then
  log "No changes detected — skipping push."
else
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  log "Changes detected — committing and pushing…"
  git add -- "${FILES[@]}"
  git commit -m "Auto-update roadmap data ($TIMESTAMP)"
  git push
  log "Pushed successfully."
fi

log "========== Done =========="
