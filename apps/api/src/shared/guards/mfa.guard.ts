import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming req.user is populated by an authentication guard

    // If there's no user object, or role isn't present, let other guards or handlers manage authentication/authorization.
    // This guard specifically enforces MFA for authenticated users with specific roles and on specific routes.
    if (!user || !user.role) {
      return true;
    }

    const financialManagementRoles = ['MANAGER', 'ADMIN', 'FINANCE'];
    const path = request.path;

    // Determine if the current endpoint requires MFA enforcement
    const requiresMfaEnforcement =
      path.startsWith('/api/payroll') ||
      path.startsWith('/api/settlement') ||
      path.startsWith('/api/api-keys');

    if (requiresMfaEnforcement) {
      // Check if the user's role is within the defined financial management tier
      const isInFinancialManagementTier = financialManagementRoles.includes(user.role);

      // If the user is in a financial management role AND MFA is not verified
      if (isInFinancialManagementTier && user.mfa_verified === false) {
        // Return 403 with MFA_REQUIRED error code
        throw new HttpException('MFA_REQUIRED', HttpStatus.FORBIDDEN);
      }
    }

    // If MFA enforcement is not required for this path,
    // or if the user is not in a financial management role,
    // or if MFA is already verified, allow the request to proceed.
    return true;
  }
}
