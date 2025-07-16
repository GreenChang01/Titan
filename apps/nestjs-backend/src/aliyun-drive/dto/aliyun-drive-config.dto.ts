import {ApiProperty} from '@nestjs/swagger';

export class AliyunDriveConfigDto {
	@ApiProperty({description: '配置ID', example: 'clx15n6p0000008l6g1z6g1z6'})
	declare id: string;

	@ApiProperty({description: 'WebDAV URL', example: 'https://dav.aliyundrive.com'})
	declare webdavUrl: string;

	@ApiProperty({description: '用户名', example: 'user@example.com'})
	declare username: string;

	@ApiProperty({description: '显示名称', example: 'My Aliyun Drive', required: false})
	declare displayName?: string;

	@ApiProperty({description: '超时时间（毫秒）', example: 30000})
	declare timeout: number;

	@ApiProperty({description: '基础路径', example: '/dav', required: false})
	declare basePath?: string;

	@ApiProperty({description: '是否激活', example: true})
	declare isActive: boolean;

	@ApiProperty({description: '上次同步时间', required: false})
	declare lastSyncAt?: Date;

	@ApiProperty({description: '创建时间'})
	declare createdAt: Date;

	@ApiProperty({description: '更新时间'})
	declare updatedAt: Date;
}
