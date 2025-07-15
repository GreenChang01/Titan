import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AIImageService} from './services/ai-image.service';
import {AIImageController} from './controllers/ai-image.controller';
import {AssetModule} from '../asset/asset.module';

@Module({
	imports: [ConfigModule, AssetModule],
	controllers: [AIImageController],
	providers: [AIImageService],
	exports: [AIImageService],
})
export class AIModule {}
