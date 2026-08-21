# Demo — Core de Dominio DJ (FSD-UC-002)

Demostración visual de la máquina de estados **sin Prisma ni Express** en `backend/domain/`.

## Requisitos

- Node.js **20 LTS**
- npm

## Pasos para ejecutar

```bash
# 1. Ir a la carpeta demo
cd demo

# 2. Instalar dependencias (solo tsx + typescript)
npm install

# 3. Ejecutar la demo visual
npm run demo:dj
```

## Qué verás

1. **Escenario exitoso:** `BORRADOR` → `EN_REVISION_FACULTAD` con comando `ENVIAR` (RB-01, RB-06).
2. **RB-01 fallo:** docente sin `vinculacion_activa` → `INACTIVE_BINDING`.
3. **RB-03:** intento de editar campos en `EN_REVISION_FACULTAD` → `FORBIDDEN_TRANSITION`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `backend/domain/declaracion-jurada/services/DJStateMachine.ts` | FSM pura |
| `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.ts` | Orquestación + puertos |
| `demo/dj-core/run-demo.ts` | Runner visual |
| `demo/dj-core/InMemoryDeclaracionJuradaRepository.ts` | RB-06 en memoria |

## Contratos

- `prompts/PR-FSD-UC-002.md`
- `docs/SKILLS/dj-validator.md`
