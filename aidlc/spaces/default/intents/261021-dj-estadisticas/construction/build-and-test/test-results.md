# Resultados de build y pruebas

## Build

No hay script de build en el backend; ts-jest compiló todos los archivos al ejecutar las pruebas sin errores de tipos. El chequeo global `tsc -p backend` falla por una configuración previa (`rootDir`), sin relación con este cambio.

## Pruebas ejecutadas

Ejecutadas en esta etapa desde la raíz del repositorio:

| Comando | Resultado |
|---------|-----------|
| `NODE_OPTIONS=--experimental-vm-modules npx jest backend/domain/declaracion-jurada backend/api/dj.estadisticas.test.ts --watchman=false` | 4 archivos pasan; 31 pruebas pasan, 0 fallan |
| `NODE_OPTIONS=--experimental-vm-modules npx jest backend --watchman=false` | 20 archivos pasan; 132 pruebas pasan, 2 omitidas (ya omitidas antes), 0 fallan |

Pruebas nuevas de esta unidad: 14 (9 del servicio, 5 HTTP). Archivos nuevos: `DeclaracionJuradaService.estadisticas.test.ts` y `dj.estadisticas.test.ts`.

## Fallas

Ninguna.

## Cobertura

No se configuró reporte de cobertura (el alcance express no impone un umbral). Cada requisito FR/NFR tiene al menos una prueba, según `cross-unit-traceability.md`.

## Matriz de verificación de objetivos

Ver `## Target Verification Matrix` en `build-and-test-summary.md`.
