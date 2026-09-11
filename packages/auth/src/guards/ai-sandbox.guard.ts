import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class AiSandboxGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.tenantId) {
      throw new ForbiddenException('AI Sandboxing Failed: No authenticated tenant context found.');
    }

    const payload = request.body;
    if (payload && payload.prompt) {
      this.enforceHeuristicPromptFirewall(payload.prompt, user.role);
    }

    // Bind AI execution explicitly to the user's RBAC scope
    // A Branch-Manager cannot ask the AI to query the Tenant-Admin's global scope.
    request.aiSandboxContext = {
      tenantId: user.tenantId,
      locationId: user.locationId || null,
      maxRoleScope: user.role,
      isSuperAdmin: user.role === UserRole.SUPER_ADMIN
    };

    return true;
  }

  private enforceHeuristicPromptFirewall(prompt: string, userRole: UserRole) {
    const lowerPrompt = prompt.toLowerCase();
    
    // 1. Basic Jailbreak Heuristics
    const jailbreakPatterns = [
      'ignore previous instructions',
      'system prompt',
      'you are now',
      'override',
      'bypass'
    ];
    
    for (const pattern of jailbreakPatterns) {
      if (lowerPrompt.includes(pattern)) {
        throw new ForbiddenException(`AI Firewall Blocked Request: Detected jailbreak pattern '${pattern}'.`);
      }
    }

    // 2. Intra-Tenant RBAC Escalation Check
    if (userRole === UserRole.BRANCH_MANAGER || userRole === UserRole.EMPLOYEE) {
      const globalPatterns = [
        'all branches',
        'tenant admin',
        'global report',
        'all users in company'
      ];
      
      for (const pattern of globalPatterns) {
        if (lowerPrompt.includes(pattern)) {
          throw new ForbiddenException(`AI Firewall Blocked Request: Role ${userRole} attempted to prompt for global tenant data.`);
        }
      }
    }
  }
}
