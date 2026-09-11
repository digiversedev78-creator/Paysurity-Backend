---
description: How to scaffold a new NestJS module from a canonical requirement
---

# /scaffold-module — Create a New Module from Canonical Spec

// turbo-all

## Steps

### 1. Read the Canonical Source
Read `Requirements/Canonical/{VERTICAL_FILE}.md` to extract:
- Table names and column definitions
- Service method signatures
- API endpoint table
- Seed data

### 2. Create Module Directory
```bash
mkdir -p apps/api/src/modules/{vertical}/dto
```

### 3. Generate Migration
Copy the SQL from the canonical requirement into `apps/api/db/migrations/{NNN}_{vertical}.sql`

### 4. Generate Seed
Copy the seed SQL from the canonical requirement into `apps/api/db/seeds/{NNN}_{vertical}_seed.sql`

### 5. Generate Drizzle Schema
Create `packages/drizzle-schema/src/{vertical}.ts` with table definitions matching the migration SQL.

### 6. Generate Service
Create `apps/api/src/modules/{vertical}/{vertical}.service.ts`:
- Import Drizzle schema
- Import ConfigService
- Implement every method from the canonical spec
- Use `this.configService.get()` for all configurable values

### 7. Generate Controller
Create `apps/api/src/modules/{vertical}/{vertical}.controller.ts`:
- One route per API endpoint from canonical spec
- `@Roles()` from RBAC_PERMISSION_MATRIX.md
- Create DTOs in `dto/` directory

### 8. Generate Module
Create `apps/api/src/modules/{vertical}/{vertical}.module.ts`:
```typescript
@Module({
  imports: [DrizzleModule, ConfigModule, /* dependent modules */],
  controllers: [{Vertical}Controller],
  providers: [{Vertical}Service],
  exports: [{Vertical}Service],
})
export class {Vertical}Module {}
```

### 9. Register Module
Add `{Vertical}Module` to `apps/api/src/app.module.ts` imports

### 10. Run Migration + Seed
```bash
cd apps/api && pnpm db:migrate && pnpm db:seed
```

### 11. Verify Compilation
```bash
cd apps/api && pnpm build
```
