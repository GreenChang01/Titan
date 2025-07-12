import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Services
import { ASMRContentService } from './services/asmr-content.service';
import { FFmpegAudioMixer } from './services/ffmpeg-audio-mixer.service';

// Providers
import { ElevenLabsProvider } from './providers/elevenlabs.provider';
import { ElevenLabsSoundscapeProvider } from './providers/soundverse.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ElevenLabsProvider,
    ElevenLabsSoundscapeProvider,
    FFmpegAudioMixer,
    ASMRContentService,
  ],
  exports: [
    ElevenLabsProvider,
    ElevenLabsSoundscapeProvider,
    FFmpegAudioMixer,
    ASMRContentService,
  ],
})
export class AIAudioModule {}