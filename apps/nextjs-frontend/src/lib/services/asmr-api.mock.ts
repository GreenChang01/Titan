import type {
  ASMRGenerationRequest, Job, JobProgress, ASMRPreset,
} from '@titan/shared';

// Mock data for ASMR presets
const mockVoicePresets: ASMRPreset[] = [
  {
    id: 'female-gentle',
    name: '温柔女声',
    description: '适合睡前故事和冥想引导的轻柔女性声音',
    category: 'voice',
    settings: {
      voiceId: 'voice-female-gentle-001',
      stability: 0.85,
      similarity: 0.9,
      style: 0.1,
      speakerBoost: true,
    },
  },
  {
    id: 'male-calm',
    name: '沉稳男声',
    description: '适合正念练习和深度放松的成熟男性声音',
    category: 'voice',
    settings: {
      voiceId: 'voice-male-calm-001',
      stability: 0.8,
      similarity: 0.85,
      style: 0.15,
      speakerBoost: true,
    },
  },
  {
    id: 'female-warm',
    name: '温暖女声',
    description: '温暖亲切的女性声音，语速适中，发音清晰',
    category: 'voice',
    settings: {
      voiceId: 'voice-female-warm-001',
      stability: 0.9,
      similarity: 0.95,
      style: 0.05,
      speakerBoost: true,
    },
  },
];

const mockSoundscapePresets: ASMRPreset[] = [
  {
    id: 'rain-forest',
    name: '雨林环境',
    description: '温和的雨滴声配合鸟儿轻鸣，营造宁静的自然氛围',
    category: 'soundscape',
    settings: {
      prompt: 'Gentle rain falling on leaves in a peaceful forest with distant bird songs',
      duration: 300,
      category: 'nature',
      intensity: 3,
      quality: 'high',
    },
  },
  {
    id: 'fireplace',
    name: '壁炉火焰',
    description: '温暖的壁炉火焰轻柔地燃烧，偶尔发出劈啪声',
    category: 'soundscape',
    settings: {
      prompt: 'Warm crackling fireplace with gentle flame sounds and occasional pops',
      duration: 300,
      category: 'indoor',
      intensity: 2,
      quality: 'high',
    },
  },
  {
    id: 'ocean-waves',
    name: '海浪声',
    description: '轻柔的海浪拍打海岸，带来放松的节奏感',
    category: 'soundscape',
    settings: {
      prompt: 'Gentle ocean waves lapping against a peaceful shore with soft rhythm',
      duration: 300,
      category: 'nature',
      intensity: 3,
      quality: 'high',
    },
  },
  {
    id: 'wind-chimes',
    name: '风铃声',
    description: '微风轻抚风铃，发出清脆悦耳的音符',
    category: 'soundscape',
    settings: {
      prompt: 'Soft wind chimes gently swaying in a light breeze with melodic tones',
      duration: 300,
      category: 'nature',
      intensity: 2,
      quality: 'high',
    },
  },
];

const mockMixingPresets: ASMRPreset[] = [
  {
    id: 'clarity-enhanced',
    name: '清晰度增强',
    description: '增强人声清晰度，适合语音内容为主的ASMR',
    category: 'mixing',
    settings: {
      voiceVolume: 0.7,
      soundscapeVolume: 0.3,
      fadeInDuration: 3,
      fadeOutDuration: 5,
      eqSettings: {
        lowFreq: -2,
        midFreq: 1,
        highFreq: -1,
      },
    },
  },
  {
    id: 'sleep-optimized',
    name: '睡眠优化',
    description: '专为入睡设计的混音设置，音量渐降效果',
    category: 'mixing',
    settings: {
      voiceVolume: 0.6,
      soundscapeVolume: 0.4,
      fadeInDuration: 5,
      fadeOutDuration: 10,
      eqSettings: {
        lowFreq: 0,
        midFreq: 0,
        highFreq: -3,
      },
    },
  },
  {
    id: 'meditation-focus',
    name: '冥想专注',
    description: '适合冥想练习的平衡混音，保持稳定的音量层次',
    category: 'mixing',
    settings: {
      voiceVolume: 0.8,
      soundscapeVolume: 0.2,
      fadeInDuration: 2,
      fadeOutDuration: 3,
      eqSettings: {
        lowFreq: -1,
        midFreq: 2,
        highFreq: 0,
      },
    },
  },
];

// Mock job generator
let mockJobCounter = 1;

const generateMockJob = (payload: ASMRGenerationRequest): Job => {
  const jobId = `job-${Date.now()}-${mockJobCounter++}`;
  return {
    id: jobId,
    status: 'queued',
    createdAt: new Date().toISOString(),
    requestPayload: payload,
  };
};

const generateMockProgress = (
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed' = 'processing',
): JobProgress => {
  const progressMap = {
    queued: {progress: 0, currentStep: '等待开始处理...'},
    processing: {progress: Math.floor(Math.random() * 80) + 10, currentStep: '正在生成AI语音...'},
    completed: {progress: 100, currentStep: '生成完成'},
    failed: {progress: 0, currentStep: '处理失败'},
  };

  const {progress, currentStep} = progressMap[status];

  return {
    jobId,
    status,
    progress,
    currentStep,
    estimatedTimeRemaining: status === 'processing' ? Math.floor(Math.random() * 300) + 60 : undefined,
    error: status === 'failed' ? 'AI服务暂时不可用，请稍后重试' : undefined,
  };
};

