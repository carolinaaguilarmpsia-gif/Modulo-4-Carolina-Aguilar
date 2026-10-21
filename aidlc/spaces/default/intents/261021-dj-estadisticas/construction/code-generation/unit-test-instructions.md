# Instrucciones de pruebas — GET estadísticas de DJ

## Marco de pruebas

Jest 29 + ts-jest, ejecutado desde la raíz del repositorio (`backend/package.json` no tiene script `test`). La configuración `jest.config.cjs` ya cubre `backend/api/**/*.test.ts` y `backend/domain/**/*.test.ts`, así que no hace falta configuración nueva.

## Cómo correr las pruebas de esta unidad

Pruebas del servicio:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest backend/domain/declaracion-jurada/services/DeclaracionJuradaService.estadisticas.test.ts --watchman=false
```

Pruebas HTTP del endpoint:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest backend/api/dj.estadisticas.test.ts --watchman=false
```

Regresión del servicio existente (debe seguir en verde):

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest backend/domain/declaracion-jurada/services/DeclaracionJuradaService.test.ts --watchman=false
```

## Cobertura esperada (estrategia Minimal)

Una prueba por requisito, con un mínimo feliz por componente: aproximadamente 11 pruebas.

| Requisito | Prueba |
|-----------|--------|
| FR2.1, FR2.2 | los 6 estados siempre presentes con 0 y `total` correcto |
| FR3.1 | DOCENTE solo cuenta sus DJ |
| FR3.2 | ADMIN_FACULTAD solo cuenta su facultad |
| FR3.3, FR4.1 | TECNICO_DPA cuenta todo y filtra por `facultadId` |
| FR4.2 | ADMIN_FACULTAD con facultad ajena recibe 403 `INSUFFICIENT_ROLE` |
| FR4.3 | DOCENTE ignora `facultadId` |
| FR5 | ADMIN_FACULTAD sin facultad en sesión recibe 403 |
| FR1, FR1.1 | HTTP: 200 con la forma esperada y 401 sin token |
| FR1 | HTTP: `/estadisticas` no se confunde con `/:id` |

## Dobles y datos de prueba

- Servicio: `InMemoryDeclaracionJuradaRepository` sembrado con DJ de 2 facultades y 3 docentes (sus filtros son reales).
- HTTP: Express propio con el router real, un `IJwtSigner` y un `IUsuarioRepository` falsos; no se importa `app.ts` (carga `.env` y crea todo el grafo).
