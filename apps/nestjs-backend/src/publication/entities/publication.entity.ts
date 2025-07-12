import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base-entity.entity';

export enum PublicationStatus {
  PENDING_UPLOAD = 'pending_upload',
  UPLOADING = 'uploading',
  UPLOAD_FAILED = 'upload_failed',
  PENDING_REVIEW = 'pending_review',
  REVIEW_PASSED = 'review_passed',
  REVIEW_REJECTED = 'review_rejected',
  PUBLISHED = 'published',
  PENDING_MANUAL_UPLOAD = 'pending_manual_upload',
}

export enum PublicationPlatform {
  WECHAT_CHANNELS = 'wechat_channels',
  DOUYIN = 'douyin',
  KUAISHOU = 'kuaishou',
  BILIBILI = 'bilibili',
}

@Entity()
@Index({ properties: ['contentJobId'] })
@Index({ properties: ['platform', 'status'] })
@Index({ properties: ['status', 'scheduledAt'] })
export class Publication extends BaseEntity {
  @Property()
  contentJobId: string;

  @Enum(() => PublicationPlatform)
  platform: PublicationPlatform;

  @Enum(() => PublicationStatus)
  status: PublicationStatus = PublicationStatus.PENDING_UPLOAD;

  @Property({ nullable: true })
  platformPostId?: string;

  @Property({ type: 'text', nullable: true })
  failureReason?: string;

  @Property({ nullable: true })
  scheduledAt?: Date;

  @Property({ nullable: true })
  publishedAt?: Date;

  @Property({ type: 'json' })
  publishConfig: Record<string, any> = {};

  @Property({ type: 'json' })
  platformMetadata: Record<string, any> = {};
}