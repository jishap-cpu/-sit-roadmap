#!/bin/bash
# update-roadmap.sh
# Fetches latest data from Google Sheet and pushes to GitHub if anything changed.
# Run manually or via cron — no prompts, fully automated.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$REPO_DIR/update-roadmap.log"
PYTHON="$REPO_DIR/.venv/bin/python3"
SCRIPT="$REPO_DIR/fetch-roadmap-data.py"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "========== Starting roadmap update =========="

cd "$REPO_DIR"

# Fetch latest data from Google Sheet
log "Running fetch-roadmap-data.py…"
"$PYTHON" "$SCRIPT" >> "$LOG_FILE" 2>&1

# Check if roadmap-data.json actually changed
if git diff --quiet roadmap-data.json roadmap-history.json roadmap-baseline.json 2>/dev/null && \
   ! git ls-files --others --exclude-standard | grep -qE "roadmap-(history|baseline)\.json"; then
  log "No changes detected — skipping push."
else
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  log "Changes detected — committing and pushing…"
  git add roadmap-data.json roadmap-history.json roadmap-baseline.json
  git commit -m "Auto-update roadmap data ($TIMESTAMP)"
  git push
  log "Pushed successfully."
fi

log "========== Done =========="
