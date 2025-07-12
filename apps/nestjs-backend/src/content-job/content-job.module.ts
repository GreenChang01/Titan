import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {BullModule} from '@nestjs/bull';
import {AIAudioModule} from '../ai-audio/ai-audio.module';
import {Asset} from '../asset/entities/asset.entity';
import {ContentTemplate} from '../template/entities/content-template.entity';
import {ContentJobController} from './content-job.controller';
import {ContentJobService} from './content-job.service';
import {MediaProcessingService} from './services/media-processing.service';
import {MediaProcessingProcessor} from './processors/media-processing.processor';
import {AudioGenerationConsumer} from './processors/audio-generation.processor';
import {ContentJob} from './entities/content-job.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([ContentJob, Asset, ContentTemplate]),
    AIAudioModule, // AI音频处理模块
    BullModule.registerQueue({
      name: 'media-processing',
      defaultJobOptions: {
        removeOnComplete: 10, // 保留最近10个完成的任务
        removeOnFail: 50, // 保留最近50个失败的任务
      },
    }),
    BullModule.registerQueue({
      name: 'audio-generation',
      defaultJobOptions: {
        removeOnComplete: 10, // 保留最近10个完成的任务
        removeOnFail: 50, // 保留最近50个失败的任务
        delay: 1000, // 默认延迟1秒执行
      },
    }),
  ],
  controllers: [ContentJobController],
  providers: [ContentJobService, MediaProcessingService, MediaProcessingProcessor, AudioGenerationConsumer],
  exports: [ContentJobService, MediaProcessingService],
})
export class ContentJobModule {}
