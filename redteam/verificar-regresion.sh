#!/usr/bin/env bash
# Verifica el punto 5 de la consigna: "que el test FALLE si la mitigación se quita".
#
# Para cada mitigación (de los 4 hallazgos mitigados), el script:
#   1. la quita temporalmente del archivo de dominio (vuelve al código vulnerable),
#   2. corre los tests de regresión del red team → DEBEN fallar,
#   3. restaura el archivo original (siempre, incluso si algo falla — trap EXIT).
# Al final corre todos los tests de regresión con el código mitigado → DEBEN pasar.
#
# Uso (desde la raíz del repo):  bash redteam/verificar-regresion.sh
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ORQUESTADOR="$RAIZ/backend/domain/orquestador-atencion/services/OrquestadorAtencionService.ts"
AGENTE_DJ="$RAIZ/backend/domain/agente-dj/services/AgenteDJService.ts"
TRAMITES="$RAIZ/backend/domain/tramites-dpa/services/TramiteToolsService.ts"
EVIDENCIA="$RAIZ/redteam/evidencia/verificacion-regresion.txt"

RESPALDOS=()
for f in "$ORQUESTADOR" "$AGENTE_DJ" "$TRAMITES"; do
  b="$(mktemp)"; cp "$f" "$b"; RESPALDOS+=("$f:$b")
done
restaurar_todo() {
  for par in "${RESPALDOS[@]}"; do
    f="${par%%:*}"; b="${par#*:}"
    cp "$b" "$f"; rm -f "$b"
  done
}
trap restaurar_todo EXIT

respaldo_de() {
  for par in "${RESPALDOS[@]}"; do
    [[ "${par%%:*}" == "$1" ]] && echo "${par#*:}" && return
  done
}

correr_tests() {
  local archivo_test="$1"
  (cd "$RAIZ" && NODE_OPTIONS=--experimental-vm-modules npx jest \
    "$archivo_test" -t 'regresión red team' --watchman=false --verbose 2>&1)
}

# Reemplazo literal (no regex) — si el texto ya no existe, la verificación se invalida en vez de pasar en silencio.
quitar() {
  python3 - "$1" "$2" "$3" <<'EOF'
import sys
ruta, viejo, nuevo = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(ruta, encoding='utf-8').read()
if viejo not in s:
    sys.exit(f'No se encontró el código de la mitigación a quitar:\n{viejo}')
open(ruta, 'w', encoding='utf-8').write(s.replace(viejo, nuevo))
EOF
}

resultado=0
: > "$EVIDENCIA"

verificar_sin() {
  local nombre="$1" servicio="$2" archivo_test="$3" viejo="$4" nuevo="$5"
  local respaldo; respaldo="$(respaldo_de "$servicio")"
  cp "$respaldo" "$servicio"
  quitar "$servicio" "$viejo" "$nuevo" || { echo "INVÁLIDO: $nombre" | tee -a "$EVIDENCIA"; resultado=1; return; }
  local salida; salida="$(correr_tests "$archivo_test")"
  { echo "===== SIN la mitigación: $nombre ====="; echo "$salida" | grep -E '✓|✕|Tests:'; echo; } >> "$EVIDENCIA"
  if echo "$salida" | grep -q '✕'; then
    echo "OK  — sin '$nombre' los tests de regresión FALLAN (detectan la vulnerabilidad)"
  else
    echo "MAL — sin '$nombre' los tests siguen pasando: no protegen esta mitigación"; resultado=1
  fi
  cp "$respaldo" "$servicio"
}

verificar_sin "AI-SEC-001 · listar con el alcance del actor" "$ORQUESTADOR" \
  "backend/domain/orquestador-atencion/services/OrquestadorAtencionService.test.ts" \
  "await this.djService.listar(actor, { page: 1, pageSize: 100 });" \
  "await this.djService.listar({ userId: docenteId, rol: Rol.DOCENTE }, { page: 1, pageSize: 100 });"

verificar_sin "AI-SEC-002 · verificar dueño de la conversación" "$ORQUESTADOR" \
  "backend/domain/orquestador-atencion/services/OrquestadorAtencionService.test.ts" \
  "if (existente && existente.actorUserId !== actor.userId) {" \
  "if (false) {"

verificar_sin "AI-SEC-005 · no ofrecer la herramienta de escritura sin pedido explícito" "$AGENTE_DJ" \
  "backend/domain/agente-dj/services/AgenteDJService.test.ts" \
  "const herramientas = this.pideTransicion(pregunta)
        ? disponibles
        : disponibles.filter((h) => h.name !== HERRAMIENTA_ESCRITURA_DJ);" \
  "const herramientas = disponibles;"

verificar_sin "AI-SEC-004 · validar la salida contra ecos del prompt" "$AGENTE_DJ" \
  "backend/domain/agente-dj/services/AgenteDJService.test.ts" \
  "return { respuesta: this.sanitizarRespuestaFinal(turno.contenido), traza };" \
  "return { respuesta: turno.contenido ?? 'No tengo una respuesta.', traza };"

verificar_sin "AI-SEC-007 · filtrar credenciales y correos externos en la salida" "$TRAMITES" \
  "backend/domain/tramites-dpa/services/TramiteToolsService.test.ts" \
  "return { requisitos: sanearLista(t.requisitos), fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento } };" \
  "return { requisitos: t.requisitos, fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento } };"

restaurar_todo
trap - EXIT
salida_orq="$(correr_tests "backend/domain/orquestador-atencion/services/OrquestadorAtencionService.test.ts")"
salida_agente="$(correr_tests "backend/domain/agente-dj/services/AgenteDJService.test.ts")"
salida_tramites="$(correr_tests "backend/domain/tramites-dpa/services/TramiteToolsService.test.ts")"
{
  echo "===== CON todas las mitigaciones (código actual) ====="
  echo "$salida_orq" | grep -E '✓|✕|Tests:'
  echo "$salida_agente" | grep -E '✓|✕|Tests:'
  echo "$salida_tramites" | grep -E '✓|✕|Tests:'
} >> "$EVIDENCIA"
if echo "$salida_orq$salida_agente$salida_tramites" | grep -q '✕'; then
  echo "MAL — con las mitigaciones los tests fallan"; resultado=1
else
  echo "OK  — con las mitigaciones los tests de regresión PASAN"
fi

echo "Evidencia: $EVIDENCIA"
exit $resultado
