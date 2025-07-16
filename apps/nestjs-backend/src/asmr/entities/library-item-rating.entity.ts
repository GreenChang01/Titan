import { Entity, Property, ManyToOne, Index, types, Unique } from '@mikro-orm/core';
import { ASMRGeneration } from './asmr-generation.entity';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../common/entities/base-entity.entity';

@Entity()
@Unique({ properties: ['item', 'user'] })
@Index({ properties: ['user'] })
@Index({ properties: ['item'] })
export class LibraryItemRating extends BaseEntity {
  @Property({ type: types.decimal, precision: 3, scale: 2 })
  rating!: number;

  @ManyToOne(() => ASMRGeneration)
  item!: ASMRGeneration;

  @ManyToOne(() => User)
  user!: User;
}