# Imagen del backend de SGAI. Contexto de build: la raíz del repositorio.
#   docker build -f backend/Dockerfile -t sgai-backend .
# La configuración y los secretos NO van en la imagen: se pasan al ejecutar
#   docker run -e JWT_SECRET=... -e GROQ_API_KEY=... -p 3001:3001 sgai-backend
# @see docs/auditoria/12factor.md F12-06
FROM node:20-slim

ENV NODE_ENV=production
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
# tsx es devDependency pero es lo que ejecuta el TypeScript; se instalan todas las dependencias.
RUN npm ci --include=dev

COPY backend/ ./
# El .env y las dependencias locales no se copian (ver .dockerignore).

EXPOSE 3001

# Forma exec y sin wrapper de npm: SIGTERM llega directo al proceso de Node.
CMD ["node", "--import", "tsx", "api/server.ts"]
