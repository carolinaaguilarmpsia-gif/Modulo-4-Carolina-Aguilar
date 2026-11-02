# Laboratorio S08: auditar y adelgazar la imagen del backend

## Datos

- **Integrante:** Carolina Aguilar
- **Opción y servicio:** A, servicio `api` (backend `sgai-backend`, Node.js/Express con TypeScript ejecutado con `tsx`)
- **Máquina y versiones:**
  - Sistema: macOS 14.7.1 (23H222), Docker Desktop 4.83.0
  - Docker Engine y cliente: 29.6.2
  - Podman: no aplica (opción A)
  - Herramientas, por Docker y con versión y digest fijos: Dive 0.13.1, Trivy 0.76.1, hadolint 2.15.1
- **Uso de IA:** Sí. El proyecto ya tenía su `backend/Dockerfile`. La IA ayudó a proponer las correcciones (multi-stage, base fijada, usuario no root, `.dockerignore`) y a interpretar los resultados. Cada cambio se comprobó con mediciones propias, antes y después, y con el arranque real del servicio. Las cifras de este informe salen de la carpeta `docs/laboratorios/evidencia/`.

## Resultados (antes → después)

| Medida | Antes | Después |
|---|---|---|
| Tamaño en disco (DISK USAGE) | 412 MB | **384 MB** (−7 %) |
| Tamaño comprimido (CONTENT SIZE) | 99,5 MB | **89,8 MB** (−10 %) |
| Número de capas | 9 | 9 |
| Dive: eficiencia / espacio desperdiciado | 98,69 % / 5,3 MB | 98,70 % / 5,4 MB |
| Usuario con el que corre | **root** (`uid=0`) | **`1000:1000`** (`uid=1000(node)`) |
| CVE HIGH + CRITICAL (Trivy) | **100** (66 del sistema Debian + 34 de npm) | **61** (49 Debian + 12 npm) |
| Avisos de hadolint | 0 | 0 |
| ¿Arranca y responde? | Sí, `/health` devuelve 200 | Sí, `/health` devuelve 200 |

Desglose de CVE (Trivy, `--scanners vuln`):

| | Antes | Después |
|---|---|---|
| Total de todas las severidades, sistema (Debian) | 285 | 223 |
| HIGH + CRITICAL, sistema (Debian) | 66 (60 H + 6 C) | 49 (48 H + 1 C) |
| HIGH + CRITICAL, npm | 34 (32 H + 2 C) | 12 (11 H + 1 C) |

Evidencia: `docs/laboratorios/evidencia/` (archivos `01` a `07`, con sufijo `antes` o `despues`).

## Qué encontramos

1. **La imagen corría como root.** `docker image inspect` no devolvía usuario y `id` daba `uid=0(root)`. Si alguien tomara el proceso, podría reescribir el código y el sistema del contenedor.
2. **Se instalaban las dependencias de desarrollo en producción.** El Dockerfile usaba `npm ci --include=dev`: la capa más grande de la aplicación (92,5 MB) llevaba TypeScript y los `@types`, que no hacen falta para ejecutar.
3. **La base estaba fuera de soporte y era flotante.** `node:20-slim`, sin versión exacta ni digest: Node 20 ya no recibe parches y la misma instrucción podía dar otra imagen mañana.
4. **Parte de las CVE no eran de la aplicación.** Unas 11 de npm venían del propio `npm` incluido en la imagen base (`/usr/local/lib/node_modules/npm`), que el servicio no usa porque ejecuta `node` directamente.
5. **Entraba al contexto de build mucho material que no se ejecuta** (documentación, pruebas, `e2e`, `frontend`, etc.); el `.dockerignore` original solo excluía `node_modules`, `.git` y `.env`.
6. **hadolint no avisó de nada** en el Dockerfile original (0 avisos), aunque tenía los problemas 1, 3 y 4. Revisa la forma del archivo, no estas decisiones; por eso las medidas del lab son necesarias.
7. **Cosa positiva:** los secretos (`JWT_SECRET`, `GROQ_API_KEY`) ya se pasaban al ejecutar, no estaban en la imagen ni en `ARG`.
8. **Hallazgo del repositorio:** la rama `main` no contenía el backend (solo documentación). El estado inicial se tomó de `release/8.2.0` y se versionó como primer commit de la rama del lab.

## Qué cambiamos y por qué

| Cambio | Dónde | Por qué | Efecto medido |
|---|---|---|---|
| Multi-stage: una etapa instala solo dependencias de producción y la final copia `node_modules` | `backend/Dockerfile` | No llevar TypeScript, `@types` ni caché de npm | −28 MB en disco; −10 % comprimida |
| `npm ci --omit=dev` y `npm cache clean` | `backend/Dockerfile` | Sin dependencias de desarrollo | Menos CVE de npm (34 → 12 junto con el cambio de base) |
| Base `node:24.22.2-bookworm-slim` con digest `sha256:c86ecead…` | `backend/Dockerfile` | Base con soporte, versión exacta y reproducible | CVE de Debian 66 → 49 |
| `USER 1000:1000` | `backend/Dockerfile` | No correr como root. Se usa el número y no el nombre para que sea verificable por hosts y orquestadores (hadolint DL3066) | `uid=0` → `uid=1000` |
| `chown -R node:node data` solo en la carpeta de datos | `backend/Dockerfile` | La app escribe `db.json` y `conversaciones.json` en `data/`; el código queda de root y el proceso no puede reescribirlo | Prueba de escritura `escritura-ok` |
| Eliminar `npm`, `npx` y `yarn` de la imagen final | `backend/Dockerfile` | No se usan en ejecución (`CMD ["node", …]`); menos superficie y CVE | CVE de npm bajan |
| `.dockerignore` ampliado (`*.test.ts`, `*.md`, `docs`, `frontend`, `e2e`, `evals`, `aidlc`, …) | `.dockerignore` | Lo que no se ejecuta no entra a la imagen ni al contexto | Contexto de build más chico |
| `tsx` pasa de `devDependencies` a `dependencies` | `backend/package.json` y `package-lock.json` | `tsx` es lo que ejecuta el TypeScript en producción. Sin esto `--omit=dev` lo descarta | Mismas versiones; el lock solo cambió marcas `dev` |
| `compose.yaml` nuevo en la raíz, con healthcheck en `node` sobre `/health` | `compose.yaml` | El proyecto no tenía compose; hace falta para seguir la guía (`docker compose build/up --wait`). El healthcheck va aquí, no en la imagen, para no alterar lo medido | `up --wait` espera a que esté sano |

