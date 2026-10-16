# Auditoría de concurrencia del backend — DPA

> **Módulo 8 · Actividad de auditoría (parte 2 de 2) · Entrega: domingo 18 de octubre de 2026, 23:59.**
> Este archivo es a la vez **las instrucciones para el asistente de IA** y **la ficha que se entrega**. El asistente lo rellena en su lugar; el grupo lo revisa, responde las preguntas y lo sube a su repositorio.

## Cómo se usa (para el grupo)

1. Copien este archivo a su repositorio como `docs/auditoria/concurrencia.md`.
2. Trabajen sobre el mismo commit que la parte 1 (`release/8.0.0`).
3. Abran su asistente con acceso al repositorio y escríbanle:
   > Sigue las instrucciones de la sección 0 de `docs/auditoria/concurrencia.md` y rellena ese archivo.
4. Respondan las preguntas que el asistente les haga al final de cada oleada. Aquí habrá más preguntas que en la parte 1, porque varios datos (cuántas réplicas corren, cuánto tarda la IA, cuánto tráfico esperan) no están en el código.
5. Revisen el resultado, confirmen la autoverificación (sección 6) y hagan los commits **cada integrante con su propia cuenta**.

**Si su asistente no tiene acceso al repositorio:** pídanle los comandos, córranlos ustedes y péguenle la salida.

**Cómo se califica la parte de preguntas:** cada pregunta debe terminar respondida o cerrada como `NO VERIFICABLE` con su motivo. **Si quedan más de 3 preguntas sin responder en este archivo, baja la nota de la actividad.** Si no tienen el dato exacto (por ejemplo, el tráfico esperado), una estimación razonada cuenta como respuesta.

---

## 0. Instrucciones para el asistente de IA (no editar esta sección)

**Rol.** Eres el asistente de auditoría de un grupo de maestría que desarrolla un backend. Vas a revisar cómo maneja la concurrencia su servicio y a **rellenar este mismo archivo**. No produces otros archivos.

**Conceptos que debes aplicar.**
- **Dónde espera una petición:** casi todo el tiempo de una API es espera (base de datos, red, servicio de IA). Saturar es que un recurso finito (hilos, conexiones del pool, el único hilo del event loop, el cupo de la API de IA) esté al 100 % y las peticiones nuevas hagan cola: primero sube la latencia y luego llegan los errores.
- **Modelos por runtime:** Node.js usa un event loop de un hilo (cualquier trabajo síncrono lo bloquea); Java 21+ con hilos virtuales permite código bloqueante que escala, pero el pool de la base de datos sigue siendo el límite; Python con `async def` bloquea el loop si llama a librerías síncronas, y las rutas `def` corren en un threadpool finito (40 hilos por defecto en AnyIO).
- **Ley de Little:** conexiones ocupadas en promedio = peticiones por segundo que usan la base de datos × tiempo medio que cada una retiene la conexión. Cada instancia tiene su propio pool: la base de datos recibe `instancias × tamaño del pool`.
- **Llamadas lentas (LLM):** necesitan timeout explícito, reintentos con backoff y jitter, límite de llamadas simultáneas y no retener una conexión de base de datos mientras se espera.

**Reglas que no puedes romper.**
1. **Solo lectura del producto.** No modificas código ni configuración; el único archivo que editas es este. No ejecutas pruebas de carga contra servicios compartidos o en producción.
2. **No inventas.** Cada estado distinto de `N/A` lleva evidencia comprobable: `ruta/archivo:línea` con el fragmento relevante, o el comando exacto y las primeras líneas de su salida. Las cifras que no salen del código (tráfico, latencias, réplicas) se preguntan, no se suponen.
3. **No copias secretos.** Rutas y líneas sí; valores de claves, nunca.
4. **Todas las comprobaciones aparecen**, una vez cada una (CON-01 a CON-05). No agregas ni quitas comprobaciones.
5. **Escribes en español** y en frases claras.

**Estados permitidos.** `OK`, `PARCIAL`, `FALLA`, `N/A` (con razón) y `NO VERIFICABLE` (con razón). Mientras trabajas puedes usar `PENDIENTE`, pero **al terminar no puede quedar ninguno**.

