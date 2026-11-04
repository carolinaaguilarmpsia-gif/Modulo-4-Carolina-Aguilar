# Demo 3 — release/8.3.0

**Equipo:** DPA · **Producto:** SGAI — Sistema de Gestión Académica Integral · **Fecha de la demo:** miércoles 4 de noviembre de 2026

## 1. Funcionalidades por integrante

| Integrante | Funcionalidades (tamaño) | Caso de uso del FSD | Repositorio |
|---|---|---|---|
| Carolina Aguilar | 1. Imagen y stack de producción: Dockerfile multi-stage, `compose.yaml` y datos en PostgreSQL (mediana) | Transversal (parte técnica obligatoria) | https://github.com/carolinaaguilarmpsia-gif/Modulo-4-Carolina-Aguilar/tree/release/8.3.0 |
| | 2. Análisis E3: ¿conviene extraer el módulo Trámites DPA como microservicio? (mediana) | Transversal (análisis a elección) | |

Proyecto unipersonal: el release reúne solo el trabajo de Carolina Aguilar.

## 2. Imagen y stack de producción

### Qué se construyó

- **`backend/Dockerfile`, multi-stage.** Etapa 1 instala solo las dependencias de producción; etapa 2 copia únicamente eso y el código. Base `node:24.22.2-bookworm-slim` fijada con versión y digest, usuario no root (uid 1000), sin `npm`/`yarn` en la imagen final y sin `.env`, tests, documentos ni carpetas de otros módulos (`.dockerignore`).
- **`compose.yaml`, tres servicios:** `db` (PostgreSQL 17 fijado por digest, con volumen), `migrar` (corre una vez: aplica las migraciones y siembra el catálogo) y `api` (espera a que `migrar` termine bien). La base **no publica ningún puerto**; la API escucha solo en `127.0.0.1:3001`.
- **Los datos viven en PostgreSQL:** usuarios, perfiles y formación académica, roles institucionales con su auditoría, trámites, conversaciones, declaraciones juradas con su historial y calendario académico. Solo las sesiones del agente siguen en memoria. Detalle en `docs/base-de-datos.md`. Con esto queda resuelto el hallazgo F12-03 de la auditoría 12-factor.
- **Configuración por entorno** (`.env.example`): `JWT_SECRET`, `POSTGRES_PASSWORD`, `GROQ_API_KEY`. Producción no arranca sin `JWT_SECRET` ni `DATABASE_URL`.

### Criterios de aceptación

| # | Criterio | Cómo se comprueba | Resultado |
|---|---|---|---|
| 1 | Desde un clon limpio, `docker compose up -d --wait` deja todo sano | Copia del repositorio sin `node_modules` ni `.env`; `docker compose ps` | `db` y `api` *healthy*; `migrar` terminó con éxito. 26 s con caché de capas |
| 2 | La API responde y el login de la demo funciona | `GET /health`; `POST /api/v1/auth/login` con `admin.facultad@universidad.edu.bo` / `Demo1234!` | 200 en ambos; el Admin. Facultad ve 4 declaraciones |
| 3 | La migración es idempotente y los datos sobreviven | `docker compose down` (sin `-v`) y `up` de nuevo, tras aprobar una DJ | La DJ sigue `APROBADA`; volver a sembrar no la pisa |
| 4 | La imagen no corre como root y la base no es accesible desde fuera | `docker compose exec api id`; `docker compose port db 5432` | uid 1000 (`node`); sin puerto publicado |
| 5 | El Dockerfile pasa hadolint | `hadolint backend/Dockerfile` (2.15.1) | **0 hallazgos** (`evidencia-demo-3/hadolint.txt`) |
| 6 | La imagen no tiene hallazgos altos o críticos sin justificar | Trivy, severidad `HIGH,CRITICAL` | **0 corregibles**; 33 sin corrección publicada, justificados abajo (`evidencia-demo-3/trivy-resumen.md`) |

### Trivy: qué se arregló y qué se justifica

La primera pasada dio **45** hallazgos altos o críticos. **12 eran de dependencias de Node y tenían versión corregida**, así que se arreglaron actualizando el `package-lock.json`: `proxy-addr` 2.0.7 → 2.0.8 (la única crítica), `@modelcontextprotocol/sdk` 1.30.0 → 1.32.2, `body-parser` → 1.20.9 y 2.4.0, y `fast-uri` → 3.1.9. Tras reconstruir la imagen y volver a escanear quedan **33, todos del sistema Debian de la imagen base, sin corrección publicada**:

| Paquetes (Debian 12) | Hallazgos | Estado según Trivy |
|---|---|---|
| `util-linux`, `mount`, `bsdutils`, `libblkid1`, `libmount1`, `libsmartcols1`, `libuuid1`, `util-linux-extra` | 3 CVE × 8 paquetes | sin corrección |
| `ncurses-base`, `ncurses-bin`, `libtinfo6` | 1 CVE × 3 paquetes | sin corrección |
| `libsystemd0`, `libudev1` | 1 CVE × 2 paquetes | sin corrección |
| `gzip`, `libacl1`, `perl-base` | 1 CVE cada uno | sin corrección |
| `zlib1g` | 1 CVE **crítica** (CVE-2023-45853) | Debian: *will not fix* |

