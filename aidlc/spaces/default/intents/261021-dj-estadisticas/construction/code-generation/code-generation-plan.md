# Plan de generación de código — GET estadísticas de DJ

## Summary

- Builds: el endpoint `GET /api/v1/declaraciones-juradas/estadisticas` (conteo de DJ por estado, con alcance por rol).
- Touches: `DeclaracionJuradaService`, `CrearDJ.ts` (tipo), `dj.controller.ts`, `dj.routes.ts` y dos archivos de prueba nuevos.
- Tests: unas 11 pruebas (servicio y HTTP con supertest), una por requisito más los casos de error.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "express",
  "test_strategy": "minimal",
  "project_type": "brownfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:c8f84e35190e007d9863fad236154d0269ab9bf633fc2a3ff106ed965ba4a9b9",
  "contract_sha256": "sha256:bb76c1b22f8307be6e5780d50cabab891684449d5b164bd0e825e9e4e5c61e5b"
}
```

## Pasos

Metodología: test-after (valor por defecto del alcance express). Cada paso cita el requisito que cubre.

- [x] Step 1: Tipo `EstadisticasDJ` (`porEstado` con los 6 estados + `total`) en `backend/domain/declaracion-jurada/types/CrearDJ.ts`. Cubre FR2, FR2.1, FR2.2.
- [x] Step 2: Método `estadisticas(actor, facultadId?)` en `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.ts`. Cubre FR3, FR3.1, FR3.2, FR3.3, FR4, FR4.1, FR4.2, FR4.3, FR5, NFR1, NFR4.
  - Alcance: DOCENTE solo sus DJ; ADMIN_FACULTAD solo su facultad; TECNICO_DPA y ADMIN_SISTEMA todas y filtro opcional por `facultadId`.
  - ADMIN_FACULTAD pide facultad ajena: `ForbiddenError('INSUFFICIENT_ROLE')`.
  - ADMIN_FACULTAD sin `facultadId` en sesión: `ForbiddenError('INSUFFICIENT_ROLE')` (no ampliar alcance).
  - Contar con `repository.list` y página grande (sin cambiar el puerto), siempre con los 6 estados en 0 por defecto.
- [x] Step 3: Acción `estadisticas` en `backend/api/controllers/dj.controller.ts`: lee `facultadId` de la query, llama al servicio y responde `{ porEstado, total, correlationId }`. Cubre FR2, NFR2.
- [x] Step 4: Ruta `GET /estadisticas` en `backend/api/routes/dj.routes.ts`, declarada ANTES de `GET /:id`. Cubre FR1, FR1.1, NFR3.
- [x] Step 5: Pruebas unitarias del servicio en `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.estadisticas.test.ts` (repositorio en memoria con filtros reales). Cubre FR2.1, FR2.2, FR3.x, FR4.x, FR5.
- [x] Step 6: Prueba HTTP con supertest en `backend/api/dj.estadisticas.test.ts` (Express propio + router real, como `orquestador.atender.contract.test.ts`). Cubre FR1, FR1.1, FR2, FR4.2, FR5, NFR1, NFR3.
- [x] Step 7: Configuración de pruebas: verificar que `jest.config.cjs` ya cubre `backend/api/**/*.test.ts` y `backend/domain/**/*.test.ts` (no requiere cambios).
- [x] Step 8: Documentación en línea: JSDoc con `@see FSD-UC-002` y `@see RB-05` en el método y la acción nuevos.
