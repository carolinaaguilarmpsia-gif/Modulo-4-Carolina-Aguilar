#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT=$(./scripts/run-poc.sh)
ORPHAN=$(echo "$OUT" | sed -n 's/.*"orphan_historial":\([0-9]*\).*/\1/p')
P95=$(echo "$OUT" | sed -n 's/.*"p95_ms":\([0-9]*\).*/\1/p')
if [ "$ORPHAN" -eq 0 ] && [ "$P95" -lt 2000 ]; then
  echo "POC-02: PASS (orphan=$ORPHAN p95_ms=$P95)"
  exit 0
fi
echo "POC-02: FAIL"
exit 1
