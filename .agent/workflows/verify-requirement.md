---
description: How to verify a requirement meets all 7 Definition of Done gates
---

# /verify-requirement — Validate DoD Gates

// turbo-all

## Usage
Run `/verify-requirement REQ-{VERT}-{NNN}` to check if a requirement passes all 7 gates.

## Steps

### 1. Identify the Requirement
Read `Requirements/Canonical/{VERTICAL_FILE}.md` and find the REQ section.

### 2. Gate 1 Check — Schema & Seed
```bash
# Migration file exists?
ls apps/api/db/migrations/*_{vertical}.sql
# Seed file exists?
ls apps/api/db/seeds/*_{vertical}_seed.sql
# No hardcoded values in service module?
grep -rn --include="*.ts" -E "(= [0-9]{2,}[^;])" apps/api/src/modules/{vertical}/ | grep -v "config" | grep -v "seed" | grep -v "migration" | grep -v ".spec."
```

### 3. Gate 2 Check — Service Layer
```bash
# Service file exists?
ls apps/api/src/modules/{vertical}/{vertical}.service.ts
# All config reads use ConfigService?
grep -rn "hardcoded\|magic number" apps/api/src/modules/{vertical}/ --include="*.ts"
# External APIs use circuit breaker?
grep -rn "opossum\|CircuitBreaker" apps/api/src/modules/{vertical}/ --include="*.ts"
# CRDT / Mesh Validation? (Fails Gate 2 if Offline logic lacks VectorClocks)
grep -rn "crdt\|VectorClock\|lattice" apps/api/src/modules/{vertical}/ --include="*.ts"
# PII Strict Filter (Zero raw PII manipulations)
grep -rn "phone_e164\|email" apps/api/src/modules/{vertical}/ --include="*.ts" | grep -v ".spec." && echo "SECURITY_VULNERABILITY_REJECTION: RAW PII DETECTED" && exit 1
```

### 4. Gate 3 Check — API Endpoints
```bash
# Controller exists?
ls apps/api/src/modules/{vertical}/{vertical}.controller.ts
# RBAC decorators present?
grep -rn "@Roles" apps/api/src/modules/{vertical}/ --include="*.ts"
# Swagger decorators present?
grep -rn "@ApiOperation" apps/api/src/modules/{vertical}/ --include="*.ts"
```

### 5. Gate 4 Check — UI/UX
- Visually inspect all screens at 3 breakpoints
- Run axe-core accessibility check
- Verify loading, error, and empty states exist
- Post-Quantum Scanner:
```bash
grep -rn "RS256\|RSA\|crypto.createSign" apps/api/src/modules/{vertical}/ --include="*.ts" && echo "SECURITY_VULNERABILITY_REJECTION: LEGACY CRYPTO (PQ REQUIRED)" && exit 1
```

### 6. Gate 5 Check — Integration
```bash
# Cross-vertical imports verified?
grep -rn "import.*from.*modules/" apps/api/src/modules/{vertical}/ --include="*.ts"
# BullMQ jobs registered?
grep -rn "@Cron\|@Process\|addJob\|BullModule" apps/api/src/modules/{vertical}/ --include="*.ts"
# HSM Intent Spooling Mandate
grep -rn "hsm\|IntentSpool" apps/api/src/modules/{vertical}/ --include="*.ts"
```

### 7. Gate 6 Check — Tests
```bash
# Test files exist?
ls apps/api/src/modules/{vertical}/*.spec.ts
ls apps/api/test/integration/{vertical}*.spec.ts
# All tests pass?
cd apps/api && pnpm test -- --filter {vertical}
```

### 8. Gate 7 Check — Documentation
```bash
# README exists?
ls apps/api/src/modules/{vertical}/README.md
# No TODOs in production code?
grep -rn "TODO\|FIXME\|HACK" apps/api/src/modules/{vertical}/ --include="*.ts" | grep -v ".spec."
# No console.log in production code?
grep -rn "console.log" apps/api/src/modules/{vertical}/ --include="*.ts" | grep -v ".spec."
# ISO 20022 Compliance check
grep -rn "pacs\.008\|<Chrgs>\|<Strd>" apps/api/src/modules/{vertical}/ --include="*.ts"
```

### 9. Final Verdict
If ALL gates pass: mark requirement as `DONE`
If any gate fails: mark as `IN_PROGRESS` with note on which gate failed
