import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';

// Import AI Audio module
import { AIAudioModule } from '../ai-audio/ai-audio.module';

// Controllers
import { ASMRGenerationController } from './controllers/asmr-generation.controller';
import { ASMRLibraryController } from './controllers/asmr-library.controller';

// Services
import { ASMRGenerationService } from './services/asmr-generation.service';
import { ASMRLibraryService } from './services/asmr-library.service';
import { ASMRPresetService } from './services/asmr-preset.service';
import { ASMRContentService } from './services/asmr-content.service';
import { ElevenLabsProvider } from './providers/elevenlabs.provider';

// Entities
import { ASMRGeneration } from './entities/asmr-generation.entity';
import { ASMRPresetEntity } from './entities/asmr-preset.entity';
import { LibraryItemFavorite } from './entities/library-item-favorite.entity';
import { LibraryItemRating } from './entities/library-item-rating.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ASMRGeneration,
      ASMRPresetEntity,
      LibraryItemFavorite,
      LibraryItemRating,
    ]),
    BullModule.registerQueue({
      name: 'asmr-generation',
    }),
    AIAudioModule,
  ],
  controllers: [
    ASMRGenerationController,
    ASMRLibraryController,
  ],
  providers: [
    // New ASMR services
    ASMRGenerationService,
    ASMRLibraryService,
    ASMRPresetService,
    ASMRContentService,
    ElevenLabsProvider,
  ],
  exports: [
    ASMRGenerationService,
    ASMRLibraryService,
    ASMRPresetService,
  ],
})
export class ASMRModule {}