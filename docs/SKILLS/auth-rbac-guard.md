# Skill: Auth RBAC Guard — Autenticación y Control de Acceso

> **Cuándo usar:** Al implementar login, JWT, middleware de roles, bloqueo de cuenta (RB-07) o cualquier endpoint que requiera `authenticate` / `requireRole`.

---

## Identidad

```yaml
skill_id: auth-rbac-guard
versión: v1.0
dominio: administracion / auth
bounded_context: backend/domain/administracion/ + infrastructure/auth/
casos_uso: FSD-UC-001
reglas: [RB-07]
prompt_contract: PR-FSD-UC-001
diagrama: docs/DIAGRAMS/seq_uc001_autenticacion.mmd
```

---

## Procedimiento de ejecución

1. Leer `PR-FSD-UC-001` en `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md`.
2. Implementar **solo** en `infrastructure/auth/` (JWT, LDAP, bcrypt) y `api/middleware/`.
3. El dominio expone `AutenticarUsuarioUseCase` — sin imports de `jsonwebtoken` en `domain/`.
4. Añadir middleware global: `correlationId` → `authenticate` (rutas protegidas) → `requireRole([...])`.
5. Login: mensaje genérico en fallo; incrementar `intentos_fallidos` en transacción; bloquear 15 min si ≥ 5 (RB-07).
6. JWT payload: `{ userId, email, rol, facultadId }` — **nunca** PII financiero ni `ci`.
7. Escribir tests: credenciales inválidas, bloqueo tras 5 intentos, rol insuficiente → 403.

---

## MUST

```
MUST usar bcrypt cost factor ≥ 12
MUST expiración JWT ≤ 8 horas (NFR-006)
MUST rate limit en POST /auth/login (express-rate-limit)
MUST verificar bloqueado_hasta antes de validar password
MUST retornar 401 genérico (no revelar si falló email o password)
MUST incluir correlationId en respuestas de error
```

## MUST NOT

```
MUST NOT almacenar JWT en localStorage (frontend) — memoria o httpOnly cookie
MUST NOT incluir password ni password_hash en logs
MUST NOT omitir requireRole en endpoints administrativos
```

---

## Matriz rol → endpoints (resumen)

| Rol | Acceso típico |
|-----|----------------|
| DOCENTE | DJ propias, horario, boletas propias, perfil propio |
| ADMIN_FACULTAD | DJ/oferta de su facultad, roles docentes misma facultad |
| TECNICO_DPA | Bandeja oferta, reportes, lectura DJ institucional |
| ADMIN_SISTEMA | `/admin/*`, usuarios, materias, calendario institucional |

---

## Checklist de salida

- [ ] `correlationIdMiddleware` registrado antes de rutas
- [ ] `authRateLimit` en POST `/auth/login`
- [ ] RB-07 probado con test de 6º intento → 429
- [ ] `helmet()` y `app.disable('x-powered-by')` en `api/app.ts`
- [ ] Sin secretos hardcodeados; `validateEnvOnStartup()` al boot
