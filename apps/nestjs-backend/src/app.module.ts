import {MikroOrmModule} from '@mikro-orm/nestjs';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {BullModule} from '@nestjs/bull';
import mikroOrmConfig from 'mikro-orm.config';
import {AIAudioModule} from './ai-audio/ai-audio.module';
import {AliyunDriveModule} from './aliyun-drive/aliyun-drive.module';
import {AssetModule} from './asset/asset.module';
import {AuthModule} from './auth/auth.module';
import {JwtAuthGuard} from './auth/jwt-auth.guard';
import {CommonModule} from './common/common.module';
import {ContentJobModule} from './content-job/content-job.module';
import appConfig from './config/app.config';
import validationSchema from './config/validation.schema';
import {CryptoModule} from './crypto/crypto.module';
import {CryptoService} from './crypto/crypto.service';
import {EmailModule} from './email/email.module';
import {HealthModule} from './health/health.module';
import {ProjectModule} from './project/project.module';
import {TemplateModule} from './template/template.module';
import {UsersModule} from './users/users.module';

/**
 * 应用程序主模块
 * 配置和组织所有的应用模块、中间件和全局依赖项
 */
@Module({
	imports: [
		// 配置模块，加载环境变量和应用配置
		ConfigModule.forRoot({
			isGlobal: true, // 全局可用
			validationSchema, // 环境变量验证模式
			load: [appConfig], // 加载应用配置
		}),
		// 任务调度模块
		ScheduleModule.forRoot(),
		// MikroORM 数据库模块
		MikroOrmModule.forRoot(mikroOrmConfig),
		// Bull 队列模块，用于异步任务处理
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				redis: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
					password: configService.get<string>('REDIS_PASSWORD') || undefined,
					db: configService.get<number>('REDIS_DB'),
				},
			}),
		}),
		// 限流模块，防止 API 滥用
		ThrottlerModule.forRoot({
			throttlers: [
				{
					name: 'default-throttler',
					ttl: 60 * 1000, // 时间窗口：60秒
					limit: 60, // 最大请求数：60次
				},
			],
		}),
		// 功能模块
		CommonModule, // 通用模块
		UsersModule, // 用户模块
		CryptoModule, // 加密模块
		EmailModule, // 邮件模块
		AuthModule, // 身份验证模块
		HealthModule, // 健康检查模块
		AliyunDriveModule, // 阿里云盘模块
		ProjectModule, // 项目模块
		AssetModule, // 素材管理模块
		TemplateModule, // 内容模板模块
		ContentJobModule, // 内容生产任务模块
		AIAudioModule, // AI音频处理模块
	],
	providers: [
		CryptoService, // 加密服务
		// 全局 JWT 身份验证守卫
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		// 全局限流守卫
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
