import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { ContentTemplate } from './entities/content-template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(ContentTemplate)
    private readonly templateRepository: EntityRepository<ContentTemplate>,
    private readonly em: EntityManager,
  ) {}

  /**
   * 创建新模板
   */
  async createTemplate(createTemplateDto: CreateTemplateDto, userId: string): Promise<ContentTemplate> {
    const template = new ContentTemplate({
      userId,
      name: createTemplateDto.name,
      description: createTemplateDto.description,
    });
    
    // Set optional properties if provided
    if (createTemplateDto.templateConfig) {
      template.templateConfig = createTemplateDto.templateConfig;
    }
    
    if (createTemplateDto.slotDefinitions) {
      template.slotDefinitions = createTemplateDto.slotDefinitions;
    }
    
    if (createTemplateDto.videoSettings) {
      template.videoSettings = {
        ...template.videoSettings, // Keep defaults
        ...createTemplateDto.videoSettings, // Override with provided values
      };
    }
    
    if (createTemplateDto.isPublic !== undefined) {
      template.isPublic = createTemplateDto.isPublic;
    }

    await this.em.persistAndFlush(template);
    this.logger.log(`Template created: ${template.id}`);
    return template;
  }

  /**
   * 获取用户的模板列表（包含公共模板）
   */
  async getTemplates(userId: string): Promise<ContentTemplate[]> {
    return this.templateRepository.find(
      {
        $or: [
          { userId },
          { isPublic: true },
        ],
      },
      { orderBy: { createdAt: 'DESC' } }
    );
  }

  /**
   * 获取模板详情
   */
  async getTemplateById(templateId: string, userId: string): Promise<ContentTemplate> {
    const template = await this.templateRepository.findOne({
      id: templateId,
      $or: [
        { userId },
        { isPublic: true },
      ],
    });

    if (!template) {
      throw new NotFoundException('Template not found or access denied');
    }

    return template;
  }

  /**
   * 更新模板
   */
  async updateTemplate(templateId: string, updateDto: UpdateTemplateDto, userId: string): Promise<ContentTemplate> {
    const template = await this.templateRepository.findOne({
      id: templateId,
      userId, // 只有创建者可以修改
    });

    if (!template) {
      throw new NotFoundException('Template not found or you do not have permission to modify it');
    }

    if (updateDto.name !== undefined) {
      template.name = updateDto.name;
    }
    if (updateDto.description !== undefined) {
      template.description = updateDto.description;
    }
    if (updateDto.templateConfig !== undefined) {
      template.templateConfig = updateDto.templateConfig;
    }
    if (updateDto.slotDefinitions !== undefined) {
      template.slotDefinitions = updateDto.slotDefinitions.map(slot => ({
        name: slot.name,
        type: slot.type,
        required: slot.required,
        description: slot.description,
      }));
    }
    if (updateDto.videoSettings !== undefined) {
      template.videoSettings = updateDto.videoSettings;
    }
    if (updateDto.isPublic !== undefined) {
      template.isPublic = updateDto.isPublic;
    }

    await this.em.persistAndFlush(template);
    return template;
  }

  /**
   * 删除模板
   */
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.templateRepository.findOne({
      id: templateId,
      userId, // 只有创建者可以删除
    });

    if (!template) {
      throw new NotFoundException('Template not found or you do not have permission to delete it');
    }

    await this.em.removeAndFlush(template);
    this.logger.log(`Template deleted: ${templateId}`);
  }

  /**
   * 验证模板配置
   */
  async validateTemplateConfig(config: Record<string, any>): Promise<boolean> {
    // 基本验证逻辑
    if (!config || typeof config !== 'object') {
      return false;
    }

    // 可以添加更多具体的验证规则
    return true;
  }

  /**
   * 获取模板的插槽定义
   */
  async getTemplateSlots(templateId: string): Promise<Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>> {
    const template = await this.templateRepository.findOne({ id: templateId });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template.slotDefinitions;
  }

  /**
   * 创建系统预置模板
   */
  async createPresetTemplates(): Promise<void> {
    const presetTemplates = [
      {
        name: '图文ASMR模板',
        description: '静态图片配背景音乐的ASMR视频模板',
        userId: 'system',
        isPublic: true,
        slotDefinitions: [
          {
            name: '背景图',
            type: 'BACKGROUND_IMAGE',
            required: true,
            description: '视频的背景图片',
          },
          {
            name: '背景音乐',
            type: 'BGM_AUDIO',
            required: true,
            description: '背景音乐文件',
          },
          {
            name: '字幕文本',
            type: 'TEXT_CONTENT',
            required: false,
            description: '可选的字幕文本',
          },
        ],
        videoSettings: {
          resolution: '1080x1920',
          fps: 30,
          duration: 'auto',
        },
        templateConfig: {
          type: 'asmr',
          imageDisplayDuration: 30, // 图片显示时长（秒）
          fadeTransition: true,
          textPosition: 'bottom',
          textStyle: {
            fontSize: 24,
            color: '#FFFFFF',
            fontFamily: 'Arial',
          },
        },
      },
      {
        name: '动态背景视频模板',
        description: '动态视频背景配音频的模板',
        userId: 'system',
        isPublic: true,
        slotDefinitions: [
          {
            name: '背景视频',
            type: 'BACKGROUND_VIDEO',
            required: true,
            description: '作为背景的视频文件',
          },
          {
            name: '旁白音频',
            type: 'NARRATION_AUDIO',
            required: false,
            description: '可选的旁白音频',
          },
          {
            name: '背景音乐',
            type: 'BGM_AUDIO',
            required: false,
            description: '可选的背景音乐',
          },
          {
            name: '水印图片',
            type: 'WATERMARK_IMAGE',
            required: false,
            description: '可选的水印图片',
          },
        ],
        videoSettings: {
          resolution: '1080x1920',
          fps: 30,
          duration: 'auto',
        },
        templateConfig: {
          type: 'dynamic_background',
          audioMix: {
            narrationVolume: 0.8,
            bgmVolume: 0.3,
          },
          watermarkPosition: 'bottom-right',
          watermarkOpacity: 0.7,
        },
      },
    ];

    for (const templateData of presetTemplates) {
      const existingTemplate = await this.templateRepository.findOne({
        name: templateData.name,
        userId: 'system',
      });

      if (!existingTemplate) {
        const template = new ContentTemplate({
          userId: 'system',
          name: templateData.name,
          description: templateData.description,
        });
        
        // Set other properties after construction
        template.slotDefinitions = templateData.slotDefinitions;
        template.videoSettings = templateData.videoSettings;
        template.templateConfig = templateData.templateConfig;
        template.isPublic = templateData.isPublic;
        
        await this.em.persistAndFlush(template);
        this.logger.log(`Preset template created: ${template.name}`);
      }
    }
  }

  /**
   * 获取公共模板列表
   */
  async getPublicTemplates(): Promise<ContentTemplate[]> {
    return this.templateRepository.find(
      { isPublic: true },
      { orderBy: { createdAt: 'DESC' } }
    );
  }

  /**
   * 获取用户私有模板列表
   */
  async getUserTemplates(userId: string): Promise<ContentTemplate[]> {
    return this.templateRepository.find(
      { userId, isPublic: false },
      { orderBy: { createdAt: 'DESC' } }
    );
  }
}