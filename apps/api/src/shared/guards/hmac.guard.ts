import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express'; // Assuming Express is used as the underlying platform

@Injectable()
export class HmacGuard implements CanActivate {
  private readonly logger = new Logger(HmacGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const signatureHeader = request.headers['x-webhook-signature'];
    const webhookSecret = process.env.PAYSURITY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.error('PAYSURITY_WEBHOOK_SECRET is not set in environment variables.');
      // If the secret is missing, we cannot verify the webhook.
      throw new UnauthorizedException('Webhook verification secret is not configured.');
    }

    if (!signatureHeader) {
      this.logger.warn('X-Webhook-Signature header is missing from the request.');
      throw new UnauthorizedException('Missing X-Webhook-Signature header.');
    }

    // Access the raw request body.
    // This guard assumes that a middleware (e.g., Express's bodyParser.json with a 'verify' function)
    // has been configured to populate `request.rawBody` with the raw buffer of the request body
    // before any parsing occurs. A common setup in main.ts looks like:
    // app.use(json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }));
    const rawBodyBuffer = (request as any).rawBody; // Cast to 'any' to access the custom 'rawBody' property

    if (!rawBodyBuffer) {
      this.logger.error('Raw request body not available on `request.rawBody`. Ensure a body-parser middleware with a `verify` function is properly configured to expose the raw body.');
      throw new UnauthorizedException('Unable to access raw request body for signature verification.');
    }

    try {
      // Ensure signatureHeader is treated as a string, handling potential array types gracefully
      const receivedSignature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      if (typeof receivedSignature !== 'string') {
        this.logger.warn('X-Webhook-Signature header is not a string.');
        throw new UnauthorizedException('Invalid X-Webhook-Signature header format.');
      }

      // Compute HMAC-SHA256
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(rawBodyBuffer);
      const computedSignature = hmac.digest('hex');

      // Convert signatures to Buffers for constant-time comparison
      const receivedSignatureBuffer = Buffer.from(receivedSignature, 'utf8');
      const computedSignatureBuffer = Buffer.from(computedSignature, 'utf8');

      // Perform a constant-time comparison to prevent timing attacks.
      // crypto.timingSafeEqual requires buffers of the same length.
      if (receivedSignatureBuffer.length !== computedSignatureBuffer.length) {
        this.logger.warn(`Webhook signature length mismatch. Received: ${receivedSignatureBuffer.length}, Computed: ${computedSignatureBuffer.length}.`);
        throw new UnauthorizedException('Invalid webhook signature (length mismatch).');
      }

      if (crypto.timingSafeEqual(receivedSignatureBuffer, computedSignatureBuffer)) {
        return true; // Signature matches, allow the request to proceed
      } else {
        this.logger.warn('Webhook signature mismatch. Verification failed.');
        throw new UnauthorizedException('Invalid webhook signature.');
      }
    } catch (error) {
      // Catching errors from crypto operations or buffer conversions
      this.logger.error(`Error during HMAC verification process: ${error.message}`, error.stack);
      throw new UnauthorizedException('Webhook verification failed due to an internal error.');
    }
  }
}
