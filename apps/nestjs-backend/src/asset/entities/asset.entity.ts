import {Entity, Property, Enum, Index} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {AssetType, UploadSource} from '../../common/enums';

type AssetConstructor = {
	userId: string;
	fileName: string;
	originalName: string;
	filePath: string;
	fileSize: number;
	mimeType: string;
	assetType: AssetType;
	uploadSource: UploadSource;
	name?: string; // 可选的name字段
};

@Entity()
@Index({properties: ['userId', 'createdAt']})
@Index({properties: ['userId', 'assetType']})
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

	@Property({type: 'json'})
	tags: string[] = [];

	@Property({nullable: true})
	description?: string;

	@Property({type: 'json'})
	metadata: Record<string, any> = {};

	@Enum(() => UploadSource)
	uploadSource: UploadSource;

	@Property({nullable: true})
	thumbnailPath?: string;

	/**
	 * 资源URL - 用于AI生成的资源或外部链接
	 */
	@Property({nullable: true})
	url?: string;

	constructor({
		userId,
		fileName,
		originalName,
		filePath,
		fileSize,
		mimeType,
		assetType,
		uploadSource,
	}: AssetConstructor) {
		super();
		this.userId = userId;
		this.fileName = fileName;
		this.originalName = originalName;
		this.filePath = filePath;
		this.fileSize = fileSize;
		this.mimeType = mimeType;
		this.assetType = assetType;
		this.uploadSource = uploadSource;
	}
}
