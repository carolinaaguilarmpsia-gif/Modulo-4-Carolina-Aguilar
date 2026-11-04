# ADR-0007: Extraer (o no) el módulo Trámites DPA a un servicio

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0007 |
| Título | Trámites DPA: monolito modular frente a servicio extraído |
| Fecha | … |
| Autor(es) | … (G01) |
| Estado | **Propuesta** → cambiar a Aceptada cuando el grupo decida |
| Relacionado | ADR-0001 (monolito hexagonal), ADR-0004 (Docker Compose on-premise), `bench/e3/INFORME.md` |

> Plantilla con lo que ya se sabe del código. Lo marcado con `…` se rellena con lo medido. Decidir **no** extraer también es una decisión válida.

### 1. Contexto

Trámites DPA (`backend/domain/tramites-dpa`) responde preguntas sobre el catálogo de trámites (requisitos, plazos, normativa). Es candidato a extraerse porque:

- Es el único módulo con otro *runtime*: el router puede llamar a Groq (LLM) y a Ollama (embeddings), con latencias de segundos y fallas propias.
- Tiene su propio dato: las tablas `tramites_departamentos` y `tramites` (34 trámites en 5 departamentos, ~27 KB en `db.json`).
- Su única entrada desde fuera es `AsistenteTramitesService.preguntar()`, que ya es asíncrona.

Restricciones:

- El catálogo se lee de Postgres **una sola vez al arrancar** y se sirve desde memoria. Una petición normal no consulta la base.
- El camino medido es el de palabras clave (`IA_HABILITADA=false`), sin LLM ni red externa. Así el experimento mide la frontera y no a Groq.
- Despliegue on-premise con Docker Compose (ADR-0004).

### 2. Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| A. **Monolito modular** (el módulo en el mismo proceso, detrás de `IAsistenteTramites`) | Sin red entre piezas; un solo despliegue | Si el módulo se cuelga o se satura, afecta a toda la API |
| B. **Servicio extraído** (mismo código, otro proceso, `TRAMITES_MODO=http`) | Aísla la falla y la carga del módulo; escala aparte | Un salto de red, un proceso más que operar, y manejar plazos, reintentos y circuito |

### 3. Decisión

> …  (una o dos frases: qué se decide. Si se extrae, con qué protecciones: plazo 1000 ms por intento, 1 reintento con jitter, circuito de 5 fallos / 5 s. Si no, qué se deja preparado: el puerto `IAsistenteTramites`, `main-tramites.ts` y el chequeo de frontera ya existen.)

### 4. Evidencia

Medianas y rangos de … corridas por forma (detalle en `bench/e3/INFORME.md`; datos crudos en `bench/e3/resultados/`).

- p95 de la ruta del módulo sin falla: en proceso … ms, extraído … ms (rango …).
- Con el módulo colgado: la ruta del módulo da … % de errores; la ruta de control, … % y p95 … ms (¿se contagia?).
- Recuperación tras quitar la falla: … s hasta 0 % de errores.
- Build y arranque: en proceso … s, extraído … s.

### 5. Consecuencias

- **Si se extrae:** se paga … (latencia, un proceso más, operación) y se gana … (aislamiento medido en la sección 4).
- **Si no se extrae:** …
- **Queda por hacer:** … (p. ej. que el orquestador degrade con un mensaje en vez de un 500 cuando el módulo no responde).

### 6. Condición de reversión

El hecho **medible** que haría deshacer esta decisión: qué se mide, con qué umbral y durante cuánto.

> …  Ejemplos del tipo de condición (no son la respuesta): «si con IA activada el p95 de `/preguntar` supera … ms y arrastra a `/health` en el monolito, se extrae»; «si el salto HTTP suma más de … ms al p95 en … de … corridas, se vuelve al monolito».

### 7. Trazabilidad

`bench/e3/HIPOTESIS.md`, `bench/e3/INFORME.md`, `backend/domain/tramites-dpa/ports/in/IAsistenteTramites.ts`, `compose.e3.yaml`.
