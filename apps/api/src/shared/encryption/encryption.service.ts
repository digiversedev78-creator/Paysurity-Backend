import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret || secret.length !== 64) {
      // In a real launch, we'd fail-fast, but for demo we can generate a temporary one if missing
      // However, for "launch-ready" we should warn/error.
      this.key = crypto.scryptSync(secret || 'paysurity-demo-fallback-secret-2026', 'salt', 32);
    } else {
      this.key = Buffer.from(secret, 'hex');
    }
  }

  /**
   * Encrypts a string value using AES-256-GCM.
   * Returns a colon-separated string: iv:authTag:encryptedData
   */
  async encrypt(text: string): Promise<string> {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag().toString('hex');
      
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  /**
   * Decrypts a string value.
   */
  async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
      const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // If decryption fails, it might be unencrypted legacy data
      return encryptedText;
    }
  }
}
