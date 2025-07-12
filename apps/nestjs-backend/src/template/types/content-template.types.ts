/**
 * Content Template Type Definitions
 * 
 * Centralized type definitions for the content template system.
 * This provides type safety and single source of truth for data structures.
 */

/**
 * Defines a single dynamic slot in a content template.
 */
export interface SlotDefinition {
  name: string;
  type: 'text' | 'image' | 'audio' | 'voice' | 'soundscape' | 'background_music';
  required: boolean;
  description?: string;
}

/**
 * Defines the video/audio output settings.
 * All properties are explicit for better type safety.
 */
export interface VideoSettings {
  resolution: string;
  fps: number;
  duration: string | number;
  // ASMR specific settings
  sampleRate?: number;
  audioChannels?: 1 | 2; // mono or stereo
  bitrate?: string;
}

/**
 * ASMR Audio specific template configuration
 */
export interface ASMRAudioConfig {
  voiceSettings?: {
    voiceId: string;
    stability: number;
    similarityBoost: number;
    style: number;
    speakerBoost: boolean;
  };
  soundscapeSettings?: {
    category: 'nature' | 'indoor' | 'musical' | 'synthetic';
    intensity: number;
    duration: number;
    loopable: boolean;
  };
  mixingSettings?: {
    voiceVolume: number;
    soundscapeVolume: number;
    fadeInDuration: number;
    fadeOutDuration: number;
  };
}

/**
 * Defines the configuration for the template itself.
 * Currently supports ASMR audio configuration with room for extension.
 */
export interface TemplateConfig {
  asmrAudio?: ASMRAudioConfig;
  // Future configurations can be added here
  // video?: VideoConfig;
  // podcast?: PodcastConfig;
}

/**
 * Constructor parameters for ContentTemplate entity
 */
export interface ContentTemplateConstructor {
  userId: string;
  name: string;
  description?: string;
}