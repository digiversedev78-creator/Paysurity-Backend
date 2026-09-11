import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * locationGuard.ts — Edge Middleware (Tier 1: UUID v4 Regex Guard)
 *
 * Runs at the Next.js Edge Runtime before any sub-super-admin route handler.
 * Enforces:
 *   1. Presence of x-location-id header (extracted from session cookie payload).
 *   2. Strict UUID v4 format validation via regex.
 *
 * If either check fails → 403 Forbidden immediately, no DB hit.
 * The backend LocationService performs the Tier 2 live DB structural check.
 *
 * Approved spec: Admin Routing & Context Protocol §1
 */

// RFC 4122 UUID v4 pattern — variant bits 8, 9, a, or b; version bit = 4
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function locationGuard(request: NextRequest): NextResponse | null {
  // Extract location ID from the custom header
  // The session cookie payload sets this header via the session middleware
  const locationId =
    request.headers.get('x-location-id') ??
    request.cookies.get('x-location-id')?.value ??
    null;

  // Guard 1: Header must be present
  if (!locationId || locationId.trim() === '') {
    return NextResponse.json(
      {
        statusCode: 403,
        error: 'Forbidden',
        message: 'Missing x-location-id header. Operator context cannot be established.',
        code: 'LOCATION_HEADER_MISSING',
      },
      { status: 403 },
    );
  }

  // Guard 2: Must be a valid UUID v4 — prevents injection and format tampering
  if (!UUID_V4_REGEX.test(locationId.trim())) {
    return NextResponse.json(
      {
        statusCode: 403,
        error: 'Forbidden',
        message: `Invalid location context: '${locationId}' does not conform to UUID v4 format.`,
        code: 'LOCATION_INVALID_FORMAT',
      },
      { status: 403 },
    );
  }

  // Guard passed — forward to route handler with validated location attached
  // The downstream API call will pass this through for Tier 2 DB validation
  const forwarded = NextResponse.next();
  forwarded.headers.set('x-validated-location-id', locationId.trim());
  return null; // null = allow through
}

export function withLocationGuard(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const guardResult = locationGuard(req);
    if (guardResult !== null) return guardResult;
    return handler(req);
  };
}
