import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * PAN Redaction Middleware — scans request/response bodies for card numbers
 * and redacts them. This is part of PCI zero-tolerance enforcement.
 *
 * Patterns detected:
 *   - 13-19 digit card numbers (Visa, MC, Amex, Discover)
 *   - Formatted: 4111-1111-1111-1111
 *   - Spaces: 4111 1111 1111 1111
 *   - Raw: 4111111111111111
 *
 * Redaction format: ****XXXX (last 4 visible)
 */
@Injectable()
export class PanRedactionMiddleware implements NestMiddleware {
  private readonly logger = new Logger('PanRedaction');

  // Match 13-19 digit sequences (with optional dashes/spaces)
  // UUIDs are explicitly excluded via preprocessing before this regex runs.
  private readonly PAN_REGEX =
    /\b(?:\d[ -]*?){13,19}\b/g;

  // UUID pattern — used to temporarily substitute UUIDs before PAN scanning
  private readonly UUID_REGEX =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  use(req: Request, res: Response, next: NextFunction): void {
    // Scan request body
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      try {
        const bodyStr = JSON.stringify(req.body);
        // Mask UUIDs before PAN scan to prevent false positives
        const { sanitized, restore } = this.maskUuids(bodyStr);
        this.PAN_REGEX.lastIndex = 0;
        if (this.PAN_REGEX.test(sanitized)) {
          this.logger.error(
            `PAN DETECTED in request body! Path: ${req.path}, TraceId: ${req.headers['x-trace-id'] || 'N/A'}. ` +
            `Redacting and logging security event.`,
          );
          req.body = JSON.parse(restore(this.redact(sanitized)));
          // TODO: Write security_events row for PCI audit trail
        }
      } catch (error) {
        this.logger.warn(
          `Failed to process request body for PAN redaction: ${error.message}. Path: ${req.path}.`
        );
      }
    }

    // Intercept response to scan outgoing body
    // We intercept `res.send` because `res.json` internally calls `res.send`.
    // This provides a more robust interception point for all JSON-like and string responses.
    const originalSend = res.send.bind(res);
    res.send = (body: any): Response => {
      let bodyToProcess = body;
      let bodyStr: string | null = null;
      let originalBodyWasObject = false;

      // Only proceed if body is not null/undefined
      if (bodyToProcess !== undefined && bodyToProcess !== null) {
        try {
          if (typeof bodyToProcess === 'object') {
            // Assume it's an object that needs to be stringified (e.g., JSON)
            bodyStr = JSON.stringify(bodyToProcess);
            originalBodyWasObject = true;
          } else if (typeof bodyToProcess === 'string') {
            // It's already a string, process directly
            bodyStr = bodyToProcess;
          }
          // For other types (number, boolean), bodyStr will remain null, and no redaction will occur.
          // This is fine as PANs won't be found in such primitive types directly.

          if (bodyStr) {
            const { sanitized, restore } = this.maskUuids(bodyStr);
            this.PAN_REGEX.lastIndex = 0;
            if (this.PAN_REGEX.test(sanitized)) {
              this.logger.error(
                `PAN DETECTED in response body! Path: ${req.path}, TraceId: ${req.headers['x-trace-id'] || 'N/A'}. ` +
                `Redacting.`,
              );
              const redactedStr = restore(this.redact(sanitized));

              if (originalBodyWasObject) {
                bodyToProcess = JSON.parse(redactedStr);
              } else {
                bodyToProcess = redactedStr;
              }
            }
          }
        } catch (error) {
          // FAIL-CLOSED: If PAN redaction logic crashes, we MUST NOT send the original
          // body — it may contain plaintext Credit Card numbers (PANs).
          // Terminate the response with HTTP 500 to block the data from being transmitted.
          this.logger.error(
            `[PCI CRITICAL] PAN redaction FAILED on response body. ` +
            `Path=${req.path} | Error=${error.message} | ` +
            `Terminating response to prevent potential PAN disclosure.`,
            error.stack,
          );
          // Mutate the response body to a safe error payload and terminate
          res.status(500);
          return originalSend(
            JSON.stringify({
              statusCode: 500,
              message:
                'Internal PCI compliance error. Response blocked to protect cardholder data.',
              traceId: req.headers['x-trace-id'] || null,
            }),
          );
        }
      }
      return originalSend(bodyToProcess);
    };

    next();
  }

  /**
   * Temporarily replaces UUID strings with safe placeholders to prevent
   * PAN_REGEX false positives on UUID digit sequences.
   * Returns the masked string and a restore function.
   */
  private maskUuids(text: string): { sanitized: string; restore: (s: string) => string } {
    const uuidMap: Map<string, string> = new Map();
    let idx = 0;
    const sanitized = text.replace(this.UUID_REGEX, (match) => {
      const placeholder = `__UUID_${idx++}__`;
      uuidMap.set(placeholder, match);
      return placeholder;
    });
    const restore = (s: string) => {
      let result = s;
      uuidMap.forEach((original, placeholder) => {
        result = result.replace(new RegExp(placeholder, 'g'), original);
      });
      return result;
    };
    return { sanitized, restore };
  }

  /**
   * Redacts all detected PAN patterns in a given text.
   * Replaces digits with '****' followed by the last 4 digits.
   * Handles optional spaces and dashes within the PAN.
   */
  private redact(text: string): string {
    return text.replace(this.PAN_REGEX, (match) => {
      const digits = match.replace(/[\s-]/g, '');
      if (digits.length >= 4) {
        return '****' + digits.slice(-4);
      }
      return '****';
    });
  }
}
