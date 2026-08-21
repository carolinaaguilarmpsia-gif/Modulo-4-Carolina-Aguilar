# PR-IMPL-003 — Dominio de Autenticación y Roles (Prompt de Implementación)

| Campo | Valor |
|-------|-------|
| FSD-UC | FSD-UC-001 |
| Design Doc | `DD-UC-002` |
| PRD | PRD-REQ-001, PRD-REQ-011 |
| Skill | `docs/SKILLS/auth-rbac-guard.md` |
| Reglas | RB-07 (ver corrección de ID en `DD-UC-002` §1) |
| NFRs | NFR-006 (sesión ≤ 8h), NFR-010 (cobertura ≥ 80%) |
| Diagramas | `docs/DIAGRAMS/seq_uc001_autenticacion.mmd` |
| Release | `release/3.0.0` |
| Estado | **ejecutado** — 8/8 tests pasando, 100 % cobertura de `backend/domain/administracion/` |

## Role

Eres el implementador del núcleo de dominio (hexagonal, sin frameworks) del módulo de Autenticación del SGAI, siguiendo `DD-UC-002` y el DTI vFinal §5, §13.2.

## Task

1. Definir la entidad `Usuario` (`id, email, passwordHashLocal, rol, facultadId, vinculacionActiva, intentosFallidos, bloqueadoHasta`) y los tipos `LoginCommand { email, password, ip }`, `JwtPayload { userId, email, rol, facultadId, iat, exp }`.
2. Implementar `AutenticarUsuarioService.autenticar(command: LoginCommand): Promise<{ token, rol, nombreCompleto, facultadId }>` orquestando: verificación de bloqueo, intento LDAP, fallback bcrypt, registro de intentos, emisión de JWT.
3. Definir los puertos de salida `IUsuarioRepository`, `ILdapAuthenticator`, `IPasswordHasher`, `IJwtSigner` y el puerto de entrada `AutenticarUsuarioUseCase`.
4. Extender la jerarquía de errores de dominio (reusar `DomainError` de `backend/domain/shared/errors/`) con `UnauthorizedError` (401 `INVALID_CREDENTIALS`) y `ForbiddenError('ACCOUNT_LOCKED')`.
5. Escribir tests unitarios cubriendo RB-07 (bloqueo al 5º intento) y el fallback LDAP→bcrypt.

## Context

- `domain/` no puede importar `jsonwebtoken`, `bcrypt`, `ldapjs` ni ningún framework (invariante hexagonal, ADR-0001) — todo pasa por los 4 puertos de salida.
- Mensaje de error de login **siempre genérico** ("Usuario o contraseña incorrectos") — nunca revelar si falló el email o el password (RB-07, skill `auth-rbac-guard.md`).
- `JwtPayload` nunca incluye `ci`, `password`, `password_hash` ni datos financieros (Ley 164).
- El bloqueo es de 15 minutos tras 5 intentos fallidos consecutivos; se resetea `intentosFallidos` en un login exitoso.

## Reasoning

1. Buscar `Usuario` por email vía `IUsuarioRepository.findByEmail()`; si no existe, tratar igual que credencial inválida (no revelar existencia de la cuenta).
2. Si `bloqueadoHasta` es futuro → `ForbiddenError('ACCOUNT_LOCKED')` sin intentar validar password.
3. Intentar `ILdapAuthenticator.bind(email, password)` con timeout de 5 s (DTI §7.2).
4. Si LDAP responde "no disponible"/timeout → fallback: `IPasswordHasher.compare(password, usuario.passwordHashLocal)`.
5. Si la validación (LDAP o bcrypt) falla → `IUsuarioRepository.registrarIntentoFallido()`; si `intentosFallidos` llega a 5 → setear `bloqueadoHasta = now + 15min` y devolver `UnauthorizedError('INVALID_CREDENTIALS')`.
6. Si la validación es exitosa → resetear `intentosFallidos`, `IJwtSigner.sign({ userId, email, rol, facultadId })` con expiración 8 h (NFR-006), devolver payload de salida.

## Stop Condition

- 401 `INVALID_CREDENTIALS` (mensaje genérico, sin distinguir causa).
- 403 `ACCOUNT_LOCKED`.
- Detener si se detecta un import de `jsonwebtoken`/`bcrypt`/`ldapjs` dentro de `domain/` — violación del invariante hexagonal.
- Detener si el mensaje de error expone si falló el email o el password.

## Output

- `backend/domain/administracion/entities/Usuario.ts`
- `backend/domain/administracion/types/{LoginCommand,JwtPayload}.ts`
- `backend/domain/administracion/services/AutenticarUsuarioService.ts`
- `backend/domain/administracion/ports/in/AutenticarUsuarioUseCase.ts`
- `backend/domain/administracion/ports/out/{IUsuarioRepository,ILdapAuthenticator,IPasswordHasher,IJwtSigner}.ts`
- `backend/domain/administracion/services/AutenticarUsuarioService.test.ts`

## Invariants

- `domain/` cero dependencias de infraestructura (ADR-0001).
- RB-07: exactamente 5 intentos fallidos consecutivos → bloqueo 15 minutos.
- NFR-006: JWT expira a las 8 horas, nunca más.
- Cobertura de `backend/domain/administracion/` ≥ 80 % (NFR-010) antes de dar por cerrado este prompt — **no 90 %**, ver nota de `DD-UC-002` §6.

## Trazabilidad

`FSD-UC-001` → `DD-UC-002` §2, §5 → `PR-IMPL-003` → `backend/domain/administracion/**` → `AutenticarUsuarioService.test.ts` → `docs/product/DTP.md` §A.3.

## Métricas (Antes vs Después)

| Métrica | Antes | Después |
|---------|-------|---------|
| Cobertura `domain/administracion/` | 0 % (solo `Rol.ts`, sin tests) | **100 %** (statements/branches/funcs/lines) — verificado con `npm run test:domain:auth --coverage` |
| Dependencias externas en `domain/administracion` | — | 0 (confirmado por revisión de imports) |
