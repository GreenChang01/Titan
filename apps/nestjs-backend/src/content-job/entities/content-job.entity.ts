import {
	Entity, Property, Enum, Index,
} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {JobType, JobStatus} from '../../common/enums';

@Entity()
@Index({properties: ['userId', 'status']})
@Index({properties: ['status', 'createdAt']})
export class ContentJob extends BaseEntity {
	@Property()
	userId!: string;

	@Property({nullable: true})
	projectId?: string;

	@Property()
	templateId!: string;

	@Enum(() => JobType)
	jobType!: JobType;

	@Enum(() => JobStatus)
	status: JobStatus = JobStatus.QUEUED;

	@Property({type: 'json'})
	inputAssets: Array<{
		assetId: string;
		slotName: string;
		parameters?: Record<string, any>;
	}> = [];

	@Property({nullable: true})
	outputPath?: string;

	@Property({type: 'integer', default: 0})
	progress = 0;

	@Property({nullable: true})
	errorMessage?: string;

	@Property({type: 'integer', nullable: true})
	processingTime?: number;

	@Property({nullable: true})
	startedAt?: Date;

	@Property({nullable: true})
	completedAt?: Date;
}
