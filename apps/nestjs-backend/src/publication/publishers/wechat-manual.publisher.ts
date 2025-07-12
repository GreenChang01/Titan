import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Publication, PublicationStatus } from '../entities/publication.entity';
import { IPlatformPublisher } from '../interfaces/platform-publisher.interface';
import { EmailService } from '../../email/email.service';

@Injectable()
export class WeChatManualPublisher implements IPlatformPublisher {
  readonly platform = 'wechat_channels';
  private readonly logger = new Logger(WeChatManualPublisher.name);

  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: EntityRepository<Publication>,
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async publish(publication: Publication): Promise<void> {
    try {
      // 更新状态为等待手动上传
      publication.status = PublicationStatus.PENDING_MANUAL_UPLOAD;
      publication.platformMetadata = {
        ...publication.platformMetadata,
        manualUploadRequested: new Date().toISOString(),
        uploadInstructions: '请手动上传生成的视频到微信视频号',
      };

      await this.em.persistAndFlush(publication);

      // 发送通知给内容管理员
      await this.sendUploadNotification(publication);

      this.logger.log(`WeChat manual upload requested for publication ${publication.id}`);

    } catch (error) {
      publication.status = PublicationStatus.UPLOAD_FAILED;
      publication.failureReason = `Manual upload notification failed: ${error.message}`;
      await this.em.persistAndFlush(publication);
      throw error;
    }
  }

  async checkStatus(publication: Publication): Promise<void> {
    // 对于手动上传，状态需要通过外部接口手动更新
    // 这里可以检查是否长时间未处理并发送提醒
    const pendingDuration = Date.now() - publication.updatedAt.getTime();
    const maxPendingHours = 24; // 24小时提醒

    if (pendingDuration > maxPendingHours * 60 * 60 * 1000) {
      await this.sendReminderNotification(publication);
    }
  }

  private async sendUploadNotification(publication: Publication): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured, skipping notification');
      return;
    }

    const videoUrl = this.getVideoDownloadUrl(publication);
    const wechatUploadUrl = 'https://channels.weixin.qq.com/platform/post/create';

    const emailContent = `
      <h2>微信视频号手动上传通知</h2>
      <p>有新的视频内容需要手动上传到微信视频号。</p>
      
      <h3>发布信息:</h3>
      <ul>
        <li><strong>发布ID:</strong> ${publication.id}</li>
        <li><strong>内容任务ID:</strong> ${publication.contentJobId}</li>
        <li><strong>创建时间:</strong> ${publication.createdAt}</li>
        <li><strong>预定发布时间:</strong> ${publication.scheduledAt || '立即发布'}</li>
      </ul>
      
      <h3>操作步骤:</h3>
      <ol>
        <li><a href="${videoUrl}" target="_blank">下载生成的视频文件</a></li>
        <li><a href="${wechatUploadUrl}" target="_blank">打开微信视频号发布页面</a></li>
        <li>按照发布配置手动上传视频</li>
        <li>上传完成后，请通过管理后台更新发布状态</li>
      </ol>
      
      <h3>发布配置:</h3>
      <pre>${JSON.stringify(publication.publishConfig, null, 2)}</pre>
    `;

    await this.emailService.sendEmail({
      to: adminEmail,
      subject: `微信视频号手动上传通知 - ${publication.id}`,
      html: emailContent,
    });
  }

  private async sendReminderNotification(publication: Publication): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) return;

    const emailContent = `
      <h2>微信视频号上传提醒</h2>
      <p>以下视频已等待手动上传超过24小时，请及时处理。</p>
      
      <ul>
        <li><strong>发布ID:</strong> ${publication.id}</li>
        <li><strong>等待时间:</strong> 超过24小时</li>
        <li><strong>状态:</strong> ${publication.status}</li>
      </ul>
    `;

    await this.emailService.sendEmail({
      to: adminEmail,
      subject: `微信视频号上传提醒 - ${publication.id}`,
      html: emailContent,
    });
  }

  private getVideoDownloadUrl(publication: Publication): string {
    // 这里应该返回视频文件的下载链接
    // 可以是S3预签名URL或其他安全的文件访问方式
    const baseUrl = this.configService.get<string>('FRONTEND_HOST');
    return `${baseUrl}/api/publications/${publication.id}/download`;
  }
}