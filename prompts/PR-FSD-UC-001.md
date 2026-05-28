# PR-FSD-UC-001 — Autenticación JWT + LDAP + Bloqueo (Prompt Contract)

| Campo | Valor |
|-------|-------|
| FSD | FSD-UC-001 |
| Skill | `docs/SKILLS/auth-rbac-guard.md` |
| Detalle | `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` §3 PR-FSD-UC-001 |

## Task (resumen)

Autenticar email+password; RB-07 bloqueo 5 intentos / 15 min; JWT 8h sin PII.

## Métricas Antes vs Después

| Métrica | Antes | Después |
|---------|-------|---------|
| User enumeration en errores | Posible | Mensaje genérico INVALID_CREDENTIALS |
| password en logs | Riesgo | 0 (Ley 164) |
