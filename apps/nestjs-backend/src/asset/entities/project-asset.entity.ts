import {
	Entity, Property, ManyToOne, Index,
} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {Project} from '../../project/entities/project.entity';
import {Asset} from './asset.entity';

@Entity()
@Index({properties: ['project', 'asset']})
export class ProjectAsset extends BaseEntity {
	@ManyToOne(() => Project, {fieldName: 'project_id'})
	project!: Project;

	@ManyToOne(() => Asset, {fieldName: 'asset_id'})
	asset!: Asset;

	@Property()
	addedAt: Date = new Date();
}
