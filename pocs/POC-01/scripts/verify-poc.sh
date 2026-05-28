#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT=$(./scripts/run-poc.sh)
RECORDS=$(echo "$OUT" | sed -n 's/.*"records":\([0-9]*\).*/\1/p')
LATENCY=$(echo "$OUT" | sed -n 's/.*"latency_ms":\([0-9]*\).*/\1/p')
PASS=true
[ "$RECORDS" -ge 10 ] || PASS=false
[ "$LATENCY" -lt 5000 ] || PASS=false
if [ "$PASS" = true ]; then
  echo "POC-01: PASS (records=$RECORDS latency_ms=$LATENCY)"
  exit 0
fi
echo "POC-01: FAIL (records=$RECORDS latency_ms=$LATENCY)"
exit 1
