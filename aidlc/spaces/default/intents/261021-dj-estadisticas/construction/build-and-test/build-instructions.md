# Instrucciones de build — GET estadísticas de DJ

## Dependencias

Desde la raíz del repositorio:

```bash
npm install
```

## Entorno

No requiere variables de entorno nuevas. Las pruebas del endpoint no cargan `.env`: usan un Express propio y repositorios en memoria.

## Comandos de compilación

El backend no tiene script `build`; TypeScript se compila al vuelo con ts-jest al correr las pruebas. No se agregó ningún script de build.

## Verificación

Pruebas de esta unidad:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest backend/domain/declaracion-jurada/services/DeclaracionJuradaService.estadisticas.test.ts backend/api/dj.estadisticas.test.ts --watchman=false
```

Suite completa del backend:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest backend --watchman=false
```

## Problemas conocidos

- `npx tsc --noEmit -p backend` falla con TS6059 porque `backend/tsconfig.json` incluye `../demo/dj-core/**/*`, fuera de `rootDir`. Ya ocurría antes de este cambio y no involucra archivos de esta unidad.
- ts-jest muestra el aviso TS151002 sobre `isolatedModules`; ya existía y no afecta los resultados.