**Cómo preguntar sin bloquear.** Cuando te falte un dato que no está en el código:
- Marca la comprobación como `PENDIENTE`, agrega la pregunta a la sección 4 con un número (P1, P2…) y la comprobación a la que afecta, y **continúa con la siguiente**. Nunca te detengas a esperar.
- Al **terminar cada oleada**, muestra al grupo todas las preguntas nuevas juntas. Si tu herramienta permite preguntas con opciones, úsalas (por ejemplo, para el número de réplicas: 1, 2, 3 o más, no sabemos).
- Si el grupo responde, anota la respuesta y actualiza la comprobación. Si no responde, en la oleada 3 cierra la comprobación como `NO VERIFICABLE` y la pregunta como "sin respuesta".
- **Antes de preguntar, búscalo** en el README, `docker-compose`, Dockerfile, manifiestos de Kubernetes, archivos de configuración y scripts de arranque.

**Oleadas.** Trabaja en este orden y actualiza la sección 2 al terminar cada una:
- **Oleada 0 · Reconocimiento.** Rellena la sección 1: runtime y framework de cada servicio, punto de arranque, librería de acceso a datos y cliente HTTP o SDK de IA. Escribe en la sección 2 el plan (qué archivos y comandos usarás).
- **Oleada 1 · Evidencia automática.** Ejecuta los comandos de cada comprobación (adaptados a las carpetas reales) y anota la evidencia.
- **Oleada 2 · Juicio.** Decide el estado de CON-01 a CON-04 y pregunta lo que falte. Calcula con la ley de Little las conexiones necesarias cuando tengas los datos (tráfico estimado y tiempo de retención); si no los tienes, pregúntalos.
- **Oleada 3 · Cierre.** Integra las respuestas; escribe la **hipótesis de cuello de botella** (CON-05) con base en las comprobaciones anteriores; cierra lo pendiente como `NO VERIFICABLE`; escribe los hallazgos (sección 5), marca la autoverificación (sección 6) y rellena el resumen (sección 7). Termina diciendo cuántas preguntas quedaron sin respuesta.

**Si el proyecto tiene varios servicios**, evalúa cada uno y anota la evidencia por servicio; el estado es el del peor evaluado.

---

## 1. Datos del repositorio (oleada 0)

- **Grupo:** DPA (SGAI — Sistema de Gestión Académica)
- **Commit auditado (`release/8.0.0`):** `62da628d8ed4b445ebfaf2027b40049b4e4c52df` (HEAD de `agent-mcp`; la rama `release/8.0.0` aún no existe y el árbol de trabajo tiene cambios sin commitear)
- **Fecha de la auditoría:** 2026-10-15
- **Servicios y runtime:** un único servicio, `api` · Node.js + TypeScript (ESM) ejecutado con `tsx` · Express 4. El servidor MCP corre dentro del mismo proceso (`InMemoryTransport`).
- **Acceso a datos:** no hay ORM ni base de datos conectada. Repositorios en memoria (`InMemory*Repository`), lectura de `db.json` y archivo JSON de conversaciones · **base de datos:** ninguna (PostgreSQL previsto en ADR-0001, no implementado).
- **Cliente HTTP o SDK de IA:** `fetch` nativo de Node hacia Groq (`GroqClient.ts`, `GroqAgentClient.ts`), Ollama (`OllamaClient.ts`, `OllamaEmbeddingsClient.ts`) y Gemini (`GeminiClient.ts`, sin uso). Sin SDK.
- **Integrantes y qué revisó cada uno:** Carolina Aguilar → CON-01 a CON-05 (proceso asistido por IA, solo lectura).

## 2. Plan y avance por oleadas

| Oleada | Qué se hizo | Estado |
|--------|-------------|--------|
| 0 · Reconocimiento | Runtime, punto de arranque (`backend/api/server.ts`), dependencias de `backend/package.json`, clientes de IA y repositorios. | Hecha |
| 1 · Evidencia | `git grep` de arranque/cluster/replicas, lecturas y escrituras síncronas, pool/conexiones, `fetch`, timeouts y reintentos en `backend/api`, `domain`, `infrastructure`. | Hecha |
| 2 · Juicio | Estados decididos con la evidencia; tres preguntas sobre datos que no están en el código (P1–P3). | Hecha |
| 3 · Cierre | Respuestas P1–P3 integradas; hipótesis CON-05 reformulada con cifras del grupo; hallazgos, autoverificación y resumen completados. | Hecha |

