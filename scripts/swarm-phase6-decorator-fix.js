/**
 * swarm-phase6-decorator-fix.js
 * 
 * Scans all TypeScript source files in apps/api/src and ensures that
 * decorators/validators used in the file are properly imported.
 *
 * Anti-corruption fix: swarm workers generated decorator usage without
 * always including the decorator in the import statement.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, '..', 'apps', 'api', 'src');

// Map: decorator name → source package
const DECORATOR_SOURCES = {
  // @nestjs/swagger
  ApiProperty: '@nestjs/swagger',
  ApiPropertyOptional: '@nestjs/swagger',
  ApiTags: '@nestjs/swagger',
  ApiOperation: '@nestjs/swagger',
  ApiResponse: '@nestjs/swagger',
  ApiBody: '@nestjs/swagger',
  ApiParam: '@nestjs/swagger',
  ApiQuery: '@nestjs/swagger',
  ApiBearerAuth: '@nestjs/swagger',
  ApiExcludeEndpoint: '@nestjs/swagger',
  ApiHeader: '@nestjs/swagger',
  ApiConsumes: '@nestjs/swagger',
  ApiHideProperty: '@nestjs/swagger',
  ApiOkResponse: '@nestjs/swagger',
  ApiCreatedResponse: '@nestjs/swagger',
  ApiNotFoundResponse: '@nestjs/swagger',
  ApiBadRequestResponse: '@nestjs/swagger',
  ApiUnauthorizedResponse: '@nestjs/swagger',
  ApiInternalServerErrorResponse: '@nestjs/swagger',
  ApiNoContentResponse: '@nestjs/swagger',

  // @nestjs/common
  Injectable: '@nestjs/common',
  Controller: '@nestjs/common',
  Module: '@nestjs/common',
  Get: '@nestjs/common',
  Post: '@nestjs/common',
  Put: '@nestjs/common',
  Patch: '@nestjs/common',
  Delete: '@nestjs/common',
  Body: '@nestjs/common',
  Param: '@nestjs/common',
  Query: '@nestjs/common',
  Headers: '@nestjs/common',
  Req: '@nestjs/common',
  Res: '@nestjs/common',
  UseGuards: '@nestjs/common',
  UseInterceptors: '@nestjs/common',
  UsePipes: '@nestjs/common',
  UseFilters: '@nestjs/common',
  HttpCode: '@nestjs/common',
  HttpStatus: '@nestjs/common',
  HttpException: '@nestjs/common',
  NotFoundException: '@nestjs/common',
  BadRequestException: '@nestjs/common',
  UnauthorizedException: '@nestjs/common',
  ForbiddenException: '@nestjs/common',
  ConflictException: '@nestjs/common',
  InternalServerErrorException: '@nestjs/common',
  Logger: '@nestjs/common',
  Inject: '@nestjs/common',
  Optional: '@nestjs/common',
  Global: '@nestjs/common',
  SetMetadata: '@nestjs/common',
  createParamDecorator: '@nestjs/common',
  ExecutionContext: '@nestjs/common',
  NestMiddleware: '@nestjs/common',
  NestInterceptor: '@nestjs/common',
  CallHandler: '@nestjs/common',

  // class-validator
  IsString: 'class-validator',
  IsEmail: 'class-validator',
  IsNotEmpty: 'class-validator',
  IsOptional: 'class-validator',
  IsUUID: 'class-validator',
  IsNumber: 'class-validator',
  IsInt: 'class-validator',
  IsBoolean: 'class-validator',
  IsArray: 'class-validator',
  IsEnum: 'class-validator',
  IsDate: 'class-validator',
  IsDateString: 'class-validator',
  IsIn: 'class-validator',
  IsPositive: 'class-validator',
  Min: 'class-validator',
  Max: 'class-validator',
  MinLength: 'class-validator',
  MaxLength: 'class-validator',
  Length: 'class-validator',
  Matches: 'class-validator',
  ValidateNested: 'class-validator',
  IsObject: 'class-validator',
  IsNotEmptyObject: 'class-validator',
  ArrayMinSize: 'class-validator',
  ArrayMaxSize: 'class-validator',
  IsUrl: 'class-validator',
  IsPhoneNumber: 'class-validator',

  // class-transformer
  Type: 'class-transformer',
  Transform: 'class-transformer',
  Exclude: 'class-transformer',
  Expose: 'class-transformer',
  plainToInstance: 'class-transformer',
};

function getAllTsFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'dist') {
      results.push(...getAllTsFiles(path.join(dir, item.name)));
    } else if (item.isFile() && item.name.endsWith('.ts') && !item.name.includes('.spec.') && !item.name.includes('.e2e-spec.')) {
      results.push(path.join(dir, item.name));
    }
  }
  return results;
}

function getImportedNames(content) {
  const imported = new Map(); // name → package
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*'([^']+)'/g;
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    const pkg = m[2];
    const names = m[1].split(',').map(n => n.trim().replace(/\s+as\s+\S+/, '').trim()).filter(Boolean);
    for (const name of names) {
      imported.set(name, pkg);
    }
  }
  return imported;
}

function addImportToFile(content, name, pkg) {
  // Check if there's already an import from this package
  const existingImportRegex = new RegExp(`(import\\s*\\{)([^}]+)(\\}\\s*from\\s*'${pkg.replace('/', '\\/')}')`, 'g');
  const match = existingImportRegex.exec(content);
  if (match) {
    // Add to existing import block
    const newNames = match[2] + `,\n  ${name}`;
    return content.replace(existingImportRegex, `${match[1]}${newNames}${match[3]}`);
  } else {
    // Add new import at top (after any existing imports or at very top)
    const insertPoint = content.search(/^import /m);
    if (insertPoint >= 0) {
      return content.slice(0, insertPoint) + `import { ${name} } from '${pkg}';\n` + content.slice(insertPoint);
    } else {
      return `import { ${name} } from '${pkg}';\n` + content;
    }
  }
}

async function main() {
  const files = getAllTsFiles(SRC);
  console.log(`Scanning ${files.length} TypeScript files...`);
  
  let totalFixed = 0;
  let filesFixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const imported = getImportedNames(content);
    let changed = false;
    const fixes = [];

    for (const [decorator, pkg] of Object.entries(DECORATOR_SOURCES)) {
      // Check if the decorator is USED in the file (as @Decorator or as a function call)
      const usedAsDecorator = new RegExp(`@${decorator}[\\s\\(]`).test(content);
      const usedAsIdentifier = new RegExp(`[^a-zA-Z_]${decorator}[^a-zA-Z_]`).test(content) && 
                               !content.includes(`${decorator} = `) && // not defined
                               !content.includes(`class ${decorator}`); // not a class
      
      if ((usedAsDecorator || usedAsIdentifier) && !imported.has(decorator)) {
        content = addImportToFile(content, decorator, pkg);
        imported.set(decorator, pkg);
        fixes.push(`${decorator} from ${pkg}`);
        changed = true;
        totalFixed++;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      filesFixed++;
      console.log(`✅ Fixed ${path.relative(SRC, file)}: added [${fixes.join(', ')}]`);
    }
  }

  console.log(`\n✅ Done: Fixed ${totalFixed} missing imports across ${filesFixed} files`);
}

main().catch(console.error);
