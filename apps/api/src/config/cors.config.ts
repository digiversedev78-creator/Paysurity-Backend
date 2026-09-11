const getAllowedOrigins = (): (string | RegExp)[] | boolean => {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const isProduction = process.env.NODE_ENV === 'production';

  if (allowedOriginsEnv) {
    const origins = allowedOriginsEnv
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);

    if (origins.length > 0) {
      return origins;
    }
  }

  // Strict in production: if ALLOWED_ORIGINS is not set or is empty,
  // effectively disallow all origins by returning `false`.
  // This means no `Access-Control-Allow-Origin` header will be sent,
  // causing browsers to block cross-origin requests.
  if (isProduction) {
    return false;
  } else {
    // For non-production environments, allow all origins if not explicitly configured,
    // to facilitate development.
    return ['*'];
  }
};

export const corsConfig = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Trace-Id',
    'X-API-Key',
    'X-Idempotency-Key',
  ],
  exposedHeaders: ['X-Trace-Id', 'Retry-After'],
  credentials: true,
};