**Por qué se aceptan por ahora:**

1. **No se pueden corregir actualizando:** Debian no ha publicado versión corregida (27 *affected*, 5 *fix_deferred*, 1 *will_not_fix*). Cualquier "arreglo" sería cambiar de imagen base.
2. **Son bibliotecas del sistema base** que la aplicación no invoca: la API es Node/Express, sin shell expuesto a entradas de usuario y sin `npm`/`yarn` en la imagen.
3. **Mitigaciones activas:** proceso sin root, base fijada por digest, la base de datos sin puerto publicado, API solo en `127.0.0.1`.
4. **Cuándo se revisa:** al subir el digest de la imagen base cuando Debian publique correcciones. No se evaluó la explotabilidad CVE por CVE; es un riesgo aceptado por tiempo, no descartado.

Alternativa no adoptada: una imagen *distroless* eliminaría casi todos estos paquetes, pero cambia cómo se ejecuta y se depura el contenedor; queda como mejora futura.

### Cómo se presenta

```bash
docker compose up -d --wait
docker compose ps
curl http://127.0.0.1:3001/health
docker compose down        # los datos quedan; "down -v" los borra
```

## 3. Análisis E3: Trámites DPA como microservicio

Informe completo en `bench/e3/INFORME.md`, hipótesis (escrita antes de medir) en `bench/e3/HIPOTESIS.md`, decisión en `docs/ADR/0007-extraer-tramites-dpa.md`.

- **Módulo elegido:** Trámites DPA (`backend/domain/tramites-dpa`). Es el único con otro *runtime* (puede llamar a Groq y a Ollama, con latencias de segundos y fallas propias), tiene sus propios datos (`tramites_departamentos` y `tramites`: 34 trámites en 5 departamentos) y su única entrada desde fuera es `preguntar()`, que ya es asíncrona.
- **Interfaz con dos formas** (`backend/domain/tramites-dpa/ports/in/IAsistenteTramites.ts`): `preguntar(pregunta, { signal })` y `estado()`. Quien la consume (controlador público y orquestador) no sabe en qué forma vive el módulo.
  - **Dentro del monolito:** `TRAMITES_MODO=proceso` (por defecto). Es una llamada a función.
  - **Como servicio aparte:** `TRAMITES_MODO=http`. La misma imagen arranca otro punto de entrada (`api/main-tramites.ts`); el cliente HTTP tiene plazo de 1000 ms por intento, 1 reintento con *jitter* y un circuito que abre tras 5 fallos seguidos durante 5 s.
- **Qué se midió:** 20 peticiones/s por ruta durante 70 s; entre los segundos 30 y 50 se provocó una falla del módulo (colgado, lento o caído) con Toxiproxy. 5 corridas por tanda, con `down -v` entre ellas.

| Medición | En proceso | Extraído |
|---|---|---|
| p95 de la ruta del módulo, sin falla | 12 ms | 68 ms (mediana de las 15 corridas; el ruido del equipo abarca la diferencia) |
| Peticiones perdidas durante la falla (ruta del módulo) | no hay falla independiente que provocar | 96 a 99 % |
| Errores en la ruta que no usa el módulo, durante la falla | — | 0 % en las 15 corridas |
| Recuperación tras quitar la falla | — | 2 a 5 s |

- **Decisión (ADR-0007): no extraer por ahora.** El aislamiento funciona, pero hoy no hay carga que lo pida: con la IA apagada y el catálogo en memoria, una pregunta cuesta ~0,2 ms de CPU. Extraer añadiría un contenedor, reintentos y circuito que operar y un modo de falla nuevo, sin beneficio medido.
- **Cuándo se reconsidera:** con `IA_HABILITADA=true`, si el p95 de `POST /preguntar` supera 1000 ms y el de `GET /health` sube más de 2×; o si el módulo necesita escalar a otro ritmo (~100 peticiones/s por instancia).
- **Limitaciones declaradas:** máquina cargada (5 a 25 de carga con 8 núcleos), tandas seguidas y no alternadas, y no se midió el caso con Groq/Ollama.

## 4. Cómo se comprueba

```bash
docker compose up -d --wait                       # el stack completo
npm run db:setup --prefix backend                 # solo en desarrollo, con compose.db.yaml
NODE_OPTIONS=--experimental-vm-modules npx jest --watchman=false
npm run openapi:check
node scripts/chequear-frontera.mjs                # la frontera de E3
```

Las pruebas contra PostgreSQL se activan con `TEST_DATABASE_URL` (ver `docs/base-de-datos.md`); en serie con `--runInBand` si se corre toda la suite.

## 5. Registro

Esta tabla también se registra en Classroom, con el enlace al repositorio de la rama `release/8.3.0`. El aporte del release está en `8.3.0-aportes.md`.
