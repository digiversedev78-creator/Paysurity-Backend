import * as crypto from 'crypto';

export const validateWebhookSignature = (payload: string, signature: string, secret: string) => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  // Constant-time verification to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch (e) {
    return false; // Mismatched buffer lengths
  }
};
