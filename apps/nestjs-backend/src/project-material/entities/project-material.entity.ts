import {
	Entity, ManyToOne, Property, types, Unique,
} from '@mikro-orm/core';
import {Project} from '../../project/entities/project.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';

@Entity()
export class ProjectMaterial extends BaseEntity {
	@ManyToOne(() => Project, {nullable: false})
	project: Project;

	@Property({type: types.string, nullable: false})
	aliyunFileId: string;

	@Property({type: types.string, nullable: false})
	fileName: string;

	@Property({type: types.string, nullable: false})
	filePath: string;

	@Property({type: types.string, nullable: false})
	fileType: string;

	@Property({type: types.bigint, nullable: true})
	fileSize?: number;

	@Property({type: types.string, nullable: true})
	thumbnailUrl?: string;

	@Property({type: types.datetime, columnType: 'timestamp', nullable: true})
	fileCreatedAt?: Date;

	@Property({type: types.datetime, columnType: 'timestamp', nullable: true})
	fileUpdatedAt?: Date;

	@Property({type: types.boolean, default: true})
	isActive = true;

	@Property({type: types.string, nullable: true})
	description?: string;

	@Property({type: types.json, nullable: true})
	metadata?: Record<string, unknown>;

	@Unique()
	@Property({type: types.string, nullable: false, persist: false})
	get projectMaterialKey(): string {
		return `${this.project.id}-${this.aliyunFileId}`;
	}

	constructor({
		project,
		aliyunFileId,
		fileName,
		filePath,
		fileType,
		fileSize,
		thumbnailUrl,
		fileCreatedAt,
		fileUpdatedAt,
		description,
		metadata,
	}: {
		project: Project;
		aliyunFileId: string;
		fileName: string;
		filePath: string;
		fileType: string;
		fileSize?: number;
		thumbnailUrl?: string;
		fileCreatedAt?: Date;
		fileUpdatedAt?: Date;
		description?: string;
		metadata?: Record<string, unknown>;
	}) {
		super();
		this.project = project;
		this.aliyunFileId = aliyunFileId;
		this.fileName = fileName;
		this.filePath = filePath;
		this.fileType = fileType;
		this.fileSize = fileSize;
		this.thumbnailUrl = thumbnailUrl;
		this.fileCreatedAt = fileCreatedAt;
		this.fileUpdatedAt = fileUpdatedAt;
		this.description = description;
		this.metadata = metadata;
	}
}
