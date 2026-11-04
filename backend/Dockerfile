# Imagen del backend de SGAI. Contexto de build: la raíz del repositorio.
#   docker compose build api        (o: docker build -f backend/Dockerfile -t sgai-backend .)
# La configuración y los secretos NO van en la imagen: se pasan al ejecutar
#   docker run -e JWT_SECRET=... -e GROQ_API_KEY=... -p 3001:3001 sgai-backend
# @see docs/auditoria/12factor.md F12-06
#
# Lab S08 (opción A): multi-stage, base fijada con versión y digest, usuario no root.

# --- Etapa 1: dependencias de producción ---------------------------------------
# CORRECCIÓN: etiqueta exacta + digest (antes: node:20-slim, flotante y fuera de soporte).
FROM node:24.22.2-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS deps
WORKDIR /app/backend

# CORRECCIÓN: primero solo los manifiestos (caché de capas) y sin devDependencies
# (antes: npm ci --include=dev, con TypeScript y todos los @types).
COPY backend/package.json backend/package-lock.json ./
# tsx es lo que ejecuta el TypeScript en producción: se movió de devDependencies a
# dependencies en package.json (si no, --omit=dev lo descarta y el arranque falla).
RUN npm ci --omit=dev \
 && npm cache clean --force

# --- Etapa 2: imagen final -------------------------------------------------------
FROM node:24.22.2-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c
ENV NODE_ENV=production
WORKDIR /app/backend

# CORRECCIÓN: solo node_modules de producción; sin caché de npm ni herramientas de build.
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ ./
# El .env, las dependencias locales y los tests no se copian (ver .dockerignore).

# CORRECCIÓN: la app escribe en data/ (db.json, conversaciones.json); solo esa carpeta
# es de "node". El código queda de root y el proceso no puede reescribirlo.
RUN chown -R node:node data \
 # npm/yarn no se usan en ejecución (CMD llama a node): fuera superficie y CVE.
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

# CORRECCIÓN: usuario no root (antes: uid=0).
USER 1000:1000

EXPOSE 3001

# Forma exec y sin wrapper de npm: SIGTERM llega directo al proceso de Node.
CMD ["node", "--import", "tsx", "api/server.ts"]
