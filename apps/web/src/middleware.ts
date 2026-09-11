import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Extract path
  const path = req.nextUrl.pathname;

  // Paths that require authentication
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/demo-wallet');

  if (isProtectedPath) {
    // Check for our JWT token cookie
    const token = req.cookies.get('jwt_token')?.value;

    if (!token || token.split('.').length !== 3) {
      // Redirect to login if not authenticated or invalid token format
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Super admin manual area
  const isSuperAdminManual = path.startsWith('/super-admin-manual');

  if (isSuperAdminManual) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const decodedValue = atob(authValue);
      const [user, pwd] = decodedValue.split(':');

      if (pwd === 'sa1234') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Unauthorized: Secure Vault Area', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Super Admin Secure Vault"',
      },
    });
  }

  // Strict Rate Limiting for API routes
  if (path.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for') ?? req.ip ?? '127.0.0.1';
    const requestCount = parseInt(req.cookies.get(`rate-limit-${ip}`)?.value || '0', 10);
    
    if (requestCount > 100) {
      return new NextResponse('Too Many Requests - DDoS Protection Triggered', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/demo-wallet/:path*', '/super-admin-manual/:path*', '/super-admin-manual', '/api/:path*'],
};
