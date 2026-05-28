# ADR-0003: Autenticación JWT stateless con integración LDAP/AD institucional

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0003 |
| Título | JWT stateless + LDAP/AD |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** |
| Alcance | FSD-UC-001, RB-04, RB-07 |

### 1. Contexto

1.500+ usuarios con directorio LDAP existente. RB-07 exige bloqueo tras 5 intentos. RB-04 exige `docenteId` desde JWT. NFR-006: sesión ≤ 8 h. Ley 164: sin PII en JWT.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| A. JWT HS256 + LDAP + fallback bcrypt | Sin estado en servidor; LDAP institucional | Revocación antes de exp |
| B. Sesiones en Redis | Revocación inmediata | Servidor de estado extra |
| C. OAuth2 externo | Estándar | No disponible en piloto |

### 3. Decisión

> **Elegimos A** con `expiresIn: 8h`, bcrypt cost ≥ 12, payload `{ userId, email, rol, facultadId }`.

### 4. Consecuencias

**Positivas:** alineado a `auth-rbac-guard.md` y PR-FSD-UC-001. **Negativas:** blacklist opcional v2.0. **Seguridad:** rate limit login; mensaje genérico INVALID_CREDENTIALS.

### 5. Impacto

`infrastructure/auth/`, middleware Express, `.cursor/rules/security-ley164.mdc`

### 6. Validación

Tests Supertest login; k6 20 req/15 min por IP.

### 8. Trazabilidad

PRD-US-018, FSD-UC-001, NFR-006, NFR-007
