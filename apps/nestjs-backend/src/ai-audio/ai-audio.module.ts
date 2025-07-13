import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';

// Services
import {ASMRContentService} from './services/asmr-content.service';
import {FfmpegAudioMixer} from './services/ffmpeg-audio-mixer.service';

// Providers
import {ElevenLabsProvider} from './providers/elevenlabs.provider';
import {ElevenLabsSoundscapeProvider} from './providers/soundverse.provider';

@Module({
	imports: [ConfigModule],
	providers: [ElevenLabsProvider, ElevenLabsSoundscapeProvider, FfmpegAudioMixer, ASMRContentService],
	exports: [ElevenLabsProvider, ElevenLabsSoundscapeProvider, FfmpegAudioMixer, ASMRContentService],
})
export class AIAudioModule {}
