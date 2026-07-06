#!/bin/sh
set -e

echo "Aguardando PostgreSQL estar pronto..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "PostgreSQL não está pronto - aguardando..."
  sleep 2
done

echo "PostgreSQL está pronto!"

echo "Executando migrations SQL..."
for file in /app/sql/*.sql; do
  if [ -f "$file" ]; then
    echo "Executando $file..."
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file" || echo "Migration já executada ou erro (continuando...)"
  fi
done

echo "Migrations concluídas!"
echo "Iniciando aplicação..."

# Inicia a aplicação
exec node dist/main.js
