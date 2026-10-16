# Auditoría 12-factor — DPA

> **Módulo 8 · Actividad de auditoría (parte 1 de 2) · Entrega: domingo 18 de octubre de 2026, 23:59.**
> Este archivo es a la vez **las instrucciones para el asistente de IA** y **la ficha que se entrega**. El asistente lo rellena en su lugar; el grupo lo revisa, responde las preguntas y lo sube a su repositorio.

## Cómo se usa (para el grupo)

1. Copien este archivo a su repositorio como `docs/auditoria/12factor.md`.
2. Creen la etiqueta o rama `release/8.0.0` sobre su rama principal actual (es el estado de partida del módulo) y trabajen sobre ese commit.
3. Abran su asistente con acceso al repositorio (Claude Code, Codex, Cursor u otro) y escríbanle:
   > Sigue las instrucciones de la sección 0 de `docs/auditoria/12factor.md` y rellena ese archivo.
4. Respondan las preguntas que el asistente les haga al final de cada oleada. Pueden contestar en el chat o escribiendo la respuesta directamente en la sección 4.
5. Revisen el resultado, corran ustedes la autoverificación (sección 6) y hagan los commits **cada integrante con su propia cuenta**.

**Si su asistente no tiene acceso al repositorio** (un chat sin herramientas): pídanle que les indique qué comandos correr, córranlos ustedes y péguenle la salida. El resto del proceso es igual.

**Cómo se califica la parte de preguntas:** cada pregunta debe terminar respondida o cerrada como `NO VERIFICABLE` con su motivo. **Si quedan más de 3 preguntas sin responder en este archivo, baja la nota de la actividad.** No saber un dato no es un error; dejar sin respuesta lo que el grupo sí podría averiguar, sí.

---

## 0. Instrucciones para el asistente de IA (no editar esta sección)

**Rol.** Eres el asistente de auditoría de un grupo de maestría que desarrolla un backend. Vas a revisar su repositorio contra seis prácticas 12-factor y a **rellenar este mismo archivo**. No produces otros archivos.

**Reglas que no puedes romper.**
1. **Solo lectura del producto.** No modificas código, configuración ni dependencias del repositorio. El único archivo que editas es este.
2. **No inventas.** Cada estado distinto de `N/A` lleva evidencia comprobable: `ruta/archivo:línea` con el fragmento relevante, o el comando exacto que ejecutaste y las primeras líneas de su salida. Si no puedes comprobar algo, no lo supones: lo preguntas o lo marcas `NO VERIFICABLE` con su motivo.
3. **No copias secretos.** Si encuentras una contraseña, token o clave, reportas la ruta y la línea, **nunca el valor**. No abras ni muestres archivos `.env` ni de claves en el chat.
4. **Todas las comprobaciones aparecen**, una vez cada una (F12-01 a F12-06), aunque el resultado sea negativo. No agregas ni quitas comprobaciones.
5. **Escribes en español** y en frases claras.

**Estados permitidos.** `OK`, `PARCIAL`, `FALLA`, `N/A` (no aplica, con razón) y `NO VERIFICABLE` (no se pudo comprobar, con razón). Mientras trabajas puedes usar `PENDIENTE`, pero **al terminar no puede quedar ninguno**.

**Cómo preguntar sin bloquear.** Cuando te falte un dato que no está en el código (por ejemplo, cómo se despliega en producción):
- Marca la comprobación como `PENDIENTE`, agrega la pregunta a la sección 4 con un número (P1, P2…) y la comprobación a la que afecta, y **continúa con la siguiente**. Nunca te detengas a esperar.
- Al **terminar cada oleada**, muestra al grupo todas las preguntas nuevas juntas, cada una con su número. Si tu herramienta permite preguntas con opciones, úsalas; si no, escríbelas en el chat.
- Si el grupo responde, anota la respuesta en la sección 4 y actualiza la comprobación. Si no responde o no lo sabe, en la oleada 3 cierra la comprobación como `NO VERIFICABLE` y la pregunta como "sin respuesta".
- Pregunta solo lo necesario: **antes de preguntar, búscalo en el repositorio** (README, `docker-compose`, Dockerfile, manifiestos, configuración, scripts).