## 3. Comprobaciones

### CON-01 · Modelo de concurrencia e instancias

- **Evidencia:** `backend/api/server.ts:7` `app.listen(PORT, …)` sin `cluster` ni `worker_threads`; `backend/package.json` scripts `start` → `tsx api/server.ts` y `dev` → `tsx watch api/server.ts`. `git grep -nE "cluster|worker_threads|replicas:|--workers" -- backend` → sin resultados. No hay `docker-compose.yml` ni manifiestos de Kubernetes versionados (`git ls-files | grep -iE "compose|k8s"` → solo el ADR-0004 como documento).
- **Estado:** OK
- **Observación:** Modelo: Node.js con un único event loop de un hilo y **un solo proceso**. El código supone una sola instancia: DJ, usuarios, bloqueo de login, sesiones del agente (`InMemoryAgenteSessionStore.ts:6`) y `conversaciones.json` están en el proceso o en el disco local. Según la respuesta P1, el piloto correrá **1 instancia**, lo que es coherente con ese estado en memoria; esto deja de ser válido en cuanto se escale a más de una (ver F12-03 de la parte 1).
- **Auditó:** Carolina Aguilar

### CON-02 · Llamadas bloqueantes en el camino de una petición

- **Evidencia:**
  - `backend/infrastructure/persistence/JsonConversacionRepository.ts:37` `readFileSync(this.rutaArchivo, 'utf-8')` + `JSON.parse` y `:32` `writeFileSync(...)` — lectura y escritura síncronas del archivo completo en **cada turno** de `POST /orquestador/atender` (`obtener` y `guardar`).
  - `backend/infrastructure/auth/BcryptPasswordHasher.ts:1,14,18` usa `bcryptjs` (JavaScript puro, no el módulo nativo) con cost 12: cada `POST /auth/login` ejecuta `bcrypt.compare` en el hilo principal.
  - Lecturas síncronas fuera del camino de petición: `loadEnv.ts:10` y `JsonTramiteRepository.ts:14` (solo al arrancar); `InMemoryUsuarioRepository.ts:28` `bcrypt.hashSync(…, 12)` (al crear el repositorio, al arrancar).
  - `git grep -nE "execSync|spawnSync"` → sin resultados.
- **Estado:** PARCIAL
- **Observación:** A la escala actual (decenas de conversaciones) el costo del archivo es pequeño, pero crece con el tamaño del archivo y congela el event loop mientras se lee o escribe. El hash/comparación de `bcryptjs` con cost 12 consume CPU del hilo principal (tarda cientos de milisegundos por login); está acotado por `authRateLimit` (20 intentos por IP cada 15 min, por defecto), pero muchos logins simultáneos de distintas IP bloquearían el servicio. Recomendado cambiar a `bcrypt` nativo o a un pool de workers, y la conversación a una base de datos.
- **Auditó:** Carolina Aguilar

### CON-03 · Pool de conexiones a la base de datos

- **Evidencia:** `git grep -nE "poolSize|connectionLimit|connection_limit|pool_size|PrismaClient|createConnection" -- backend` → sin resultados; `backend/package.json` no incluye `pg`, `prisma`, `typeorm` ni equivalentes. Los repositorios son `InMemory*` y `JsonConversacionRepository`.
- **Cálculo (ley de Little):** no aplica; no existe pool. Conexiones ocupadas = N/A. Total en la base de datos = N/A. Dato para el futuro: el grupo estima picos de **50 peticiones por segundo o más** (P2) con 1 instancia; cuando exista la base de datos habrá que medir el tiempo de retención por petición para dimensionar el pool (ej.: 50 req/s × retención en segundos = conexiones ocupadas).
- **Estado:** N/A
- **Observación:** Hoy no hay base de datos, por lo que no hay pool que dimensionar. Cuando se migre a PostgreSQL (ADR-0001) habrá que definir `tamaño del pool × instancias`, el tiempo de espera para obtener conexión y devolver 503 si se agota. Hay que evitar abrir una transacción mientras se espera al LLM: el bucle del agente (`AgenteDJService.ts`) mezcla llamadas al modelo con llamadas a herramientas que leerán la base de datos.
- **Auditó:** Carolina Aguilar

