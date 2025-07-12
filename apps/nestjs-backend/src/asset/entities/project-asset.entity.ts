import { Entity, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base-entity.entity';
import { Project } from '../../project/entities/project.entity';
import { Asset } from './asset.entity';

@Entity()
@Index({ properties: ['projectId', 'assetId'] })
export class ProjectAsset extends BaseEntity {
  @Property()
  projectId: string;

  @Property()
  assetId: string;

  @ManyToOne(() => Project)
  project: Project;

  @ManyToOne(() => Asset)
  asset: Asset;

  @Property()
  addedAt: Date = new Date();
}