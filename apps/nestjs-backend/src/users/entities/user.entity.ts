import {Cascade, Collection, Entity, Enum, OneToMany, Property, types, Unique} from '@mikro-orm/core';
import {UserStatus} from '@titan/shared';
import {TwoFactorAuth} from '../../auth/entities/two-factor-auth.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {AliyunDriveConfig} from '../../aliyun-drive/entities/aliyun-drive-config.entity';
import {Project} from '../../project/entities/project.entity';

@Entity()
export class User extends BaseEntity {
  @Property({type: types.string, nullable: false})
  @Unique()
  email: string;

  @Property({type: types.string, nullable: false})
  password: string;

  @Property({type: types.string, nullable: false})
  @Unique()
  username: string;

  @Property({type: types.string, nullable: false})
  confirmationCode: string;

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.CONFIRMATION_PENDING;

  @Property({type: types.string, nullable: true})
  passwordResetToken?: string | undefined;

  @Property({type: types.datetime, columnType: 'timestamp', nullable: true})
  passwordResetTokenCreatedAt?: Date | undefined;

  @OneToMany(() => TwoFactorAuth, (twoFactorAuth) => twoFactorAuth.user, {
    cascade: [Cascade.REMOVE],
    nullable: true,
  })
  twoFactorAuth?: TwoFactorAuth[];

  @OneToMany(() => AliyunDriveConfig, (config) => config.user, {
    cascade: [Cascade.REMOVE],
    nullable: true,
  })
  aliyunDriveConfig?: AliyunDriveConfig[];

  @OneToMany(() => Project, (project) => project.user, {
    cascade: [Cascade.REMOVE],
  })
  projects = new Collection<Project>(this);

  constructor({
    email,
    password,
    username,
    confirmationCode,
  }: {
    email: string;
    password: string;
    username: string;
    confirmationCode: string;
  }) {
    super();
    this.email = email;
    this.password = password;
    this.username = username;
    this.confirmationCode = confirmationCode;
  }
}