// Mock stored jobs (simulating a simple in-memory store)
const mockJobs = new Map<string, Job>();
const mockJobProgresses = new Map<string, JobProgress>();

export const mockASMRApiService = {
  /**
   * Creates a new ASMR generation job (mock).
   */
  async createJob(payload: ASMRGenerationRequest): Promise<Job> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const job = generateMockJob(payload);

    // Store in mock storage
    mockJobs.set(job.id, job);

    // Initialize progress
    const progress = generateMockProgress(job.id, 'queued');
    mockJobProgresses.set(job.id, progress);

    // Simulate job progression after creation
    setTimeout(() => {
      const updatedProgress = generateMockProgress(job.id, 'processing');
      mockJobProgresses.set(job.id, updatedProgress);
    }, 2000);

    // Simulate job completion after 10-15 seconds
    setTimeout(
      () => {
        const completedProgress = generateMockProgress(job.id, 'completed');
        mockJobProgresses.set(job.id, completedProgress);

        // Update job status
        const updatedJob = {...job, status: 'completed' as const, completedAt: new Date().toISOString()};
        mockJobs.set(job.id, updatedJob);
      },
      Math.random() * 5000 + 10_000,
    ); // 10-15 seconds

    return job;
  },

  /**
   * Creates multiple ASMR generation jobs in batch (mock).
   */
  async createBatchJobs(requests: ASMRGenerationRequest[]): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return Promise.all(requests.map(async request => this.createJob(request)));
  },

  /**
   * Fetches the progress for a specific job (mock).
   */
  async getJobProgress(jobId: string): Promise<JobProgress> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const progress = mockJobProgresses.get(jobId);
    if (!progress) {
      throw new Error(`Job ${jobId} not found`);
    }

    return progress;
  },

  /**
   * Fetches the list of all jobs for the current user (mock).
   */
  async listJobs(options?: {status?: string; projectId?: string; page?: number; limit?: number}): Promise<{
    jobs: Job[];
    total: number;
    page: number;
    limit: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const allJobs = [...mockJobs.values()];
    const filteredJobs = options?.status ? allJobs.filter(job => job.status === options.status) : allJobs;

    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    return {
      jobs: paginatedJobs.reverse(), // Most recent first
      total: filteredJobs.length,
      page,
      limit,
    };
  },

  /**
   * Fetches job details by ID (mock).
   */
  async getJobById(jobId: string): Promise<Job> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const job = mockJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return job;
  },

  /**
   * Retries a failed job (mock).
   */
  async retryJob(jobId: string): Promise<Job> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const job = mockJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Reset job status and progress
    const retriedJob = {...job, status: 'queued' as const};
    mockJobs.set(jobId, retriedJob);

    const progress = generateMockProgress(jobId, 'queued');
    mockJobProgresses.set(jobId, progress);

    return retriedJob;
  },

  /**
   * Fetches ASMR presets (mock).
   */
  async getPresets(): Promise<{
    voicePresets: ASMRPreset[];
    soundscapePresets: ASMRPreset[];
    mixingPresets: ASMRPreset[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      voicePresets: mockVoicePresets,
      soundscapePresets: mockSoundscapePresets,
      mixingPresets: mockMixingPresets,
    };
  },

  /**
   * Estimates the cost of an ASMR generation request (mock).
   */
  async estimateCost(payload: ASMRGenerationRequest): Promise<{
    voiceCost: number;
    soundscapeCost: number;
    totalCost: number;
    currency: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simple mock cost calculation based on text length and duration
    const textLength = payload.text.length;
    const {duration} = payload.soundscapeConfig;

    const voiceCost = 0.01 + (textLength / 1000) * 0.05; // Base + per 1000 chars
    const soundscapeCost = 0.02 + (duration / 60) * 0.03; // Base + per minute

    return {
      voiceCost: Math.round(voiceCost * 10_000) / 10_000, // Round to 4 decimals
      soundscapeCost: Math.round(soundscapeCost * 10_000) / 10_000,
      totalCost: Math.round((voiceCost + soundscapeCost) * 10_000) / 10_000,
      currency: 'USD',
    };
  },

  /**
   * Validates AI services connection status (mock).
   */
  async validateServices(): Promise<{
    elevenlabs: boolean;
    elevenLabsSoundscape: boolean;
    ffmpeg: boolean;
    overall: boolean;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate some randomness in service availability
    const services = {
      elevenlabs: Math.random() > 0.1, // 90% success rate
      elevenLabsSoundscape: Math.random() > 0.2, // 80% success rate
      ffmpeg: true, // Local service, always available
      overall: false,
    };

    services.overall = services.elevenlabs && services.elevenLabsSoundscape && services.ffmpeg;

    return services;
  },
};
