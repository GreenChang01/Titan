import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';
import {AcceptedLanguages} from './types/accepted-languages.enum';

/**
 * 邮件服务
 * 提供发送各种类型邮件的功能，包括用户确认、密码重置和双因子验证码邮件
 * 支持多语言邮件模板
 */
@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * 发送用户注册确认邮件
   * @param language 邮件语言
   * @param username 用户名
   * @param email 接收邮件的地址
   * @param confirmationLink 确认链接
   */
  async sendConfirmEmail(
    language: AcceptedLanguages,
    username: string,
    email: string,
    confirmationLink: string,
  ): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Bitte bestätigen Sie Ihre E-Mail-Adresse';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Please confirm your email address';
        break;
      }
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `confirm-user_${language}`,
      context: {
        username,
        confirmationLink,
      },
    });
  }

  /**
   * 发送密码重置请求邮件
   * @param language 邮件语言
   * @param email 接收邮件的地址
   * @param username 用户名
   * @param passwordResetLink 密码重置链接
   */
  async sendRequestPasswordResetEmail(
    language: AcceptedLanguages,
    email: string,
    username: string,
    passwordResetLink: string,
  ): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Passwort zurücksetzen';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Reset Your Password';
        break;
      }
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `request-password-reset_${language}`,
      context: {
        username,
        passwordResetLink,
      },
    });
  }

  /**
   * 发送双因子验证码邮件
   * @param language 邮件语言
   * @param email 接收邮件的地址
   * @param code 验证码
   */
  async sendTwoFactorAuthCodeEmail(language: AcceptedLanguages, email: string, code: string): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Ihr 2FA Code';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Your 2FA Code';
        break;
      }
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `two-factor-auth-code_${language}`,
      context: {
        code,
      },
    });
  }
}
