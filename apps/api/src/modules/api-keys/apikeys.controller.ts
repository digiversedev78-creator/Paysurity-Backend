


// Helper for type-hinting the database object, as `NodePgDatabase` is explicitly named but
// cannot be directly imported as per rule 4. This ensures the type annotation
// `private readonly db: NodePgDatabase<any>` is syntactically valid.


// Helper for masking secrets
function maskSecret(secret: string, prefix: string = ''): string {
  if (!secret) {
    return `${prefix}****************`; // Return masked placeholder for null/undefined secrets
  }
  const minLengthToMask = 8; // E.g., for "abcdefgh", we show abcd****efgh
  if (secret.length < minLengthToMask) {
    return `${prefix}****************`; // If too short, just mask fully
  }
  // Show prefix, first 4 chars, ****, last 4 chars
  return `${prefix}${secret.substring(0, 4)}****${secret.substring(secret.length - 4)}`;
}

