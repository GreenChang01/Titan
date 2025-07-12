import * as crypto from 'node:crypto';
import {Buffer} from 'node:buffer';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {ConfigKey} from '../config/config-key.enum';

/**
 * 加密数据类型定义
 * 包含加密文本、初始化向量和认证标签
 */
export type EncryptedData = {
  encryptedText: string;
  iv: string;
  authTag: string;
};

/**
 * 加密服务
 * 提供密码哈希、对称加密、随机数生成等安全功能
 * 使用 bcrypt 进行密码哈希，AES-256-GCM 进行数据加密
 */
@Injectable()
export class CryptoService {
  /** bcrypt 的盐值轮数 */
  private get saltRounds(): number {
    return 10;
  }

  /** 对称加密算法 */
  private get algorithm(): string {
    return 'aes-256-gcm';
  }

  constructor(private readonly configService: ConfigService) {}

  /**
   * 对字符串进行哈希加密
   * @param valueToHash 需要哈希的值
   * @returns 哈希后的字符串
   */
  async hash(valueToHash: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(valueToHash, salt);
  }

  /**
   * 比较原始值与哈希值是否匹配
   * @param value 原始值
   * @param hashedValue 哈希值
   * @returns 是否匹配
   */
  async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }

  /**
   * 生成随机数字验证码
   * @param length 验证码长度，默认6位
   * @returns 数字验证码字符串
   */
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
   * 使用 AES-256-GCM 加密敏感数据
   * @param text 要加密的明文
   * @returns 包含加密文本、初始化向量和认证标签的对象
   */
  encrypt(text: string): EncryptedData {
    try {
      const encryptionKey = this.configService.get<string>(ConfigKey.ENCRYPTION_KEY);
      if (!encryptionKey) {
        throw new Error('Encryption key not configured');
      }

      const iv = crypto.randomBytes(12); // GCM 模式使用 96 位 IV
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;

      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encryptedText,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error: unknown) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 使用 AES-256-GCM 解密敏感数据
   * @param encryptedData 包含加密文本、初始化向量和认证标签的对象
   * @returns 解密后的明文
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      const encryptionKey = this.configService.get<string>(ConfigKey.ENCRYPTION_KEY);
      if (!encryptionKey) {
        throw new Error('Encryption key not configured');
      }

      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex'),
      ) as crypto.DecipherGCM;

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decryptedText = decipher.update(encryptedData.encryptedText, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');

      return decryptedText;
    } catch (error: unknown) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 生成密码学安全的随机字符串
   * @param length 随机字符串长度，默认32字节
   * @returns 十六进制随机字符串
   */
  generateSecureRandom(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
