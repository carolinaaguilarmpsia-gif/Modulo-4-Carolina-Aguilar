# Technology Stack

| Tecnología | Versión | Uso | Fuente |
|---|---|---|---|
| Node.js | 20 (imagen `node:20-slim`) | Runtime | `backend/Dockerfile` |
| TypeScript | ^5.4.0 | Lenguaje (strict, ES2022, NodeNext) | `backend/package.json`, `tsconfig.json` |
| tsx | ^4.19.0 | Ejecuta TypeScript (`dev`, `start`, Docker) | `backend/package.json` |
| Express | ^4.21.1 | Servidor HTTP | `backend/package.json` |
| zod | ^3.25.0 | Validación de entrada | `backend/package.json` |
| jsonwebtoken | ^9.0.3 | JWT HS256 | `backend/package.json` |
| bcryptjs | ^3.0.3 | Hash de contraseñas | `backend/package.json` |
| cors | ^2.8.5 | CORS por entorno | `backend/package.json` |
| express-rate-limit | ^8.5.2 | Límite en login | `backend/package.json` |
| @modelcontextprotocol/sdk | ^1.30.0 | Servidor/cliente MCP en proceso | `backend/package.json` |
| Jest | ^29.7.0 | Pruebas (declarado en la raíz) | `package.json` raíz |
| ts-jest | ^29.2.5 | Transformación ESM de TypeScript | `package.json` raíz |
| supertest | ^7.2.2 | Pruebas HTTP | `package.json` raíz |
| ajv | ^8.20.0 | Validación de contratos JSON Schema en pruebas | `package.json` raíz |

## Módulo y compilación
- `"type": "module"` (ESM); `module` y `moduleResolution` en `NodeNext`; los imports llevan sufijo `.js`.
- `rootDir: "."`, `outDir: dist`; `include` abarca `domain`, `infrastructure`, `api` y `../demo/dj-core`.

## Persistencia y servicios externos
- DJ y usuarios: en memoria con semilla; trámites y conversaciones: archivos JSON en `backend/data/`.
- IA: Groq, Ollama (embeddings y LLM) y Gemini (adaptador sin uso); configuración por `.env` (`GROQ_API_KEY`, `OLLAMA_HOST`, `JWT_SECRET`, `CORS_ORIGINS`, `LLM_TIMEOUT_MS`, `AUTH_RATE_LIMIT_MAX`, `IA_HABILITADA`).

## Despliegue
- Docker (`backend/Dockerfile`), puerto 3001, arranque `node --import tsx api/server.ts`.
