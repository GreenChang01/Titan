import {Injectable, Logger} from '@nestjs/common';
import {VoiceSettings, SoundscapeSettings, VoiceType, SoundscapeType} from '../dto/asmr-generation.dto';

@Injectable()
export class ElevenLabsProvider {
	private readonly logger = new Logger(ElevenLabsProvider.name);

	async generateSpeech(options: {
		text: string;
		voiceId: string;
		settings: {
			stability: number;
			similarityBoost: number;
			style: number;
			useSpeakerBoost: boolean;
		};
	}): Promise<string> {
		this.logger.debug('Generating speech with ElevenLabs');

		// ElevenLabs API integration would go here
		// For now, return a mock file path
		return `/tmp/voice_${Date.now()}.mp3`;
	}

	async generateSoundEffect(options: {
		text: string;
		durationSeconds: number;
		promptInfluence: number;
	}): Promise<string> {
		this.logger.debug('Generating sound effect with ElevenLabs');

		// ElevenLabs sound effects API integration would go here
		// For now, return a mock file path
		return `/tmp/soundscape_${Date.now()}.mp3`;
	}

	async validateVoiceSettings(settings: VoiceSettings): Promise<{valid: boolean; issues?: string[]}> {
		const issues: string[] = [];

		if (!settings.type) {
			issues.push('Voice type is required');
		}

		if (settings.stability !== undefined && (settings.stability < 0 || settings.stability > 1)) {
			issues.push('Stability must be between 0 and 1');
		}

		if (settings.clarity !== undefined && (settings.clarity < 0 || settings.clarity > 1)) {
			issues.push('Clarity must be between 0 and 1');
		}

		return {
			valid: issues.length === 0,
			issues: issues.length > 0 ? issues : undefined,
		};
	}

	async validateSoundscapeSettings(settings: SoundscapeSettings): Promise<{valid: boolean; issues?: string[]}> {
		const issues: string[] = [];

		if (!settings.type) {
			issues.push('Soundscape type is required');
		}

		if (settings.volume !== undefined && (settings.volume < 0 || settings.volume > 1)) {
			issues.push('Volume must be between 0 and 1');
		}

		return {
			valid: issues.length === 0,
			issues: issues.length > 0 ? issues : undefined,
		};
	}

	async estimateVoiceCost(textLength: number, settings: VoiceSettings): Promise<number> {
		// Cost estimation logic based on character count and voice settings
		const baseRate = 0.001; // $0.001 per character
		// Simple multiplier based on voice type
		const multiplier = settings.type === VoiceType.NARRATOR ? 1.5 : 1;
		return textLength * baseRate * multiplier;
	}

	async estimateSoundscapeCost(duration: number, settings: SoundscapeSettings): Promise<number> {
		// Cost estimation logic based on duration and soundscape settings
		const baseRate = 0.01; // $0.01 per second
		// Simple multiplier based on soundscape type
		const multiplier = settings.type === SoundscapeType.BINAURAL ? 1.5 : 1;
		return duration * baseRate * multiplier;
	}
}
