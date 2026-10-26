#!/usr/bin/env bash
# Levanta un PostgreSQL desechable en Docker, carga la semilla y guarda cada plan en salida/.
# Uso (desde la raíz del repositorio):  bash prototipos/postgres-paginacion/run.sh
# Es un prototipo del diseño: NO está conectado al backend, que hoy guarda todo en memoria.
set -euo pipefail

cd "$(dirname "$0")"
CONTENEDOR=sgai-pg-prototipo

if ! docker info >/dev/null 2>&1; then
  echo "Docker no está en ejecución. Abra Docker Desktop y vuelva a intentarlo." >&2
  exit 1
fi

docker rm -f "$CONTENEDOR" >/dev/null 2>&1 || true
# Base desechable solo local: sin contraseña (trust), publicada únicamente en 127.0.0.1.
docker run -d --name "$CONTENEDOR" -e POSTGRES_HOST_AUTH_METHOD=trust -p 127.0.0.1:5433:5432 postgres:17 >/dev/null

echo "Esperando a PostgreSQL..."
for i in $(seq 1 60); do
  docker exec "$CONTENEDOR" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
# La imagen reinicia el servidor una vez al inicializar: se espera a que acepte conexiones de nuevo.
sleep 3
docker exec "$CONTENEDOR" pg_isready -U postgres >/dev/null

mkdir -p salida
for archivo in 01-esquema 02-semilla 03-offset 04-cursor 05-indices; do
  echo "→ $archivo.sql"
  docker exec -i "$CONTENEDOR" psql -U postgres -v ON_ERROR_STOP=1 < "$archivo.sql" | tee "salida/$archivo.txt"
done

echo
echo "Listo. Los planes quedaron en prototipos/postgres-paginacion/salida/."
echo "Para borrar la base:  docker rm -f $CONTENEDOR"
