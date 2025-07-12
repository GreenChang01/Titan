import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IAudioProvider,
  VoiceOptions,
  Voice,
  VoiceGenerationResult,
  VoiceCloneResult,
  ASMRVoicePresets
} from '../interfaces';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

interface ElevenLabsResponse {
  voices: ElevenLabsVoice[];
}

@Injectable()
export class ElevenLabsProvider implements IAudioProvider {
  private readonly logger = new Logger(ElevenLabsProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ELEVENLABS_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io');

    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60秒超时
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`ElevenLabs API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('ElevenLabs API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`ElevenLabs API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.detail || error.message;
        this.logger.error(`ElevenLabs API Error: ${status} - ${message}`);
        
        // 转换为标准HTTP异常
        if (status === 401) {
          throw new HttpException('ElevenLabs API authentication failed', HttpStatus.UNAUTHORIZED);
        } else if (status === 429) {
          throw new HttpException('ElevenLabs API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        } else if (status >= 500) {
          throw new HttpException('ElevenLabs API server error', HttpStatus.SERVICE_UNAVAILABLE);
        }
        
        throw new HttpException(
          `ElevenLabs API error: ${message}`,
          status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    );
  }

  async generateVoice(text: string, options: VoiceOptions): Promise<VoiceGenerationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Generating voice for text length: ${text.length} characters`);

      // 应用ASMR优化设置
      const optimizedOptions = this.applyASMROptimization(options);

      const requestData = {
        text,
        model_id: options.model || 'eleven_monolingual_v1',
        voice_settings: {
          stability: optimizedOptions.stability || 0.8,
          similarity_boost: optimizedOptions.similarityBoost || 0.9,
          style: optimizedOptions.style || 0.2,
          use_speaker_boost: optimizedOptions.speakerBoost || true,
        },
      };

      const response = await this.client.post(
        `/v1/text-to-speech/${options.voiceId}`,
        requestData,
        {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'audio/mpeg',
          },
        }
      );

      const audioBuffer = Buffer.from(response.data);
      const processingTime = Date.now() - startTime;

      // 估算音频元数据
      const metadata = await this.extractAudioMetadata(audioBuffer, processingTime);

      this.logger.log(`Voice generation completed in ${processingTime}ms`);

      return {
        audioBuffer,
        metadata: {
          ...metadata,
          provider: 'ElevenLabs',
          model: requestData.model_id,
          cost: await this.estimateCost(text, options),
        },
      };

    } catch (error) {
      this.logger.error(`Voice generation failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async getVoices(category?: string): Promise<Voice[]> {
    try {
      this.logger.log('Fetching available voices from ElevenLabs');

      const response = await this.client.get<ElevenLabsResponse>('/v1/voices');
      
      let voices = response.data.voices.map(voice => this.transformVoice(voice));

      // 按分类过滤
      if (category) {
        voices = voices.filter(voice => voice.category?.toLowerCase() === category.toLowerCase());
      }

      // 为ASMR用途标记推荐语音
      voices = this.markASMRSuitableVoices(voices);

      this.logger.log(`Retrieved ${voices.length} voices`);
      return voices;

    } catch (error) {
      this.logger.error(`Failed to fetch voices: ${(error as Error).message}`);
      throw error;
    }
  }

  async getVoiceById(voiceId: string): Promise<Voice> {
    try {
      const response = await this.client.get(`/v1/voices/${voiceId}`);
      return this.transformVoice(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch voice ${voiceId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async cloneVoice(audioSample: Buffer, name: string, description?: string): Promise<VoiceCloneResult> {
    try {
      this.logger.log(`Starting voice cloning for: ${name}`);

      const formData = new FormData();
      const audioBlob = new Blob([audioSample], { type: 'audio/mpeg' });
      formData.append('files', audioBlob, 'sample.mp3');
      formData.append('name', name);
      
      if (description) {
        formData.append('description', description);
      }

      const response = await this.client.post('/v1/voices/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        voiceId: response.data.voice_id,
        name: response.data.name,
        status: 'processing', // ElevenLabs通常需要处理时间
      };

    } catch (error) {
      this.logger.error(`Voice cloning failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async getCloneStatus(voiceId: string): Promise<VoiceCloneResult> {
    try {
      const voice = await this.getVoiceById(voiceId);
      
      return {
        voiceId: voice.id,
        name: voice.name,
        status: voice.isCustom ? 'completed' : 'processing',
        similarity: 0.85, // 假设相似度，实际应从API获取
      };
    } catch (error) {
      this.logger.error(`Failed to get clone status: ${(error as Error).message}`);
      throw error;
    }
  }

  async estimateCost(text: string, options: VoiceOptions): Promise<number> {
    // ElevenLabs按字符计费，大约$0.18-0.30 per 1000 characters
    const characterCount = text.length;
    const baseRate = 0.0002; // $0.2 per 1000 characters
    
    // 高质量模型可能更贵
    const modelMultiplier = options.model?.includes('turbo') ? 1.5 : 1.0;
    
    return (characterCount * baseRate * modelMultiplier);
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get('/v1/user');
      this.logger.log('ElevenLabs connection validated successfully');
      return true;
    } catch (error) {
      this.logger.error(`ElevenLabs connection validation failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * 应用ASMR优化设置
   */
  private applyASMROptimization(options: VoiceOptions): VoiceOptions {
    // 如果未指定参数，使用ASMR优化的默认值
    const optimized = { ...options };

    if (optimized.stability === undefined) {
      optimized.stability = 0.8; // 高稳定性适合ASMR
    }

    if (optimized.similarityBoost === undefined) {
      optimized.similarityBoost = 0.9; // 高相似度保持一致性
    }

    if (optimized.style === undefined) {
      optimized.style = 0.2; // 低风格强度，更自然
    }

    if (optimized.speakerBoost === undefined) {
      optimized.speakerBoost = true; // 增强说话者特征
    }

    return optimized;
  }

  /**
   * 转换ElevenLabs语音格式
   */
  private transformVoice(elevenLabsVoice: ElevenLabsVoice): Voice {
    return {
      id: elevenLabsVoice.voice_id,
      name: elevenLabsVoice.name,
      description: elevenLabsVoice.description,
      category: elevenLabsVoice.category,
      language: elevenLabsVoice.labels?.language || 'en-US',
      isCustom: elevenLabsVoice.category === 'cloned',
      previewUrl: elevenLabsVoice.preview_url,
    };
  }

  /**
   * 标记适合ASMR的语音
   */
  private markASMRSuitableVoices(voices: Voice[]): Voice[] {
    return voices.map(voice => {
      // 基于名称和描述判断是否适合ASMR
      const name = voice.name.toLowerCase();
      const description = voice.description?.toLowerCase() || '';
      
      const asmrKeywords = ['calm', 'gentle', 'soft', 'soothing', 'warm', 'peaceful'];
      const isASMRSuitable = asmrKeywords.some(keyword => 
        name.includes(keyword) || description.includes(keyword)
      );

      if (isASMRSuitable) {
        voice.description = `${voice.description || ''} [ASMR推荐]`.trim();
      }

      return voice;
    });
  }

  /**
   * 提取音频元数据（简化版本）
   */
  private async extractAudioMetadata(audioBuffer: Buffer, processingTime: number) {
    // 简化的元数据提取，实际应使用ffprobe
    return {
      duration: Math.floor(audioBuffer.length / 4410), // 粗略估算
      sampleRate: 22050, // ElevenLabs默认输出
      format: 'mp3',
      size: audioBuffer.length,
    };
  }
}