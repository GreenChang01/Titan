import { Entity, Property, ManyToOne, OneToMany, Collection, Enum, types, Index } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';
import { GenerationStatus, VoiceSettings, SoundscapeSettings, MixingSettings } from '../dto/asmr-generation.dto';
import { LibraryItemFavorite } from './library-item-favorite.entity';
import { LibraryItemRating } from './library-item-rating.entity';
import { BaseEntity } from '../../common/entities/base-entity.entity';

@Entity()
@Index({ properties: ['user', 'createdAt'] })
@Index({ properties: ['status'] })
export class ASMRGeneration extends BaseEntity {
  @Property({ type: types.string, length: 255 })
  title!: string;

  @Property({ type: types.text })
  content!: string;

  @Property({ type: types.text, nullable: true })
  description?: string;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => LibraryItemFavorite, favorite => favorite.item)
  favorites = new Collection<LibraryItemFavorite>(this);

  @OneToMany(() => LibraryItemRating, rating => rating.item)
  ratings = new Collection<LibraryItemRating>(this);

  @Property({ type: types.json })
  voiceSettings!: VoiceSettings;

  @Property({ type: types.json })
  soundscapeSettings!: SoundscapeSettings;

  @Property({ type: types.json })
  mixingSettings!: MixingSettings;

  @Property({ type: types.array, nullable: true })
  tags?: string[];

  @Property({ type: types.boolean, default: true })
  isPrivate: boolean = true;

  @Enum(() => GenerationStatus)
  status: GenerationStatus = GenerationStatus.PENDING;

  @Property({ type: types.decimal, precision: 10, scale: 4, default: 0 })
  cost: number = 0;

  @Property({ type: types.integer, default: 0 })
  estimatedDuration: number = 0;

  @Property({ type: types.string, length: 500, nullable: true })
  filePath?: string;

  @Property({ type: types.integer, nullable: true })
  duration?: number;

  @Property({ type: types.bigint, nullable: true })
  fileSize?: number;

  @Property({ type: types.integer, default: 0 })
  playCount: number = 0;

  @Property({ type: types.decimal, precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Property({ type: types.text, nullable: true })
  errorMessage?: string;
}