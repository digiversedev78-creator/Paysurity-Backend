/**
 * Gateway Response Sanitizer — strips PAN/sensitive data from
 * gateway responses before they are persisted to the database.
 *
 * COMPLIANCE: PCI DSS §3.4 — stored cardholder data must be
 * unreadable. Gateway raw responses can contain:
 *   - Full card number (some gateways return it!)
 *   - CVV/CVC
 *   - Track data
 *   - Full expiry date
 *
 * This sanitizer MUST be called before INSERT into payment_intents.gateway_response
 */

const PAN_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;
const CVV_REGEX = /\b\d{3,4}\b/;

const SENSITIVE_KEYS = new Set([
  'card_number',
  'cardNumber',
  'pan',
  'full_card',
  'fullCard',
  'account_number',
  'accountNumber',
  'cvv',
  'cvc',
  'cvv2',
  'cvc2',
  'security_code',
  'securityCode',
  'track_data',
  'trackData',
  'track1',
  'track2',
  'magnetic_stripe',
  'magneticStripe',
  'pin_block',
  'pinBlock',
  'encrypted_track',
  'encryptedTrack',
  'emv_data',
  'emvData',
  'card_token', // keep the token reference but strip raw card data
]);

/**
 * Recursively sanitize an object, removing or redacting sensitive fields.
 * Returns a new object — does NOT mutate the original.
 */
export function sanitizeGatewayResponse(
  response: Record<string, unknown>,
): Record<string, unknown> {
  if (!response || typeof response !== 'object') {
    return response;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(response)) {
    const keyLower = key.toLowerCase().replace(/[-_]/g, '');

    // Check if this key is in the sensitive set (case-insensitive, normalized)
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Check normalized key
    if (
      keyLower.includes('cardnumber') ||
      keyLower.includes('accountnumber') ||
      keyLower.includes('trackdata') ||
      keyLower.includes('pinblock') ||
      keyLower.includes('magneticstripe')
    ) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recurse into nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeGatewayResponse(value as Record<string, unknown>);
      continue;
    }

    // Recurse into arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeGatewayResponse(item as Record<string, unknown>)
          : typeof item === 'string'
            ? item.replace(PAN_REGEX, '****')
            : item,
      );
      continue;
    }

    // Redact string values that look like PANs
    if (typeof value === 'string') {
      sanitized[key] = value.replace(PAN_REGEX, (match) => {
        const digits = match.replace(/[\s-]/g, '');
        return '****' + digits.slice(-4);
      });
      continue;
    }

    // Pass through non-sensitive values
    sanitized[key] = value;
  }

  return sanitized;
}
