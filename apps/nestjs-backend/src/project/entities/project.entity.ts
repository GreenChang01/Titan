import {Cascade, Collection, Entity, ManyToOne, OneToMany, Property, types} from '@mikro-orm/core';
import {User} from '../../users/entities/user.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {ProjectMaterial} from '../../project-material/entities/project-material.entity';

@Entity()
export class Project extends BaseEntity {
  @Property({type: types.string, nullable: false})
  name: string;

  @Property({type: types.text, nullable: true})
  description?: string;

  @Property({type: types.string, nullable: true})
  color?: string;

  @ManyToOne(() => User, {nullable: false})
  user: User;

  @OneToMany(() => ProjectMaterial, (material) => material.project, {
    cascade: [Cascade.REMOVE],
  })
  materials = new Collection<ProjectMaterial>(this);

  @Property({type: types.boolean, default: true})
  isActive = true;

  @Property({type: types.datetime, columnType: 'timestamp', nullable: true})
  lastAccessedAt?: Date;

  constructor({name, description, color, user}: {name: string; description?: string; color?: string; user: User}) {
    super();
    this.name = name;
    this.description = description;
    this.color = color;
    this.user = user;
  }
}