**Oleadas.** Trabaja en este orden y actualiza la sección 2 al terminar cada una:
- **Oleada 0 · Reconocimiento.** Rellena la sección 1 (commit, stack, carpetas de código, cómo se ejecuta) y escribe en la sección 2 un plan breve: qué carpetas revisarás y qué comandos usarás para cada comprobación. No preguntes nada todavía, salvo que no encuentres el código fuente.
- **Oleada 1 · Evidencia automática.** Ejecuta los comandos de cada comprobación (adáptalos a las carpetas reales del proyecto) y anota la evidencia. No decidas estados aún.
- **Oleada 2 · Juicio.** Con la evidencia, decide el estado de cada comprobación y escribe la observación. Lo que no se pueda decidir sin un dato externo, pregúntalo como se indica arriba. Al terminar, muestra las preguntas.
- **Oleada 3 · Cierre.** Integra las respuestas recibidas; cierra lo que quede sin respuesta como `NO VERIFICABLE`; escribe los hallazgos priorizados (sección 5); marca la autoverificación (sección 6) y rellena el resumen (sección 7). Termina diciendo al grupo cuántas preguntas quedaron sin respuesta.

**Si el proyecto tiene varios servicios** (por ejemplo, un backend en NestJS y otro en Python), evalúa cada comprobación sobre todos y anota la evidencia de cada uno; el estado es el del servicio peor evaluado.

---

## 1. Datos del repositorio (oleada 0)

- **Grupo:** DPA (SGAI — Sistema de Gestión Académica)
- **Repositorio:** https://github.com/carolinaaguilarmpsia-gif/Modulo-6-Carolina-Aguilar (remoto `modulo6`, rama `agent-mcp`)
- **Commit auditado (`release/8.0.0`):** `62da628d8ed4b445ebfaf2027b40049b4e4c52df` (HEAD de `agent-mcp`). **Aviso:** la rama/etiqueta `release/8.0.0` aún no existe y el árbol de trabajo tiene 59 entradas sin commitear; la auditoría se hizo con `git grep` (solo archivos versionados en el commit/índice) y no se modificó ningún archivo del producto.
- **Fecha de la auditoría:** 2026-10-15
- **Stack detectado:** Node.js + TypeScript (ESM, `tsx`) · Express 4 · JWT + bcrypt · `express-rate-limit` · React 18 + Vite (frontend) · Jest, Supertest, Playwright. **No hay base de datos, cola ni caché reales**: usuarios y DJ en memoria (`InMemory*Repository`), catálogo en `db.json`, estado del orquestador en `backend/data/conversaciones.json`. IA: Groq (HTTP), Ollama local (HTTP), Gemini (adaptador sin uso), servidor MCP en proceso.
- **Carpetas de código fuente:** `backend/api`, `backend/domain`, `backend/infrastructure`, `backend/scripts` (excluidas pruebas `*.test.ts`); `frontend/src`.
- **Cómo se ejecuta (verificado):** `npm run dev:api` → `tsx watch api/server.ts` y `npm run start` en `backend/package.json` → `tsx api/server.ts`. Se verificó **por lectura** de `backend/package.json` y `backend/api/server.ts`; **no se levantó el servidor** en esta auditoría.
- **Integrantes y qué revisó cada uno:** Carolina Aguilar → F12-01 a F12-06 (proceso asistido por IA, solo lectura).

## 2. Plan y avance por oleadas

