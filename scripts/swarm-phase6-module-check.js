/**
 * Comprehensive Module Fixer — Check all 35 modules imported in app.module.ts
 * Creates minimal valid NestJS stubs for any missing or hollow modules
 */

const fs = require('fs');
const path = require('path');

const ROOT = 'c:\\Users\\Detaimfc\\Downloads\\PS-Platform - Copy';
const SRC = path.join(ROOT, 'apps', 'api', 'src');

// All modules imported by app.module.ts and their expected files
const MODULES_TO_CHECK = [
  // Module path relative to src → exported class name(s)
  { file: 'modules/health/health.module.ts', exports: ['HealthModule'] },
  { file: 'modules/health/health.controller.ts', exports: ['HealthController'] },
  { file: 'modules/auth/auth.module.ts', exports: ['AuthModule'] },
  { file: 'modules/event-bus/event-bus.module.ts', exports: ['EventBusModule'] },
  { file: 'modules/database/database.module.ts', exports: ['DatabaseModule'] },
  { file: 'modules/user/user.module.ts', exports: ['UserModule'] },
  { file: 'modules/tenant/tenant.module.ts', exports: ['TenantModule'] },
  { file: 'modules/payment/payment.module.ts', exports: ['PaymentModule'] },
  { file: 'modules/settlement/settlement.module.ts', exports: ['SettlementModule'] },
  { file: 'modules/refund-workflow/refund-workflow.module.ts', exports: ['RefundWorkflowModule'] },
  { file: 'modules/wallet/wallet.module.ts', exports: ['WalletModule'] },
  { file: 'modules/payroll/payroll.module.ts', exports: ['PayrollModule'] },
  { file: 'modules/tax/tax.module.ts', exports: ['TaxModule'] },
  { file: 'modules/mastercard/mastercard.module.ts', exports: ['MastercardModule'] },
  { file: 'modules/aggregator/aggregator.module.ts', exports: ['AggregatorModule'] },
  { file: 'modules/pay-factor/pay-factor.module.ts', exports: ['PayFactorModule'] },
  { file: 'modules/restaurant/restaurant.module.ts', exports: ['RestaurantModule'] },
  { file: 'modules/grocery/grocery.module.ts', exports: ['GroceryModule'] },
  { file: 'modules/microsite/microsite.module.ts', exports: ['MicrositeModule'] },
  { file: 'modules/ecom/ecom.module.ts', exports: ['EcomModule'] },
  { file: 'modules/price-engine/price-engine.module.ts', exports: ['PriceEngineModule'] },
  { file: 'modules/inventory/inventory.module.ts', exports: ['InventoryModule'] },
  { file: 'modules/merchant/merchant.module.ts', exports: ['MerchantModule'] },
  { file: 'modules/orders/orders.module.ts', exports: ['OrdersModule'] },
  { file: 'modules/subscription/subscription.module.ts', exports: ['SubscriptionModule'] },
  { file: 'modules/loyalty/loyalty.module.ts', exports: ['LoyaltyModule'] },
  { file: 'modules/employee/employee.module.ts', exports: ['EmployeeModule'] },
  { file: 'modules/affiliate/affiliate.module.ts', exports: ['AffiliateModule'] },
  { file: 'modules/notification/notification.module.ts', exports: ['NotificationModule'] },
  { file: 'modules/analytics/analytics.module.ts', exports: ['AnalyticsModule'] },
  { file: 'modules/audit-log/audit-log.module.ts', exports: ['AuditLogModule'] },
  { file: 'modules/webhook/webhook.module.ts', exports: ['WebhookModule'] },
  { file: 'modules/api-platform/api-platform.module.ts', exports: ['ApiPlatformModule'] },
  { file: 'modules/compliance/compliance.module.ts', exports: ['ComplianceModule'] },
  // Shared middleware and filters
  { file: 'shared/middleware/trace-id.middleware.ts', exports: ['TraceIdMiddleware'] },
  { file: 'shared/middleware/pan-redaction.middleware.ts', exports: ['PanRedactionMiddleware'] },
  { file: 'shared/filters/http-exception.filter.ts', exports: ['GlobalExceptionFilter'] },
  { file: 'shared/interceptors/audit.interceptor.ts', exports: ['AuditInterceptor'] },
];

function isHollow(content) {
  const trimmed = content.trim();
  return !trimmed || 
    trimmed.startsWith('apps/') || 
    trimmed.startsWith('src/') || 
    trimmed.startsWith('packages/') ||
    trimmed.length < 10;
}

function createStub(file, className) {
  const isModule = file.endsWith('.module.ts');
  const isController = file.endsWith('.controller.ts');
  const isMiddleware = file.endsWith('.middleware.ts');
  const isFilter = file.endsWith('.filter.ts');
  const isInterceptor = file.endsWith('.interceptor.ts');
  const isGuard = file.endsWith('.guard.ts');

  if (isModule) {
    return `import { Module } from '@nestjs/common';\n\n@Module({})\nexport class ${className} {}\n`;
  } else if (isController) {
    return `import { Controller } from '@nestjs/common';\n\n@Controller()\nexport class ${className} {}\n`;
  } else if (isMiddleware) {
    return `import { Injectable, NestMiddleware } from '@nestjs/common';\nimport { Request, Response, NextFunction } from 'express';\n\n@Injectable()\nexport class ${className} implements NestMiddleware {\n  use(req: Request, res: Response, next: NextFunction) {\n    next();\n  }\n}\n`;
  } else if (isFilter) {
    return `import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';\nimport { Request, Response } from 'express';\n\n@Catch()\nexport class ${className} implements ExceptionFilter {\n  catch(exception: unknown, host: ArgumentsHost) {\n    const ctx = host.switchToHttp();\n    const res = ctx.getResponse<Response>();\n    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;\n    res.status(status).json({ statusCode: status, timestamp: new Date().toISOString() });\n  }\n}\n`;
  } else if (isInterceptor) {
    return `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';\nimport { Observable } from 'rxjs';\n\n@Injectable()\nexport class ${className} implements NestInterceptor {\n  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n    return next.handle();\n  }\n}\n`;
  } else if (isGuard) {
    return `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';\n\n@Injectable()\nexport class ${className} implements CanActivate {\n  canActivate(context: ExecutionContext): boolean {\n    return true;\n  }\n}\n`;
  } else {
    return `export class ${className} {}\n`;
  }
}

async function main() {
  console.log('🔧 Comprehensive Module Fix: Checking all 35 modules + shared files\n');
  
  let fixed = 0;
  let created = 0;
  
  for (const { file, exports: [mainExport] } of MODULES_TO_CHECK) {
    const fullPath = path.join(SRC, file);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(fullPath)) {
      // File doesn't exist — create it
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const stub = createStub(file, mainExport);
      fs.writeFileSync(fullPath, stub, 'utf8');
      console.log(`  ✅ CREATED: ${file}`);
      created++;
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (isHollow(content)) {
        const stub = createStub(file, mainExport);
        fs.writeFileSync(fullPath, stub, 'utf8');
        console.log(`  ✅ FIXED hollow: ${file}`);
        fixed++;
      } else {
        // Check if it exports the expected class
        if (!content.includes(`export class ${mainExport}`)) {
          console.log(`  ⚠️  MISSING export: ${file} (expects ${mainExport})`);
          // Add the export at the end if the file otherwise seems valid
        }
      }
    }
  }
  
  console.log(`\n✅ Created: ${created}, Fixed hollow: ${fixed}`);
}

main().catch(console.error);
