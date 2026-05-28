# ADR-0001: Monolito modular con arquitectura hexagonal (Node.js 20 + PostgreSQL 15)

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0001 |
| Título | Monolito modular con arquitectura hexagonal |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** |
| Alcance | Todo el SGAI — núcleo de dominio y API v1.0 |
| Stakeholders consultados | Unidad de TI, Director DPA |

### 1. Contexto

El SGAI debe digitalizar 10 casos de uso críticos (FSD-UC-001–010) con reglas RB-01–RB-07, equipo reducido (G01 unipersonal), presupuesto CAPEX ≤ USD 45.000 y operación on-premise en Sprint 1. Se requiere transacciones ACID en máquinas de estado (DJ, Oferta) y dominio testeable sin acoplar Express/Prisma.

**Fuerzas en tensión:** velocidad de entrega vs. escalabilidad horizontal; simplicidad operativa vs. microservicios; tipado fuerte vs. curva de aprendizaje del equipo.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. Monolito modular hexagonal | Un despliegue; `$transaction` nativo; dominio puro; ADR-0001 alineado a NFR-010 | Escala vertical; acoplamiento de release único | Bajo (VM existente) |
| B. Microservicios por BC | Escala independiente; equipos paralelos | Complejidad operativa; sagas; costo K8s/AWS | Alto |
| C. Serverless (Lambda) | Pago por uso | Cold start; stateful difícil; lock-in | Medio-alto |

### 3. Decisión

> **Elegimos la alternativa A:** monolito modular con capas `api/` → `domain/` ← `infrastructure/`, TypeScript strict, Express 4, Prisma 5, PostgreSQL 15.

Criterios decisivos: presupuesto TI, RB-06 atómico en una BD, cobertura de dominio ≥ 80 % (NFR-010), y Unidad de TI sin expertise Kubernetes.

### 4. Consecuencias

#### 4.1 Positivas

- Un pipeline CI/CD y un artefacto Docker Compose.
- Reglas de negocio centralizadas en `domain/` sin fugas a controllers.

#### 4.2 Negativas / costos

- Extracción futura de worker/notificaciones requiere ADR nueva (ver ADR-0006).
- Pico de carga limitado por escala vertical del API.

#### 4.3 Neutras

- Patrón ports/adapters facilita extraer adaptadores legados (ADR-0002).

### 5. Impacto en el sistema

- **Código:** `backend/domain/*`, `backend/api/*`, `backend/infrastructure/*`
- **Operaciones:** un contenedor `sgai-api` + worker opcional
- **Seguridad:** RBAC en middleware; dominio sin PII en logs
- **Equipo:** Node/TS/Prisma — stack del curso y documentación existente
- **Costo:** sin incremento de licencias cloud en v1.0

### 6. Plan de reversión

- Señal: p95 > 2 s sostenido con > 200 VUs pese a índices y caching.
- Reversión: extraer módulo más caliente tras POC-02 y ADR-0006; costo estimado 3–4 sprints.

### 7. Validación

- POC-02 (concurrencia DJ + historial atómico).
- Tests Jest dominio ≥ 80 % en módulos DJ y Oferta.

### 8. Trazabilidad

| ID | Enlace |
|----|--------|
| FSD-UC-002 | Máquina de estados DJ |
| NFR-001, NFR-010 | Latencia y cobertura |
| DTI | §5 Arquitectura Hexagonal |
