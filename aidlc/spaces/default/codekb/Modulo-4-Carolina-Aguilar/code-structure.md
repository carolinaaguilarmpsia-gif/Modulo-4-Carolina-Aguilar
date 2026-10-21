# Code Structure

## Organización de módulos (`backend/`)

| Directorio | Rol | Contenido relevante |
|---|---|---|
| `api/` | Adaptadores HTTP | `app.ts` (composición), `server.ts`, `shutdown.ts`, `routes/`, `controllers/`, `middleware/`, `validators/`, `contracts/` |
| `domain/declaracion-jurada/` | Núcleo de la intención | `services/` (servicio y máquina de estados), `ports/out/`, `types/`, `entities/` |
| `domain/administracion/` | Autenticación y roles | `types/Rol.ts`, `types/JwtPayload.ts`, servicio de autenticación |
| `domain/shared/errors/` | Errores comunes | `DomainError.ts` |
| `domain/{asistente-ia,tramites-dpa,agente-dj,orquestador-atencion}/` | Funcionalidad de IA | fuera del foco |
| `infrastructure/persistence/` | Repositorios | `InMemoryDeclaracionJuradaRepository`, `InMemoryUsuarioRepository`, semillas, repositorios JSON |
| `infrastructure/{auth,config,ai,mcp,notifications}/` | Adaptadores | JWT, bcrypt, CORS, clientes LLM, servidor MCP |
| `data/`, `scripts/`, `docs/` | Datos y utilidades | `db.json`, `conversaciones.json`, demos |

## Clasificación de archivos relevantes

- Rutas: `api/routes/dj.routes.ts` (patrón `createXRouter(controller, jwtSigner, usuarios)`).
- Controlador: `api/controllers/dj.controller.ts` (propiedades flecha, `AuthenticatedRequest`).
- Validadores: `api/validators/dj.validator.ts` (zod; `validateBody` y `ListDjQuerySchema` sin uso).
- Servicio: `domain/declaracion-jurada/services/DeclaracionJuradaService.ts`.
- Puerto: `domain/declaracion-jurada/ports/out/IDeclaracionJuradaRepository.ts`.
- Tipos: `types/EstadoDJ.ts`, `types/CrearDJ.ts` (`ActorContext`, `ListarDJQuery`).
- Infraestructura: `infrastructure/persistence/InMemoryDeclaracionJuradaRepository.ts`.
- Pruebas: archivos `*.test.ts` junto al código.

## Patrones de código

- Imports con extensión `.js` (NodeNext) y `import type` para tipos.
- Inyección por constructor; sin contenedor de DI.
- Controladores sin lógica de negocio; el servicio lanza `DomainError`.
- Enumeraciones TypeScript (`EstadoDJ`, `Rol`) como fuente canónica de valores.
- Comentarios y mensajes en español, con referencias `@see` a RB/FSD.

## Convenciones de pruebas

Prueba colocada junto al archivo, dobles manuales (por ejemplo `FakeDJRepository`) en lugar de mocks de módulo; pruebas HTTP con `express()` propio y `supertest`. Ver `code-quality-assessment.md`.
