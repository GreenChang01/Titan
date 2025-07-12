// packages/titan-shared/src/types/asmr.ts

// Using a union type for job status provides excellent type safety for your SWR polling logic.
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export type SoundscapeQuality = 'low' | 'medium' | 'high';

// --- Configuration Sub-types ---

export type VoiceOptions = {
  voiceId: string;
  stability?: number; // 0.0 to 1.0
  similarity?: number; // 0.0 to 1.0
  style?: number; // 0.0 to 1.0
  speakerBoost?: boolean;
};

export type SoundscapeOptions = {
  prompt: string;
  duration: number; // Duration in seconds
  category: string;
  intensity: number; // 0.0 to 1.0
  quality: SoundscapeQuality;
};

export type MixingOptions = {
  voiceVolume: number; // 0.0 to 1.0
  soundscapeVolume: number; // 0.0 to 1.0
  fadeInDuration: number; // Duration in seconds
  fadeOutDuration: number; // Duration in seconds
  eqSettings?: {
    lowFreq: number; // EQ adjustment in dB
    midFreq: number; // EQ adjustment in dB
    highFreq: number; // EQ adjustment in dB
  };
};

// Extracted from ASMRGenerationRequest for better reusability.
export type BinauralSettings = {
  enabled: boolean;
  spatialWidth: number; // 0.0 to 2.0
  leftDelay: number; // Delay in milliseconds
  rightDelay: number; // Delay in milliseconds
  reverbAmount: number; // 0.0 to 1.0
};

// Extracted from ASMRGenerationRequest for better reusability.
export type QualityRequirements = {
  minimumScore: number; // 1.0 to 10.0
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
};

// --- Main API Payloads & Responses ---

export type AsmrGenerationRequest = {
  text: string;
  voiceSettings: VoiceOptions;
  soundscapeConfig: SoundscapeOptions;
  mixingSettings: MixingOptions;
  binauralSettings?: BinauralSettings;
  qualityRequirements?: QualityRequirements;
};

// Represents a job from GET /api/jobs or the POST /api/jobs/create-single response
export type Job = {
  id: string;
  status: JobStatus;
  createdAt: string; // ISO 8601 date string
  completedAt?: string; // ISO 8601 date string
  resultUrl?: string;
  error?: string;
  // Including the original request can be useful for display purposes on the UI
  requestPayload: Partial<AsmrGenerationRequest>;
};

// Represents the response from GET /api/jobs/:id/progress
export type JobProgress = {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  currentStep: string; // e.g., "Generating voice", "Mixing soundscape"
  error?: string;
  estimatedTimeRemaining?: number; // Estimated seconds remaining
};

// --- UI-specific types ---

export type AsmrPreset = {
  id: string;
  name: string;
  description: string;
  category: 'voice' | 'soundscape' | 'mixing';
  settings: VoiceOptions | SoundscapeOptions | MixingOptions;
};

export type WizardStep = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
};
