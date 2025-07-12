import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base-entity.entity';
import { ScheduleStatus } from '../../common/enums';

interface PublishScheduleConstructor {
  userId: string;
  contentId: string;
  platform: string;
  scheduledTime: Date;
}

@Entity()
@Index({ properties: ['userId', 'status'] })
@Index({ properties: ['status', 'scheduledTime'] })
@Index({ properties: ['platform', 'scheduledTime'] })
export class PublishSchedule extends BaseEntity {
  @Property()
  userId: string;

  @Property()
  contentId: string;

  @Property()
  platform: string;

  @Property()
  scheduledTime: Date;

  @Enum(() => ScheduleStatus)
  status: ScheduleStatus = ScheduleStatus.PENDING;

  @Property({ type: 'json', nullable: true })
  publishResult?: {
    success: boolean;
    message?: string;
    platformId?: string;
    platformUrl?: string;
    [key: string]: any;
  };

  @Property({ type: 'integer', default: 0 })
  retryCount: number = 0;

  @Property({ nullable: true })
  lastAttemptAt?: Date;

  @Property({ nullable: true })
  publishedAt?: Date;

  @Property({ type: 'json', nullable: true })
  publishConfig?: {
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: string;
    [key: string]: any;
  };

  constructor({ userId, contentId, platform, scheduledTime }: PublishScheduleConstructor) {
    super();
    this.userId = userId;
    this.contentId = contentId;
    this.platform = platform;
    this.scheduledTime = scheduledTime;
  }
}