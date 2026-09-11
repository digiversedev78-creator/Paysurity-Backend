import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isSuperAdminManual = req.nextUrl.pathname.startsWith('/super-admin-manual');

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/super-admin-manual/:path*', '/super-admin-manual'],
};