### CON-04 · Timeouts y reintentos en llamadas externas (incluida la IA)

- **Evidencia:**
  - Llamadas sin timeout: `GroqAgentClient.ts:72`, `GroqClient.ts:25`, `OllamaClient.ts:22`, `OllamaEmbeddingsClient.ts:21`, `GeminiClient.ts:30` usan `fetch(...)` sin `AbortSignal` ni `signal`. `git grep -nE "AbortSignal|signal:|timeout" -- backend/infrastructure/ai` → sin resultados (solo hay menciones en comentarios de otros archivos, p. ej. `AgenteDJService.ts:136` y `ILdapAuthenticator.ts:3`).
  - Reintento único ante 429: `GroqAgentClient.ts:94-96` espera el tiempo indicado por Groq (por defecto 5 s) y reintenta **una vez**, sin jitter; no hay reintentos en los demás clientes.
  - Bucle del agente: `AgenteDJService.ts:14` `MAX_PASOS = 6` y `:131` `for (let paso = 1; paso <= MAX_PASOS; paso++)` — hasta 6 llamadas **secuenciales** al LLM por petición.
  - `git grep -nE "Semaphore|p-limit|bulkhead"` → sin resultados: no hay límite de llamadas simultáneas al LLM.
  - Errores del modelo: `AgenteDJService.ts:136-140` captura el fallo y responde con un mensaje claro (degrada, no revienta).
  - No se retiene una conexión de base de datos durante la espera porque no hay base de datos (ver CON-03).
- **Estado:** FALLA
- **Observación:** Sin timeout, una petición puede quedar esperando indefinidamente si Groq u Ollama no responden; combinado con hasta 6 pasos secuenciales y sin límite de simultaneidad, varias peticiones lentas acumulan promesas y memoria sin freno. El tope de pasos y el manejo de errores son buenos controles ya existentes. Falta: timeout explícito (p. ej. `AbortSignal.timeout`), backoff con jitter y un límite de concurrencia hacia el proveedor.
  - **Cálculo con las respuestas del grupo (P3):** respuesta del agente de unos 5–8 s y menos de 10 consultas por minuto → peticiones simultáneas al LLM ≈ (10/60 por segundo) × 6,5 s ≈ 1 (ley de Little); la simultaneidad no es el problema hoy, pero sin timeout una sola llamada colgada ocupa la petición indefinidamente. El límite relevante es el cupo de tokens por minuto de Groq (8.000 TPM según el informe de red teaming): solo los 3 primeros pasos de la traza del documento del Módulo 6 suman ≈3.500 tokens (1.065 + 1.138 + 1.322), por lo que 10 consultas por minuto superarían ≈35.000 tokens por minuto, unas 4 veces ese cupo (depende del plan contratado).
- **Auditó:** Carolina Aguilar

### CON-05 · Hipótesis de cuello de botella

- **Hipótesis:** Bajo carga, se saturará primero el cupo de tokens por minuto de Groq en `POST /api/v1/agente-dj/preguntar`, porque cada consulta hace hasta 6 llamadas secuenciales de ≈1.000–1.300 tokens (≈3.500 solo en 3 pasos), unas 10 consultas por minuto superan el límite de 8.000 TPM y no hay timeout ni límite de concurrencia (CON-04; P3); en segundo lugar, con el pico estimado de 50 peticiones por segundo en una sola instancia (CON-01; P1, P2), el event loop se bloqueará en `POST /auth/login` por `bcryptjs` con cost 12 y en `POST /orquestador/atender` por la lectura/escritura síncrona del archivo de conversaciones (CON-02).
- **Estado:** OK
- **Auditó:** Carolina Aguilar

## 4. Preguntas al grupo

| N.º | Comprobación | Pregunta | Respuesta del grupo | Estado (respondida / sin respuesta) |
|-----|--------------|----------|---------------------|--------------------------------------|
| P1 | CON-01 | ¿Cuántas instancias del backend se ejecutarán en el piloto (1, 2, 3 o más, no sabemos)? | 1 instancia. | respondida |
| P2 | CON-05 | ¿Cuántas peticiones por segundo estiman en la hora pico (p. ej. docentes simultáneos en la semana de entrega de declaraciones)? Una estimación razonada vale. | 50 peticiones por segundo o más (estimación: los 1.500+ docentes casi simultáneos). | respondida |
| P3 | CON-04 | ¿Cuánto tarda normalmente una respuesta del agente DJ con Groq (segundos, de principio a fin) y cuántas consultas al agente se esperan por minuto? | Unos 5–8 segundos por respuesta y menos de 10 consultas por minuto en la hora pico. | respondida |

