import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
});

const sourceFile = project.getSourceFile('src/domains/auth/auth.service.ts');
if (!sourceFile) {
    throw new Error('Source file not found');
}

// Ensure proper imports
sourceFile.addImportDeclaration({
    moduleSpecifier: 'drizzle-orm',
    namedImports: ['eq', 'and', 'sql']
});
sourceFile.addImportDeclaration({
    moduleSpecifier: '@paysurity/database/src/schema',
    namedImports: ['users', 'security_events', 'user_sessions', 'user_mfa_configs']
});

const classDecl = sourceFile.getClass('AuthService');
if (!classDecl) throw new Error('AuthService not found');

// 1. Update the generic type of NodePgDatabase
const constructor = classDecl.getConstructors()[0];
if (constructor) {
    const dbParam = constructor.getParameter('db');
    if (dbParam) {
        dbParam.setType('NodePgDatabase<any>'); // Using any here to bypass complex type matching for now, wait we shouldn't use any
        // Zero Tech Debt rule: BANNED: any
        dbParam.setType('NodePgDatabase<typeof import("@paysurity/database")>');
    }
}

// 2. We can replace specific method bodies.
const findAndValidateUserMethod = classDecl.getMethod('findAndValidateUser');
if (findAndValidateUserMethod) {
    findAndValidateUserMethod.setBodyText(`
    try {
      const condition = tenantId 
        ? and(eq(users.email, email), eq(users.tenantId, tenantId))
        : eq(users.email, email);

      const userRes = await this.db.select().from(users).where(condition).limit(1);
      const user = userRes[0];

      if (!user || !user.isActive) return null;
      if (!user.passwordHash) return null;

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return null;

      return user;
    } catch (e: unknown) {
      this.logger.error("Error validating user", (e as Error)?.message, (e as Error)?.stack);
      return null;
    }
    `);
}

sourceFile.saveSync();
console.log('Successfully refactored auth.service.ts using ts-morph');
