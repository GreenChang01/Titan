import {Entity, Property, PrimaryKey, Index, types, Enum} from '@mikro-orm/core';
import {VoiceSettings, SoundscapeSettings, MixingSettings} from '../dto/asmr-generation.dto';

export enum PresetType {
	VOICE = 'voice',
	SOUNDSCAPE = 'soundscape',
	MIXING = 'mixing',
}

@Entity()
@Index({properties: ['type']})
@Index({properties: ['elderlyFriendly']})
@Index({properties: ['usageCount']})
export class ASMRPresetEntity {
	@PrimaryKey({type: types.string, length: 100})
	id!: string;

	@Property({type: types.string, length: 255})
	name!: string;

	@Property({type: types.text})
	description!: string;

	@Enum(() => PresetType)
	type!: PresetType;

	@Property({type: types.json})
	config!: VoiceSettings | SoundscapeSettings | MixingSettings;

	@Property({type: types.boolean, default: true})
	elderlyFriendly = true;

	@Property({type: types.array})
	tags!: string[];

	@Property({type: types.integer, default: 0})
	usageCount = 0;

	@Property({type: types.decimal, precision: 3, scale: 2, default: 0})
	rating = 0;

	@Property({type: types.boolean, default: true})
	isActive = true;

	@Property({onCreate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
	createdAt = new Date();

	@Property({onUpdate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
	updatedAt = new Date();
}
