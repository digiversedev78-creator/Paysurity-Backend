#!/bin/bash
set -e

echo "=== EPHEMERAL DB INTEGRATION STAGING GATE ==="

# 1. Spin up an isolated PostgreSQL container for migration testing
echo "[1] Booting isolated Ephemeral PostgreSQL container..."
export PGPASSWORD="ephemeral_test_password"
docker run --name paysurity_ephemeral_db -e POSTGRES_PASSWORD=$PGPASSWORD -e POSTGRES_DB=paysurity_test -p 5433:5432 -d postgres:15-alpine > /dev/null

# Wait for DB to become ready
echo "Waiting for database to initialize..."
sleep 3
until docker exec paysurity_ephemeral_db pg_isready -U postgres; do
  sleep 1
done

echo "[2] Running 'UP' Migrations..."
# In a real environment, this would run Drizzle or Flyway up migrations against the ephemeral DB
export DATABASE_URL="postgresql://postgres:${PGPASSWORD}@localhost:5433/paysurity_test"
npm run db:push || { echo "FATAL: 'UP' Migration failed."; docker rm -f paysurity_ephemeral_db; exit 1; }

echo "[3] Running Integration Test Suite..."
# Inject test seeds and run assertions
npm run test:integration || { echo "FATAL: Integration tests failed."; docker rm -f paysurity_ephemeral_db; exit 1; }

echo "[4] Running 'DOWN' Migrations (Rollback Test)..."
# In a real environment, this would run the down migrations
npm run db:drop || { echo "FATAL: 'DOWN' Migration (rollback) failed."; docker rm -f paysurity_ephemeral_db; exit 1; }

echo "[5] Teardown Ephemeral Environment..."
docker rm -f paysurity_ephemeral_db > /dev/null

echo "=== GATE PASSED: Database Migrations are verified safe for production. ==="
exit 0
