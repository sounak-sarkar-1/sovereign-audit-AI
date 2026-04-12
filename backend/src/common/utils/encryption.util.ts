import * as crypto from 'crypto';

export class EncryptionUtils {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      Buffer.from(key, 'hex'),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  static decrypt(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      Buffer.from(key, 'hex'),
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
