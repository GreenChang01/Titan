import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {MulterModule} from '@nestjs/platform-express';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {ConfigKey} from '../config/config-key.enum';
import {AssetController} from './asset.controller';
import {AssetService} from './asset.service';
import {ThumbnailService} from './services/thumbnail.service';
import {MetadataExtractorService} from './services/metadata-extractor.service';
import {Asset} from './entities/asset.entity';
import {ProjectAsset} from './entities/project-asset.entity';

@Module({
	imports: [
		MikroOrmModule.forFeature([Asset, ProjectAsset]),
		MulterModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				limits: {
					fileSize: configService.get<number>(ConfigKey.MAX_FILE_SIZE) || 524_288_000, // 500MB
				},
				fileFilter(req, file, callback) {
					// Basic filter - more detailed validation in pipe
					const allowedMimes = (
						configService.get<string>(ConfigKey.ALLOWED_MIME_TYPES) || 'image/*,video/*,audio/*,text/*'
					)
						.split(',')
						.map((type) => type.trim());

					const isAllowed = allowedMimes.some((allowedType) => {
						if (allowedType.endsWith('/*')) {
							const category = allowedType.replace('/*', '');
							return file.mimetype.startsWith(category + '/');
						}
						return file.mimetype === allowedType;
					});

					if (isAllowed) {
						callback(null, true);
					} else {
						callback(new Error(`File type ${file.mimetype} is not allowed`), false);
					}
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AssetController],
	providers: [AssetService, ThumbnailService, MetadataExtractorService],
	exports: [AssetService],
})
export class AssetModule {}
