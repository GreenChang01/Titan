import {
	Entity, Property, Enum, Index,
} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {PublishStatus} from '../../common/enums';

@Entity()
@Index({properties: ['userId', 'publishStatus']})
@Index({properties: ['projectId']})
@Index({properties: ['jobId']})
export class GeneratedContent extends BaseEntity {
	@Property()
	userId!: string;

	@Property()
	projectId!: string;

	@Property()
	jobId!: string;

	@Property()
	fileName!: string;

	@Property()
	filePath!: string;

	@Property({type: 'bigint'})
	fileSize!: number;

	@Property({type: 'integer'})
	duration!: number;

	@Property({nullable: true})
	thumbnailPath?: string;

	@Enum(() => PublishStatus)
	publishStatus: PublishStatus = PublishStatus.PENDING;

	@Property({nullable: true})
	publishedAt?: Date;

	@Property({type: 'json'})
	publishPlatforms: string[] = [];

	@Property({type: 'json', nullable: true})
	metadata?: {
		resolution?: string;
		fps?: number;
		bitrate?: number;
		codec?: string;
		[key: string]: any;
	};
}
