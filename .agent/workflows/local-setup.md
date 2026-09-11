---
description: How to set up and start the local development environment
---

# /local-setup — Local Development Environment Setup

// turbo-all

## Prerequisites
- Node.js 20.x installed
- pnpm installed (`npm install -g pnpm`)
- Docker Desktop running
- PostgreSQL 15 (local or Docker)
- Redis 7 (local or Docker)

## Steps

### 1. Hosts File Configuration
```powershell
# Run as Administrator
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1   paysurity.dev api.paysurity.dev merchant.paysurity.dev store.paysurity.dev admin.paysurity.dev"
```

### 2. Infrastructure (Docker)
```bash
docker-compose up -d paysurity-db paysurity-redis
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Environment File
```bash
cp .env.example .env
# Edit .env: verify DB_HOST=localhost, DB_PORT=5434, REDIS_URL=redis://localhost:6379
```

### 5. Create Database
```bash
docker exec -it paysurity_local_db psql -U admin -d postgres -c "CREATE DATABASE paysurity_dev_db;"
```

### 6. Run Migrations
```bash
cd apps/api && pnpm db:migrate
```

### 7. Seed BistroBeest Data
```bash
cd apps/api && pnpm db:seed
```

### 8. Start API Server
```bash
cd apps/api && pnpm dev
# Verify: curl http://api.paysurity.dev:3000/health
```

### 9. Start Merchant Dashboard
```bash
cd apps/merchant-dashboard && pnpm dev
# Verify: open http://merchant.paysurity.dev:3001
```

### 10. Verify Login
- Navigate to http://merchant.paysurity.dev:3001/login
- Use BistroBeest admin credentials from seed data
- Dashboard should load with BistroBeest data
