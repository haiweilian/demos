#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECTS=(mini-agent mini-agent-full project-analyzer-mcp multi-agent-review)

for project in "${PROJECTS[@]}"; do
  echo "==> $project"
  cd "$ROOT/$project"
  npm ci
  npm run typecheck
  npm test
  npm run build
  echo ""
done

echo "All smoke checks passed."
