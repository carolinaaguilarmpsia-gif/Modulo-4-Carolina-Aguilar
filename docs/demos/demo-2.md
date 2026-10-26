# Demo 2 — release/8.2.0

**Equipo:** DPA · **Producto:** SGAI — Sistema de Gestión Académica Integral · **Fecha de la demo:** lunes 26 de octubre de 2026

## 1. Funcionalidades por integrante

| Integrante | Funcionalidades (tamaño) | Caso de uso del FSD | Repositorio |
|---|---|---|---|
| Carolina Aguilar | 1. Roles institucionales de docentes (pequeña) | FSD-UC-009 | https://github.com/carolinaaguilarmpsia-gif/Modulo-4-Carolina-Aguilar/tree/release/8.2.0 |
| | 2. Perfil y CV docente (pequeña) | FSD-UC-006 | |
| | 3. Calendario académico (pequeña) | FSD-UC-008 | |
| | Contrato OpenAPI generado desde el código y su flujo de CI (parte del grupo, a cargo de Carolina) | Transversal | |

Proyecto unipersonal: el release reúne solo el trabajo de Carolina Aguilar.

## 2. Criterios de aceptación y endpoints

Los criterios completos están en `docs/product/FSD.md` (UC-L-04, UC-L-05 y UC-L-06). Todos los endpoints están declarados en `openapi.json`.

### FSD-UC-009 · Roles institucionales de docentes
Endpoint: `PATCH /api/v1/admin/docentes/{id}/rol-institucional`

- Un Admin. Facultad asigna un rol (`AUTORIDAD`, `INVESTIGADOR` o `ADMINISTRATIVO`) a un docente de su facultad; el rol queda guardado y la auditoría registra actor y fecha en la misma transacción (RB-05, RB-06).
- Si el docente es de otra facultad: 403 `CROSS_FACULTY_FORBIDDEN`.
- Un rol que no existe: 422.
- `null` revoca el rol. El Admin. Sistema puede gestionar a cualquier docente.

### FSD-UC-006 · Perfil y CV docente
Endpoints: `GET /api/v1/perfil-docente`, `PATCH /api/v1/perfil-docente`, `PATCH /api/v1/perfil-docente/{docenteId}`

- El docente actualiza una sección (`formacion_academica`, `publicaciones` o `experiencia_docente`) con datos válidos: se crea o actualiza el perfil (UPSERT) y se devuelve `updatedAt`.
- Editar el perfil de otro docente: 403 `FORBIDDEN_PROFILE_EDIT` (RB-04).
- Una sección con datos que no cumplen el esquema: 422 con el detalle de campos.
- El Admin. Sistema solo lee; el contenido del CV no se registra en logs (Ley 164).

### FSD-UC-008 · Calendario académico
Endpoints: `GET /api/v1/calendario-academico`, `PUT /api/v1/calendario-academico`

- Un Admin. Facultad publica el calendario de su facultad; los docentes ven sus eventos junto con los institucionales, ordenados por fecha de inicio.
- Publicar en otra facultad: 403 `CROSS_FACULTY_FORBIDDEN` (RB-05).
- Un evento con fecha de fin anterior a la de inicio: 422.

## 3. Contrato OpenAPI y flujo de validación

- **Generado desde el código:** `backend/api/openapi/document.ts` construye el contrato a partir de los mismos esquemas Zod que valida la API y de los tipos del dominio. No se edita a mano.
- **Exportación:** `npm run openapi:export` escribe `openapi.json` en la raíz del repositorio. Incluye los 20 endpoints del producto, con el caso de uso del FSD en `x-fsd-uc`.
- **Flujo de CI:** `.github/workflows/contract.yml`, con las cuatro comprobaciones de la S05 en cada pull request:
  1. **Drift:** exporta `openapi.json` y falla si `git diff --exit-code` muestra diferencias.
  2. **Lint:** Spectral con `.spectral.yaml` (`spectral:oas` más una regla propia de trazabilidad con el FSD), con `--fail-severity=warn`.
  3. **Cambios incompatibles:** oasdiff contra la rama base, solo en pull request.
  4. **Conformidad:** Schemathesis contra la API levantada. Su primera corrida encontró errores reales (JSON inválido devolvía 500, `page=0` se aceptaba); se corrigieron y quedó con 1250 casos correctos.
  - Una prueba de Jest comprueba que toda ruta montada en Express está declarada en el contrato y que toda ruta declarada existe.
- Más detalle: `docs/contrato-openapi.md`.

## 4. Paginación e índices con EXPLAIN (pregunta fija de la demo)

El backend guarda hoy todo en memoria, así que no hay `EXPLAIN` sobre el producto. Se preparó un **prototipo en PostgreSQL 17** con la misma consulta del listado de declaraciones juradas, 300.000 filas, paginación por offset y por cursor, un índice que falta y dos que sobran: `prototipos/postgres-paginacion/` (ejecución: `bash prototipos/postgres-paginacion/run.sh`; explicación y guion en su `README.md`). No está conectado al backend.

## 5. Cómo se comprueba

```bash
npm run openapi:check
npm run openapi:lint
NODE_OPTIONS=--experimental-vm-modules npx jest --watchman=false
```

## 5. Registro

Esta tabla también se registra en Classroom, con el enlace al repositorio de la rama `release/8.2.0`. El aporte del release está en `8.2.0-aportes.md`.
