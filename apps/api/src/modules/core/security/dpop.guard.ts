import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
const verifyDPoPProof: any = {};

@Injectable()
export class DPoPGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const dpopHeader = request.headers['dpop'];
    const token = request.headers['authorization'];
    
    if (!dpopHeader || !token) throw new UnauthorizedException('Missing DPoP or Bearer token');
    
    const isValid = verifyDPoPProof(dpopHeader, token, request.method, request.url);
    if (!isValid) throw new UnauthorizedException('Invalid DPoP proof');
    
    return true;
  }
}

