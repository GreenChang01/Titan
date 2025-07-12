import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base-entity.entity';
import { AssetType, UploadSource } from '../../common/enums';

@Entity()
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['userId', 'assetType'] })
export class Asset extends BaseEntity {
  @Property()
  userId: string;

  @Property()
  fileName: string;

  @Property()
  originalName: string;

  @Property()
  filePath: string;

  @Property()
  fileSize: number;

  @Property()
  mimeType: string;

  @Enum(() => AssetType)
  assetType: AssetType;

  @Property({ type: 'json' })
  tags: string[] = [];

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'json' })
  metadata: Record<string, any> = {};

  @Enum(() => UploadSource)
  uploadSource: UploadSource;

  @Property({ nullable: true })
  thumbnailPath?: string;
}