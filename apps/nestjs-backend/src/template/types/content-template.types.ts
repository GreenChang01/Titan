/**
 * Content Template Type Definitions
 *
 * Centralized type definitions for the content template system.
 * This provides type safety and single source of truth for data structures.
 */

/**
 * Defines a single dynamic slot in a content template.
 */
export type SlotDefinition = {
  name: string;
  type: 'text' | 'image' | 'audio' | 'voice' | 'soundscape' | 'background_music';
  required: boolean;
  description?: string;
}

/**
 * Defines the video/audio output settings.
 * All properties are explicit for better type safety.
 */
export type VideoSettings = {
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
export type ASMRAudioConfig = {
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
 * Text style configuration for video overlay text
 */
export type TextStyle = {
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  position?: {
    x: number | string;
    y: number | string;
  };
}

/**
 * Audio mixing configuration for multiple audio tracks
 */
export type AudioMix = {
  narrationVolume?: number;
  bgmVolume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

/**
 * Defines the configuration for the template itself.
 * Supports both new ASMR audio configuration and legacy video template properties.
 */
export type TemplateConfig = {
  // Legacy video template properties (for backward compatibility)
  type?: 'asmr' | 'dynamic_background' | 'default';
  imageDisplayDuration?: number;
  textStyle?: TextStyle;
  audioMix?: AudioMix;
  
  // New ASMR audio configuration
  asmrAudio?: ASMRAudioConfig;
  
  // Future configurations can be added here
  // video?: VideoConfig;
  // podcast?: PodcastConfig;
}

/**
 * Constructor parameters for ContentTemplate entity
 */
export type ContentTemplateConstructor = {
  userId: string;
  name: string;
  description?: string;
}
