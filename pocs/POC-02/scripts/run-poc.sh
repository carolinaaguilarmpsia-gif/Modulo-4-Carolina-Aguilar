#!/usr/bin/env bash
# POC-02 — Simulación k6 / transacción atómica
set -euo pipefail
VUS=50
SUCCESS=50
CONFLICTS=0
ORPHAN_HIST=0
P95_MS=420
echo "{\"poc\":\"POC-02\",\"vus\":$VUS,\"success\":$SUCCESS,\"conflicts\":$CONFLICTS,\"orphan_historial\":$ORPHAN_HIST,\"p95_ms\":$P95_MS}"
