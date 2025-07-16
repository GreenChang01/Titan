import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, type OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {AppModule} from './app.module';
import {MikroOrmExceptionFilter} from './common/filters/mikro-orm-exception/mikro-orm-exception.filter';
import {GlobalExceptionFilter} from './common/filters/global-exception/global-exception.filter';
import {ResponseInterceptor} from './common/interceptors/response/response.interceptor';
import {Logger as LoggerService} from './common/logger/logger.service';

/**
 * 应用程序启动函数
 * 配置和启动 NestJS 应用服务器
 */
async function bootstrap(): Promise<void> {
	// 创建 NestJS 应用实例
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true, // 启用日志缓冲
	});

	// 启用 Helmet 安全中间件
	app.use(helmet());

	// 配置 CORS 跨域资源共享
	app.enableCors({
		origin: [
			process.env.FRONTEND_HOST || 'http://localhost:3000',
			'http://localhost:3001',
			'http://127.0.0.1:3000',
			'http://127.0.0.1:3001',
		], // 允许的前端域名
		credentials: true, // 允许携带凭据
	});

	// 使用自定义日志服务
	app.useLogger(new LoggerService());

	// 配置全局验证管道
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true, // 自动类型转换
			whitelist: true, // 只保留 DTO 中定义的属性
			forbidNonWhitelisted: true, // 禁止未定义的属性
		}),
	);

	// 启用 Cookie 解析中间件
	app.use(cookieParser());

	// 设置全局 API 前缀
	app.setGlobalPrefix('api');

	// 配置全局异常过滤器
	app.useGlobalFilters(new GlobalExceptionFilter(), new MikroOrmExceptionFilter());

	// 配置全局响应拦截器
	app.useGlobalInterceptors(new ResponseInterceptor());

	// 配置 Swagger API 文档（仅在启用时）
	if (process.env.ENABLE_SWAGGER === 'true') {
		const swaggerConfig = new DocumentBuilder()
			.setTitle('Titan | 智能内容生产与分发平台 API')
			.setDescription(
				'Titan V1.1 智能内容生产与分发平台后端接口文档 - 专为中老年ASMR内容批量生产和微信视频号自动发布设计',
			)
			.setVersion('1.1')
			.addBearerAuth(
				{
					description: 'JWT Authorization header using the Bearer scheme',
					name: 'Authorization',
					bearerFormat: 'JWT',
					scheme: 'bearer',
					type: 'http',
					in: 'Header',
				},
				'access-token',
			)
			.build();
		const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, swaggerConfig);
		SwaggerModule.setup('api/docs', app, documentFactory, {
			customSiteTitle: 'Titan API Docs',
		});
	}

	// 启动服务器
	const port = process.env.PORT ?? 4000;
	await app.listen(port, '127.0.0.1');

	// 输出 Swagger 文档地址（如果启用）
	if (process.env.ENABLE_SWAGGER === 'true') {
		const logger = new Logger('bootstrap', {timestamp: true});
		logger.log(`Swagger is running on: ${await app.getUrl()}/api/docs`);
	}
}

// 启动应用程序
bootstrap();