| Oleada | Qué se hizo | Estado |
|--------|-------------|--------|
| 0 · Reconocimiento | Estructura del repo, `package.json`, `.gitignore`, `server.ts`, `app.ts`, búsqueda de Dockerfile/compose (ninguno versionado en `agent-mcp`, `main`, `release/1.0.0` ni `release/2.0.0`). | Hecha |
| 1 · Evidencia | `git grep` de los comandos sugeridos sobre `backend/api`, `domain`, `infrastructure`, `scripts`; historial con `git log --all -S` y `--pickaxe`; `git ls-files`; `check .gitignore`. | Hecha |
| 2 · Juicio | Estados decididos con la evidencia. Datos externos (cómo se despliega, qué se hace con los logs) quedaron como preguntas P1 y P2. | Hecha |
| 3 · Cierre | Respuestas del grupo a P1 y P2 integradas; hallazgos, autoverificación y resumen completados. | Hecha |

## 3. Comprobaciones

### F12-01 · Configuración fuera del código (factor III)

- **Evidencia:**
  - Lectura del entorno: `backend/api/server.ts:5` `const PORT = Number(process.env.PORT ?? 3001)`; `backend/api/app.ts:57` `JWT_SECRET`; `app.ts:91` `IA_HABILITADA`; `authRateLimit.ts:19` `AUTH_RATE_LIMIT_MAX`; `OllamaClient.ts:17-18` y `OllamaEmbeddingsClient.ts:16-17` `OLLAMA_HOST`/`OLLAMA_MODEL`; `GroqClient.ts:14-15`, `GroqAgentClient.ts:53-54` `GROQ_API_KEY`/`GROQ_MODEL`.
  - Valores fijos: `backend/api/app.ts:138-145` lista CORS con `http://localhost:5173/5174` y `127.0.0.1`; `OllamaClient.ts:17` y `OllamaEmbeddingsClient.ts:16` usan `?? 'http://127.0.0.1:11434'` como valor por defecto; `server.ts:8` imprime `http://localhost:${PORT}`.
  - Sin validación al inicio: `GroqClient.ts:14` y `GroqAgentClient.ts:53` usan `process.env.GROQ_API_KEY ?? ''` (arranca con clave vacía); `app.ts:57-61` si falta `JWT_SECRET` genera un secreto aleatorio por proceso y solo emite un `console.warn`.
  - No se encontraron condiciones `if (env === 'production')` en el código (`git grep -nE "NODE_ENV"` sin resultados en `backend/`).
- **Estado:** PARCIAL
- **Observación:** La mayoría de los parámetros se leen del entorno, pero los orígenes CORS están fijos a localhost (no se pueden cambiar por entorno), no hay validación de variables obligatorias al arrancar, y con `JWT_SECRET` ausente el servicio arranca igual con un secreto efímero: con varias instancias o tras un reinicio, los tokens dejan de ser válidos. Además `loadEnvFile` (`backend/infrastructure/config/loadEnv.ts:7-31`) es un parser propio de `.env`.
- **Auditó:** Carolina Aguilar

### F12-02 · Secretos fuera del repositorio y de su historial (factor III)

- **Evidencia:**
  - `git ls-files | grep -E '(^|/)\.env$'` → sin resultados (ningún `.env` versionado).
  - `.gitignore:10-12` ignora `.env`, `.env.local` y `.env.*.local`.
  - `git log --all --oneline -- backend/.env '.env'` → sin resultados (38 commits en todas las ramas).
  - `git log --all -S'gsk_'` y `-S'AIza'` (prefijos de claves de Groq y Google) → sin resultados.
  - `backend/.env.example`: `grep -cE '^(GROQ_API_KEY|JWT_SECRET)=.+'` → `0` (las claves están vacías o comentadas).
  - `git grep` de asignaciones tipo `password|secret|apiKey = "..."` en `backend`, `frontend`, `e2e`, `redteam`: solo coincidencias en `AutenticarUsuarioService.test.ts:80-159` (contraseñas de prueba).
  - Credencial de demostración en código: `backend/infrastructure/persistence/InMemoryUsuarioRepository.ts:24` (comentario con la contraseña de los usuarios semilla) y `:28` `bcrypt.hashSync('<contraseña demo>', 12)`. También figura en documentos de entrega de pruebas.
  - `gitleaks` no está instalado: no se ejecutó (`which gitleaks` → sin salida).
