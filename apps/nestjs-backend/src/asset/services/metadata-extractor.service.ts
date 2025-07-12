import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from '../../config/config-key.enum';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';

const execAsync = promisify(exec);

interface MediaMetadata {
  duration?: number;
  width?: number;
  height?: number;
  bitrate?: number;
  fps?: number;
  codec?: string;
  channels?: number;
  sampleRate?: number;
  format?: string;
  [key: string]: any;
}

@Injectable()
export class MetadataExtractorService {
  private readonly logger = new Logger(MetadataExtractorService.name);
  private readonly ffprobePath: string;

  constructor(private readonly configService: ConfigService) {
    const ffmpegPath = this.configService.get<string>(ConfigKey.FFMPEG_PATH) || '/usr/bin/ffmpeg';
    this.ffprobePath = ffmpegPath.replace('ffmpeg', 'ffprobe');
  }

  async extractMetadata(filePath: string, mimeType: string): Promise<MediaMetadata> {
    try {
      if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
        return await this.extractMediaMetadata(filePath);
      } else if (mimeType.startsWith('image/')) {
        return await this.extractImageMetadata(filePath);
      } else if (mimeType.startsWith('text/')) {
        return await this.extractTextMetadata(filePath);
      }

      return {};
    } catch (error) {
      this.logger.error(`Failed to extract metadata for ${filePath}:`, error);
      return {};
    }
  }

  private async extractMediaMetadata(filePath: string): Promise<MediaMetadata> {
    const command = `${this.ffprobePath} -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    
    const { stdout } = await execAsync(command);
    const probe = JSON.parse(stdout);

    const metadata: MediaMetadata = {};

    // Extract format information
    if (probe.format) {
      metadata.duration = parseFloat(probe.format.duration) || 0;
      metadata.bitrate = parseInt(probe.format.bit_rate) || 0;
      metadata.format = probe.format.format_name;
    }

    // Extract video stream information
    const videoStream = probe.streams?.find((stream: any) => stream.codec_type === 'video');
    if (videoStream) {
      metadata.width = videoStream.width;
      metadata.height = videoStream.height;
      metadata.codec = videoStream.codec_name;
      
      // Calculate FPS
      if (videoStream.r_frame_rate) {
        const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
        metadata.fps = den ? Math.round((num / den) * 100) / 100 : 0;
      }
    }

    // Extract audio stream information
    const audioStream = probe.streams?.find((stream: any) => stream.codec_type === 'audio');
    if (audioStream) {
      metadata.channels = audioStream.channels;
      metadata.sampleRate = audioStream.sample_rate;
      if (!metadata.codec) {
        metadata.codec = audioStream.codec_name;
      }
    }

    return metadata;
  }

  private async extractImageMetadata(filePath: string): Promise<MediaMetadata> {
    const command = `${this.ffprobePath} -v quiet -print_format json -show_streams "${filePath}"`;
    
    try {
      const { stdout } = await execAsync(command);
      const probe = JSON.parse(stdout);

      const videoStream = probe.streams?.[0];
      if (videoStream) {
        return {
          width: videoStream.width,
          height: videoStream.height,
          codec: videoStream.codec_name,
          format: videoStream.codec_name,
        };
      }
    } catch (error) {
      this.logger.warn(`FFprobe failed for image ${filePath}, using basic metadata`);
    }

    // Fallback to basic file stats
    const stats = await fs.stat(filePath);
    return {
      fileSize: stats.size,
      lastModified: stats.mtime,
    };
  }

  private async extractTextMetadata(filePath: string): Promise<MediaMetadata> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');

    return {
      fileSize: stats.size,
      lastModified: stats.mtime,
      lineCount: content.split('\n').length,
      characterCount: content.length,
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
    };
  }

  async getVideoDuration(filePath: string): Promise<number> {
    try {
      const command = `${this.ffprobePath} -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`;
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      this.logger.error(`Failed to get video duration for ${filePath}:`, error);
      return 0;
    }
  }

  async getVideoResolution(filePath: string): Promise<{ width: number; height: number }> {
    try {
      const command = `${this.ffprobePath} -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`;
      const { stdout } = await execAsync(command);
      const [width, height] = stdout.trim().split('x').map(Number);
      return { width: width || 0, height: height || 0 };
    } catch (error) {
      this.logger.error(`Failed to get video resolution for ${filePath}:`, error);
      return { width: 0, height: 0 };
    }
  }
}