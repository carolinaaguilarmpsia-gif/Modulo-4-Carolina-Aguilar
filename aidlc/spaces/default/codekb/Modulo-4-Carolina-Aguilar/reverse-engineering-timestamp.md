# Reverse Engineering Timestamp

## Run Record

- Date: 2026-10-21
- Commit: 01398ed1e79f358dd65b79d1b06008e873ffae7e

## Scope of Analysis

```yaml
scope_version: 1
kind: partial
intent: dj-estadisticas
fingerprint: 70ce8739584e17d0ffaae7c8f725c39deaefd748
analyzed:
  paths:
    - backend/
  components:
    - createDjRouter
    - DjController
    - requireRole
    - globalErrorHandler
    - asyncHandler
    - dj.validator
    - DeclaracionJuradaService
    - IDeclaracionJuradaRepository
    - InMemoryDeclaracionJuradaRepository
    - EstadoDJ
    - Rol
    - DomainError
    - JwtSigner
    - Composition root (app.ts)
    - seedDeclaracionesJuradas
shallow:
  paths:
    - backend/domain/asistente-ia/
    - backend/domain/tramites-dpa/
    - backend/domain/agente-dj/
    - backend/domain/orquestador-atencion/
    - backend/infrastructure/ai/
    - backend/infrastructure/mcp/
    - backend/infrastructure/notifications/
    - backend/scripts/
```
