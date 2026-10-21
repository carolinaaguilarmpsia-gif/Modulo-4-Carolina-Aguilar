# Business Overview

## Propósito del sistema

SGAI es un sistema de gestión de declaraciones juradas (DJ) de docentes universitarios (contexto boliviano: universidad, facultades, DPA). Un docente redacta una DJ (tipos `LABORAL`, `PATRIMONIAL`, `INTERESES`), la envía a revisión y pasa por la facultad y, si corresponde, por la DPA hasta quedar `APROBADA` o `RECHAZADA`. Evidencia: `backend/domain/declaracion-jurada/` y `backend/api/validators/dj.validator.ts`.

## Actores y roles

Definidos en `backend/domain/administracion/types/Rol.ts`:

| Rol | Alcance sobre las DJ |
|---|---|
| `DOCENTE` | Solo sus propias DJ |
| `ADMIN_FACULTAD` | Solo DJ de su facultad (RB-05) |
| `TECNICO_DPA` | Todas |
| `ADMIN_SISTEMA` | Todas |

## Funcionalidad clave

- Crear, listar, ver detalle y editar campos de una DJ (solo en `BORRADOR`, RB-03).
- Transicionar el estado con comandos `ENVIAR`, `APROBAR`, `DEVOLVER`, `ESCALAR_DPA`, `REENVIAR`, `RECHAZAR` (máquina de estados `DJStateMachine`), con historial y notificación post-commit.
- Autenticación con JWT y RBAC (`requireRole`).
- Capacidades de IA ajenas a esta intención: asistente de consulta de DJ, asistente de trámites DPA (RAG con Ollama), agente DJ vía MCP y orquestador de atención.

## Estados de una DJ

`BORRADOR`, `EN_REVISION_FACULTAD`, `APROBADA`, `DEVUELTA`, `EN_REVISION_DPA`, `RECHAZADA` (terminales: `APROBADA`, `RECHAZADA`). Fuente: `EstadoDJ.ts`.

## Reglas de negocio relevantes para la intención

- RB-01: el docente debe tener vinculación activa para crear DJ.
- RB-05: un Admin. Facultad solo opera sobre su facultad (en `docs/.cursor/rules/sgai-domain.mdc`, fuera del alcance escaneado).
- Un docente no debe ver datos ajenos (`assertPuedeVer` en `DeclaracionJuradaService`).

## Intención activa

Agregar `GET .../estadisticas`: conteo de DJ por estado, con alcance según el rol (ver `feature.md`). Hoy no existe ningún endpoint de agregados; solo `list` paginado.

## Sources
- `backend/domain/declaracion-jurada/types/EstadoDJ.ts`, `backend/domain/administracion/types/Rol.ts`
- `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.ts`
- `feature.md`
