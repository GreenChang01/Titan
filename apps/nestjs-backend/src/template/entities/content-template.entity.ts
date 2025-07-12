import { Entity, Property, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base-entity.entity';
import {
  SlotDefinition,
  TemplateConfig,
  VideoSettings,
  ContentTemplateConstructor,
} from '../types/content-template.types';

@Entity()
@Index({ properties: ['userId', 'createdAt'] })
@Index({ properties: ['isPublic'] })
export class ContentTemplate extends BaseEntity {
  @Property()
  userId: string;

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'json' })
  templateConfig: TemplateConfig = {};

  @Property({ type: 'json' })
  slotDefinitions: SlotDefinition[] = [];

  @Property({ type: 'json' })
  videoSettings: VideoSettings = {
    resolution: '1080x1920',
    fps: 30,
    duration: 'auto',
    sampleRate: 44100,
    audioChannels: 2,
  };

  @Property({ default: false })
  isPublic: boolean = false;

  constructor({ userId, name, description }: ContentTemplateConstructor) {
    super();
    this.userId = userId;
    this.name = name;
    if (description) {
      this.description = description;
    }
  }
}