- **Estado:** PARCIAL
- **Observación:** No hay claves reales ni `.env` en el repositorio ni en su historial buscable por esos patrones. La contraseña común de los usuarios semilla está escrita en código y comentarios; es una credencial de demostración, pero hay que asegurarse de que no exista en un entorno real. Recomendado correr `gitleaks` o `trufflehog` para cubrir otros patrones.
- **Auditó:** Carolina Aguilar

### F12-03 · Procesos sin estado (factor VI)

- **Evidencia:**
  - `backend/infrastructure/persistence/InMemoryAgenteSessionStore.ts:6` `private readonly store = new Map<string, AgentSessionRecord>()` — sesiones de confirmación del agente en memoria del proceso.
  - `backend/infrastructure/persistence/InMemoryDeclaracionJuradaRepository.ts:15` `new Map<string, DeclaracionJurada>()` y `InMemoryUsuarioRepository.ts` (usuarios, `intentosFallidos`, `bloqueadoHasta` en memoria): las DJ y el bloqueo de cuenta (RB-07) viven en el proceso.
  - `backend/infrastructure/persistence/JsonConversacionRepository.ts:32` `writeFileSync(this.rutaArchivo, …)` — estado del orquestador en un archivo local (`backend/data/conversaciones.json`, instanciado en `app.ts:123`).
  - `backend/infrastructure/persistence/JsonTramiteRepository.ts:17` índice en `Map` (solo lectura, cargado de `db.json`; aceptable).
  - `express-rate-limit` en `authRateLimit.ts:18` usa el almacén en memoria por defecto (contador por proceso).
  - No hay `express-session`, `@Cron` ni `setInterval` en el código de producción.
- **Estado:** FALLA
- **Observación:** Con más de una instancia, cada una tendría sus propias DJ, usuarios, sesiones de confirmación, contadores de login y archivo de conversaciones; un `POST /agente-dj/confirmar` que caiga en otra instancia devolvería "sesión inexistente". Ya está declarado en el Módulo 6 (se prevé PostgreSQL, ADR-0001); aquí se verifica que sigue pendiente.
- **Auditó:** Carolina Aguilar

### F12-04 · Logs a la salida estándar (factor XI)

- **Evidencia:**
  - No hay librería de logging (`winston`, `pino`) ni transportes a archivo: `git grep -nE "winston|pino|transports\.File|DailyRotateFile"` → sin resultados.
  - Todo se emite con `console.*`: `backend/api/server.ts:8-9`, `backend/api/app.ts:60`, `backend/api/middleware/auth.middleware.ts:119` (`console.error('Unhandled error', { correlationId, type, message })`), `backend/domain/agente-dj/services/AgenteDJService.ts:140`, `backend/infrastructure/notifications/ConsoleNotificacionPublisher.ts:11` y `ConsoleEscalamientoPublisher.ts:6`.
  - Los `console.log` de `backend/scripts/demo-llm.ts` y `comparar-modelos.ts` son scripts de demostración que imprimen una DJ y respuestas del modelo.
- **Estado:** PARCIAL
- **Observación:** Los logs salen por stdout/stderr (correcto para el factor XI), pero no son estructurados (mezcla de texto libre y objetos), no hay un logger central ni nivel configurable, y no todas las líneas llevan `correlationId` (solo el manejador de errores). Falta además revisar que `ConsoleNotificacionPublisher` no escriba datos personales (AGENTS.md §7.1 los prohíbe). Según la respuesta P2, los logs los recogerá Docker/la plataforma y los de auditoría (RB-01, RB-05) deben conservarse de forma persistente: hoy no hay un registro de auditoría persistente, solo `console.*`, así que el requisito aún no se cumple.
- **Auditó:** Carolina Aguilar

