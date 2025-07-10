import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {ConfigKey} from '../config/config-key.enum';

export interface EncryptedData {
  encryptedText: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class CryptoService {
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  private readonly saltRounds = 10;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private readonly configService: ConfigService) {}

  async hash(valueToHash: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(valueToHash, salt);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }

  generateRandomCode(length = 6): string {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param text - Plain text to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(text: string): EncryptedData {
    try {
      const encryptionKey = this.configService.get<string>(ConfigKey.ENCRYPTION_KEY);
      if (!encryptionKey) {
        throw new Error('Encryption key not configured');
      }

      const iv = crypto.randomBytes(12); // 96-bit IV for GCM mode
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encryptedText,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data using AES-256-GCM
   * @param encryptedData - Encrypted data with IV and auth tag
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      const encryptionKey = this.configService.get<string>(ConfigKey.ENCRYPTION_KEY);
      if (!encryptionKey) {
        throw new Error('Encryption key not configured');
      }

      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(encryptedData.iv, 'hex'));

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decryptedText = decipher.update(encryptedData.encryptedText, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');

      return decryptedText;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a cryptographically secure random string
   * @param length - Length of the random string
   * @returns Random hex string
   */
  generateSecureRandom(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
