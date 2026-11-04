#!/usr/bin/env bash
# E3 — repite N corridas de una forma, cada una desde cero (docker compose down -v entre corridas).
#
#   bench/e3/correr.sh <proceso|http> [colgado|lento|caido] [N]
#
# Variables opcionales (se pasan a k6): RATE, DURACION, CALENTAMIENTO, FALLO_DESDE, FALLO_HASTA.
# Deja en bench/e3/resultados/: <forma>-<falla>-<i>.json (k6) y <forma>-<falla>-<i>.meta.json (tiempos y carga).
set -euo pipefail
cd "$(dirname "$0")/../.."

FORMA="${1:?uso: correr.sh <proceso|http> [colgado|lento|caido] [N]}"
FALLA="${2:-colgado}"
N="${3:-5}"
[[ "$FORMA" == "proceso" || "$FORMA" == "http" ]] || { echo "forma inválida: $FORMA" >&2; exit 2; }
[[ "$FALLA" == "colgado" || "$FALLA" == "lento" || "$FALLA" == "caido" ]] || { echo "falla inválida: $FALLA" >&2; exit 2; }

COMPOSE=(docker compose -f compose.e3.yaml --env-file "bench/e3/formas/$FORMA.env")
ahora() { python3 -c 'import time; print(f"{time.time():.3f}")'; }
resta() { python3 -c "print(f'{$2 - $1:.1f}')"; }
bajar() { docker compose -f compose.e3.yaml --profile '*' down -v --remove-orphans >/dev/null 2>&1 || true; }

K6_ENV=(-e "FALLA=$FALLA")
for v in RATE DURACION CALENTAMIENTO FALLO_DESDE FALLO_HASTA; do
  [[ -n "${!v:-}" ]] && K6_ENV+=(-e "$v=${!v}")
done
[[ "$FORMA" == "http" ]] && K6_ENV+=(-e "TOXIPROXY_URL=http://toxiproxy:8474")

mkdir -p bench/e3/resultados
bajar
echo ">> build ($FORMA)"
t0=$(ahora); "${COMPOSE[@]}" build >/dev/null; BUILD_S=$(resta "$t0" "$(ahora)")
echo "   build: ${BUILD_S}s"

for i in $(seq 1 "$N"); do
  NOMBRE="$FORMA-$FALLA-$i"
  bajar
  CARGA=$(uptime | sed 's/.*load averages*: *//')
  echo ">> corrida $i/$N ($NOMBRE)  carga: $CARGA"
  t0=$(ahora); "${COMPOSE[@]}" up -d --wait >/dev/null; UP_S=$(resta "$t0" "$(ahora)")
  echo "   up: ${UP_S}s"
  "${COMPOSE[@]}" run --rm "${K6_ENV[@]}" -e "NOMBRE=$NOMBRE" k6 run /k6/carga.js 2>&1 | grep -A7 '^ruta' | head -8 || true
  printf '{"nombre":"%s","forma":"%s","falla":"%s","build_s":%s,"up_s":%s,"carga_uptime":"%s"}\n' "$NOMBRE" "$FORMA" "$FALLA" "$BUILD_S" "$UP_S" "$CARGA" > "bench/e3/resultados/$NOMBRE.meta.json"
done
bajar
echo ">> listo: $N corridas en bench/e3/resultados/ (resumir con: node bench/e3/resumir.mjs)"