### F12-05 · Servicios de apoyo intercambiables (factor IV)

- **Evidencia:**
  - Ollama: host y modelo por entorno (`OllamaClient.ts:17-18`, `OllamaEmbeddingsClient.ts:16-17`).
  - Groq y Gemini: URL fija en el código — `GroqClient.ts:25` y `GroqAgentClient.ts:72` `fetch('https://api.groq.com/openai/v1/chat/completions', …)`; `GeminiClient.ts:30-31` `https://generativelanguage.googleapis.com/v1beta/…`. Solo la clave y el modelo vienen del entorno.
  - Capa de aislamiento: los puertos del dominio (p. ej. `IAgentSessionStore`, `IConversacionRepository`, `IUsuarioRepository`) separan el dominio de la persistencia, y hay adaptadores de IA por proveedor en `backend/infrastructure/ai/`; la elección del proveedor se hace en `backend/api/app.ts` (instanciación directa, sin selección por configuración).
  - No hay `DATABASE_URL`, `REDIS_URL` ni `PrismaClient` en el código (`git grep` → sin resultados): hoy no existe base de datos conectada.
- **Estado:** PARCIAL
- **Observación:** La arquitectura hexagonal facilita cambiar de proveedor, pero la URL base de Groq/Gemini está fija y no se puede apuntar a otro endpoint compatible (p. ej. un proxy o Ollama) sin tocar código; tampoco hay selección de proveedor por variable de entorno ni fallback automático (declarado como trabajo futuro en el Módulo 6). Base de datos, Redis y Bull de AGENTS.md aún no están conectados.
- **Auditó:** Carolina Aguilar

### F12-06 · Construcción inmutable y apagado limpio (factores V y IX)

- **Evidencia:**
  - `git ls-files | grep -iE "dockerfile|compose"` → solo `docs/ADR/0004-despliegue-onpremise-docker-compose.md`; en `main`, `release/1.0.0` y `release/2.0.0` tampoco hay Dockerfile ni `docker-compose.yml`. El ADR-0004 decide Docker Compose con Nginx, API, Worker, PostgreSQL y Redis, pero esos archivos no existen.
  - El proceso se arranca con `tsx api/server.ts` (`backend/package.json`, script `start`): ejecuta TypeScript directamente, sin paso de construcción ni artefacto.
  - Apagado: `git grep -nE "SIGTERM|SIGINT|server\.close|enableShutdownHooks" -- backend` → sin resultados. `server.ts:7` llama `app.listen(...)` sin guardar el servidor ni manejar señales.
  - No hay secretos copiados en una imagen porque no hay imagen.
- **Estado:** FALLA
- **Observación:** No hay construcción reproducible ni imagen, y el proceso no maneja `SIGTERM`: al detenerlo se cortan las peticiones en curso y no se cierran recursos. Es lo primero a resolver antes de contenedorizar (S07).
- **Auditó:** Carolina Aguilar

## 4. Preguntas al grupo

| N.º | Comprobación | Pregunta | Respuesta del grupo | Estado (respondida / sin respuesta) |
|-----|--------------|----------|---------------------|--------------------------------------|
| P1 | F12-06 | El ADR-0004 prevé Docker Compose, pero no hay Dockerfile ni `docker-compose.yml` en ninguna rama. ¿Existen en otro repositorio o rama, o aún no se han creado? | Aún no se han creado (solo existe el ADR-0004); se crearán en S07. | respondida |
| P2 | F12-04 | ¿Quién recoge los logs en el entorno donde se ejecuta (la terminal, Docker, otro)? ¿Se espera conservar los logs de auditoría (RB-01, RB-05) de forma persistente? | Docker/la plataforma recogerá los logs, y los logs de auditoría (RB-01, RB-05) deben conservarse de forma persistente. | respondida |

