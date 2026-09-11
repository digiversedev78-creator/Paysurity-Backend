import { Exclude } from 'class-transformer';
import { createLogger, format, transports, Logger as WinstonLoggerType } from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

// Define AsyncLocalStorage to store request-specific context (like traceId and tenantId).
// This instance will be used by middleware to set context and by the logger to retrieve it.
export const asyncLocalStorage = new AsyncLocalStorage<Record<string, any>>();

// Define the service name for consistent logging across the application.
const SERVICE_NAME = 'api';

// Custom Winston format to inject contextual data (X-Trace-Id, tenantId, service name)
// into every log entry by reading from AsyncLocalStorage.
const contextFormat = format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    if (store.traceId) {
      info['X-Trace-Id'] = store.traceId;
    }
    if (store.tenantId) {
      info.tenantId = store.tenantId;
    }
  }
  info.service = SERVICE_NAME;
  return info;
});

// Determine if the current environment is production for log formatting.
const isProduction = process.env.NODE_ENV === 'production';

// Create and configure the Winston logger instance.
const loggerInstance = createLogger({
  // Set the default log level; can be overridden by the LOG_LEVEL environment variable.
  level: process.env.LOG_LEVEL || 'info',
  // Combine multiple formats:
  // 1. Custom contextFormat to add X-Trace-Id, tenantId, and service name.
  // 2. Timestamp format for when the log occurred.
  // 3. Environment-specific formatting (JSON for production, pretty for development).
  format: format.combine(
    contextFormat(), // Apply custom context format first
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    isProduction
      ? format.json() // Production environment: output logs as JSON
      : format.combine( // Development environment: output pretty, colored logs
          format.colorize({ all: true }), // Add colors to log levels and other parts for better readability in dev console
          format.printf(({ level, message, timestamp, service, tenantId, 'X-Trace-Id': traceId, ...metadata }) => {
            // Construct the log string for the development console.
            const logParts = [
              timestamp,
              `[${service}]`,
              `[${level}]`,
            ];
            if (tenantId) logParts.push(`[Tenant: ${tenantId}]`);
            if (traceId) logParts.push(`[Trace: ${traceId}]`);

            let logString = logParts.join(' ') + `: ${message}`;

            // Filter out internal Winston metadata keys and those already included in the log parts
            // before stringifying any remaining metadata.
            const filteredMetadata = Object.keys(metadata).reduce((acc, key) => {
              // Exclude internal Winston symbols and keys explicitly handled in the logParts/logString
              if (!['level', 'message', 'timestamp', 'service', 'tenantId', 'X-Trace-Id', Symbol.for('level'), Symbol.for('message'), Symbol.for('splat')].includes(key)) {
                acc[key] = metadata[key];
              }
              return acc;
            }, {});

            if (Object.keys(filteredMetadata).length > 0) {
              logString += ` ${JSON.stringify(filteredMetadata)}`;
            }
            return logString;
          })
      )
  ),
  transports: [
    new transports.Console(), // Output logs to the console
  ],
});

// Export the logger instance for use throughout the application.
// This allows other modules to import and use 'Logger.info()', 'Logger.warn()', etc.
export const Logger = loggerInstance;

// Re-export the Winston Logger type for type hinting if needed elsewhere
export type Logger = WinstonLoggerType;