### Un fallo que tuvimos que arreglar
El primer intento dejó `tsx` fuera: lo añadí con `npm install --no-save --omit=dev tsx`, pero `tsx` estaba en `devDependencies` y `--omit=dev` lo descartó. El contenedor salió con código 1 y `ERR_MODULE_NOT_FOUND: Cannot find package 'tsx'`. Se arregló moviéndolo a `dependencies`. Esa imagen fallida pesaba 366 MB porque le faltaban `tsx` y `esbuild` (unos 12 MB); las cifras de este informe son todas de la imagen final, que sí arranca (384 MB). Una imagen más pequeña que no arranca no sirve; por eso la comprobación final incluye levantar el stack y escribir en `data/`.

Un segundo ajuste: hadolint avisó `DL3066` (usuario no numérico) con `USER node`. Se corrigió con `USER 1000:1000` y volvió a 0 avisos.

## Qué no pudimos resolver

- **Número de capas (9 → 9).** El multi-stage no reduce las capas finales: la base `node:24-slim` ya aporta la mayoría y las copias de la aplicación se mantienen en pocas instrucciones.
- **Tamaño: la mejora es modesta (−7 % en disco).** Casi todo el peso viene de la base Debian y de Node (157 MB + 85 MB). Bajar más exigiría otra base (Alpine, que usa musl, o distroless, sin shell). No se probó por el riesgo con dependencias nativas (`esbuild`, usado por `tsx`).
- **Dive no mejoró (98,69 % → 98,70 %).** El espacio desperdiciado es de la base (`/var/cache/debconf`, `/var/lib/dpkg`) y no de nuestras capas.
- **CVE que quedan (61 HIGH+CRITICAL):**
  - `zlib1g` CVE-2023-45853 (CRITICAL): Debian lo marca `will_not_fix`; solo se evita cambiando de base.
  - `proxy-addr` 2.0.7 (CRITICAL): ya existe 2.0.8; se arregla **actualizando la dependencia**, no la imagen.
  - Otras de `fast-uri`, `body-parser` y `@modelcontextprotocol/sdk`: de dependencias de npm; hay que actualizarlas y volver a ejecutar las pruebas del backend.
- **`tsx` en producción.** Ejecutar TypeScript con `tsx` obliga a llevar su cadena de dependencias a la imagen. Lo más limpio sería compilar a JavaScript en una etapa de build y ejecutar solo `node dist/`; no se hizo para no tocar el proceso de compilación del proyecto.

## Comandos usados

Preparación y datos de la máquina:

```bash
git switch main && git switch -c lab-s08/aguilar
git checkout release/8.2.0 -- backend
(sw_vers; docker version) > docs/laboratorios/evidencia/00-maquina.txt 2>&1
```

Construcción (el compose usa el contexto de la raíz y `backend/Dockerfile`):

```bash
docker compose build api
docker tag sgai-backend:latest sgai-backend:antes      # antes de los cambios
docker tag sgai-backend:latest sgai-backend:despues    # después de los cambios
```

Mediciones (las mismas para `antes` y `despues`):

```bash
docker image ls sgai-backend:antes
docker image history sgai-backend:antes
docker image inspect sgai-backend:antes --format '{{len .RootFS.Layers}}'

docker run --rm -e CI=true -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:v0.13.1@sha256:f1886e6c32c094fc41a623c1989f5cb3e48aa766da5f0be233f911fc1d85ce10 sgai-backend:antes

docker image inspect sgai-backend:antes --format "{{.Config.User}}"
docker run --rm --entrypoint id sgai-backend:antes

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache \
  aquasec/trivy:0.76.1@sha256:790fd66d1697395d8693d1acaa1ea702406a20f109b6fc7bac8db623eca6c06c \
  image --scanners vuln sgai-backend:antes
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache \
  aquasec/trivy:0.76.1@sha256:790fd66d1697395d8693d1acaa1ea702406a20f109b6fc7bac8db623eca6c06c \
  image --scanners vuln --severity HIGH,CRITICAL sgai-backend:antes

docker run --rm -i \
  hadolint/hadolint:v2.15.1@sha256:32dac94127fd60b7b7e3fbfc65e1383b9b5e25c9bfd7b8536de7a539fe68a12d < backend/Dockerfile
```

Cambio de `tsx` a dependencia de producción:

```bash
cd backend && npm install --save-prod tsx@4.22.4 --package-lock-only --ignore-scripts
```

Arranque y comprobación de que sigue funcionando:

```bash
docker compose up -d --wait
docker compose ps
curl -i http://localhost:3001/health
docker compose exec api sh -c 'touch data/prueba && rm data/prueba && echo escritura-ok'
docker compose logs api | tail -20
docker compose down
```

Entrega:

```bash
git push -u origin lab-s08/aguilar
git rev-parse HEAD
```