## 5. Hallazgos priorizados

| # | Comprobación | Severidad (alta / media / baja) | Qué falla | Corrección propuesta | Responsable | ¿Antes de contenedorizar (S07)? |
|---|--------------|---------------------------------|-----------|----------------------|-------------|---------------------------------|
| 1 | F12-03 | alta | DJ, usuarios, sesiones del agente, bloqueo de login y contadores del rate limit viven en memoria; conversaciones en un archivo local. | Persistir en PostgreSQL (ADR-0001); sesiones/contadores en Redis; quitar `conversaciones.json`. | Carolina Aguilar | Sí |
| 2 | F12-06 | alta | No hay Dockerfile ni compose, y no se maneja `SIGTERM`. | Escribir Dockerfile multietapa con `CMD` en forma exec; guardar el retorno de `app.listen` y cerrar con `server.close` en `SIGTERM`/`SIGINT`. | Carolina Aguilar | Sí |
| 3 | F12-01 | media | CORS fijo a localhost; sin validación de variables al arrancar; `JWT_SECRET` ausente genera un secreto efímero. | Leer `CORS_ORIGINS` del entorno; validar con Zod al arrancar y fallar si faltan `JWT_SECRET` y claves requeridas. | Carolina Aguilar | Sí |
| 4 | F12-05 | media | URL de Groq/Gemini fija; no hay selección de proveedor por configuración. | Variables `GROQ_BASE_URL`/`LLM_PROVIDER`; fallback Groq → Ollama. | Carolina Aguilar | No |
| 5 | F12-04 | media | Logs con `console.*`, sin formato estructurado ni `correlationId` en todas las líneas. | Logger central (pino) a stdout en JSON con `correlationId`; revisar que no registre datos personales; registro de auditoría persistente para RB-01 y RB-05 (P2). | Carolina Aguilar | No |
| 6 | F12-02 | baja | Contraseña de usuarios demo escrita en código; falta escaneo automático de secretos. | Mover la semilla a variable de entorno solo para demo; añadir `gitleaks` al CI. | Carolina Aguilar | No |

## 6. Autoverificación (la marca el asistente; el grupo la confirma)

- [x] Las seis comprobaciones F12-01 a F12-06 están en la sección 3, una vez cada una.
- [x] Ninguna quedó en `PENDIENTE` ni sin estado; todos los estados son de los cinco permitidos.
- [x] Todo estado distinto de `N/A` y `NO VERIFICABLE` tiene evidencia con ruta y línea, o con comando y salida.
- [x] Cada `NO VERIFICABLE` y cada `N/A` explica su motivo (no hay ninguno).
- [x] Todas las preguntas de la sección 4 están respondidas o marcadas "sin respuesta".
- [x] Los hallazgos de severidad alta tienen responsable.
- [x] No hay ningún secreto copiado en este archivo.
- [ ] No se modificó código del producto (`git diff --stat <commit auditado>..HEAD` solo muestra este archivo y el de aportes). *(El grupo debe correrlo: el árbol ya tenía cambios sin commitear antes de la auditoría.)*
- [ ] Cada integrante aparece como auditor de al menos una comprobación y tiene al menos un commit con su propia identidad. *(Falta el commit.)*

## 7. Resumen

| OK | PARCIAL | FALLA | N/A | NO VERIFICABLE | Preguntas sin respuesta |
|---:|--------:|------:|----:|---------------:|------------------------:|
| 0 | 4 | 2 | 0 | 0 | 0 |

**Conclusión en dos líneas:** No hay secretos ni `.env` en el repositorio, y la configuración y los logs ya van por entorno y stdout. Lo primero a corregir es el estado en memoria (F12-03) y la falta de Dockerfile y apagado limpio (F12-06) antes de contenedorizar.