## 5. Hallazgos priorizados

| # | Comprobación | Severidad (alta / media / baja) | Qué falla | Corrección propuesta | Responsable |
|---|--------------|---------------------------------|-----------|----------------------|-------------|
| 1 | CON-04 | alta | Llamadas a Groq/Ollama/Gemini sin timeout; hasta 6 pasos secuenciales; sin límite de llamadas simultáneas; el consumo estimado de tokens supera el cupo de Groq. | `AbortSignal.timeout` por llamada y por petición completa; backoff con jitter; semáforo (`p-limit`) hacia el proveedor. | Carolina Aguilar |
| 2 | CON-02 | media | `bcryptjs` cost 12 en el hilo principal en cada login. | Cambiar a `bcrypt` nativo (threadpool) o mover a worker; mantener `authRateLimit`. | Carolina Aguilar |
| 3 | CON-02 | media | Lectura/escritura síncrona del archivo completo de conversaciones por turno. | Migrar a PostgreSQL/Redis o, mientras tanto, usar `fs.promises` con escritura atómica. | Carolina Aguilar |
| 4 | CON-01 | baja | Estado en memoria que supone una sola instancia (el piloto usará 1, P1); deja de ser válido si se escala. | Fijar y documentar `replicas: 1` hasta migrar el estado a servicios de apoyo. | Carolina Aguilar |
| 5 | CON-03 | baja | No hay pool (no hay BD); riesgo futuro al migrar. | Definir pool, tiempo de espera y respuesta 503 al introducir PostgreSQL. | Carolina Aguilar |

## 6. Autoverificación (la marca el asistente; el grupo la confirma)

- [x] Las cinco comprobaciones CON-01 a CON-05 están en la sección 3, una vez cada una.
- [x] Ninguna quedó en `PENDIENTE` ni sin estado; todos los estados son de los cinco permitidos.
- [x] Todo estado distinto de `N/A` y `NO VERIFICABLE` tiene evidencia con ruta y línea, o con comando y salida.
- [x] Las cifras usadas (tráfico, latencias, réplicas) vienen del código o de una respuesta del grupo, no de una suposición. *(Instancias, tráfico y latencia: respuestas P1–P3; 8.000 TPM: informe de red teaming; tokens por paso: documento del Módulo 6.)*
- [x] CON-05 está formulada con el formato pedido y cita las comprobaciones en que se basa.
- [x] Todas las preguntas de la sección 4 están respondidas o marcadas "sin respuesta".
- [x] No hay ningún secreto copiado en este archivo.
- [ ] No se modificó código del producto. *(El grupo debe confirmarlo con `git diff --stat`: el árbol ya tenía cambios sin commitear antes de la auditoría.)*
- [ ] Cada integrante aparece como auditor de al menos una comprobación y tiene al menos un commit con su propia identidad. *(Falta el commit.)*

## 7. Resumen

| OK | PARCIAL | FALLA | N/A | NO VERIFICABLE | Preguntas sin respuesta |
|---:|--------:|------:|----:|---------------:|------------------------:|
| 2 | 1 | 1 | 1 | 0 | 0 |

**Hipótesis de cuello de botella (copia de CON-05):** Bajo carga, se saturará primero el cupo de tokens por minuto de Groq en `POST /api/v1/agente-dj/preguntar`, porque cada consulta hace hasta 6 llamadas secuenciales de ≈1.000–1.300 tokens (≈3.500 solo en 3 pasos), unas 10 consultas por minuto superan el límite de 8.000 TPM y no hay timeout ni límite de concurrencia (CON-04; P3); en segundo lugar, con el pico estimado de 50 peticiones por segundo en una sola instancia (CON-01; P1, P2), el event loop se bloqueará en `POST /auth/login` por `bcryptjs` con cost 12 y en `POST /orquestador/atender` por la lectura/escritura síncrona del archivo de conversaciones (CON-02).
