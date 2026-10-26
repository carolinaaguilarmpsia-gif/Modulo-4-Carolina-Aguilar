# Contrato OpenAPI de SGAI

El contrato es `openapi.json` (raíz del repositorio, OpenAPI 3.0.3). **Se genera desde el código** y no se edita a mano.

## De dónde sale

| Parte | Dónde |
|---|---|
| Cuerpos y parámetros de entrada | Los mismos esquemas Zod que valida la API: `backend/api/validators/*` |
| Enums (roles, estados, roles institucionales) | Los tipos del dominio: `backend/domain/**` |
| Respuestas, errores y descripciones | `backend/api/openapi/document.ts` |
| Caso de uso del FSD de cada operación | Campo `x-fsd-uc` |

## Comandos

```bash
npm run openapi:export   # genera openapi.json
npm run openapi:check    # falla si el archivo versionado difiere del código (drift)
npm run openapi:lint     # Spectral (spectral:oas + una regla propia de trazabilidad con el FSD)
```

## Las cuatro comprobaciones en CI (`.github/workflows/contract.yml`)

| # | Comprobación | Herramienta | Pregunta que responde |
|---|---|---|---|
| 1 | Drift | `npm run openapi:export` + `git diff --exit-code` | ¿El archivo versionado es el que genera el código? |
| 2 | Lint | Spectral | ¿El contrato está bien escrito? |
| 3 | Cambios incompatibles | oasdiff, solo en pull request | ¿Este PR rompe a los clientes frente a la rama base? |
| 4 | Conformidad | Schemathesis contra la API levantada | ¿La API cumple lo que declara? |

Además, `backend/api/openapi.contract.test.ts` comprueba que toda ruta montada en Express está declarada y que toda ruta declarada existe.

## Qué encontró Schemathesis y se corrigió

La primera corrida contra la API real dio 37 fallos. Los reales eran estos:

- **JSON inválido devolvía 500.** Ahora responde 400 `INVALID_JSON`.
- **Una ruta inexistente devolvía la página HTML de Express.** Ahora responde 404 `NOT_FOUND` en JSON, con `correlationId`.
- **`GET /declaraciones-juradas?page=0` se aceptaba.** Ahora responde 422, igual que un `estado` inexistente.
- **El contrato prometía menos de lo que la API acepta o devuelve:** `camposFormulario` no puede venir vacío, y el asistente de trámites puede devolver `camino` y `fuente` en `null`. El contrato se corrigió.

Tras las correcciones: 1250 casos generados, todos correctos.

## Comprobaciones de Schemathesis desactivadas, y por qué

- `unsupported_method`: Express responde 404 y no 405 a un método no declarado. Está anotado como mejora.
- `positive_data_acceptance`: hay reglas de negocio (rol, facultad) que rechazan datos válidos según el esquema, por ejemplo `GET /perfil-docente` sin `docenteId` para el Admin. Sistema.

## Decisiones pendientes

- El formato de error es `{ error, message, correlationId }`. La S05 recomienda RFC 9457 (`application/problem+json`); no se adoptó en esta entrega.
- Los repositorios son en memoria, así que no hay migraciones ni semilla de base de datos en el job de conformidad.

