import {Entity, ManyToOne, Property, types, Unique} from '@mikro-orm/core';
import {User} from '../../users/entities/user.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';

@Entity()
export class AliyunDriveConfig extends BaseEntity {
  @ManyToOne(() => User, {nullable: false})
  user: User;

  @Property({type: types.string, nullable: false})
  webdavUrl: string;

  @Property({type: types.string, nullable: false})
  username: string;

  @Property({type: types.text, nullable: false})
  encryptedPassword: string;

  @Property({type: types.string, nullable: true})
  displayName?: string;

  @Property({type: types.integer, default: 30000})
  timeout = 30000;

  @Property({type: types.string, default: '/'})
  basePath = '/';

  @Property({type: types.datetime, columnType: 'timestamp', nullable: true})
  lastSyncAt?: Date;

  @Property({type: types.boolean, default: true})
  isActive = true;

  @Unique()
  @Property({type: types.string, nullable: false, persist: false})
  get userConfigKey(): string {
    return `${this.user.id}`;
  }

  constructor({
    user,
    webdavUrl,
    username,
    encryptedPassword,
    displayName,
    timeout,
    basePath,
  }: {
    user: User;
    webdavUrl: string;
    username: string;
    encryptedPassword: string;
    displayName?: string;
    timeout?: number;
    basePath?: string;
  }) {
    super();
    this.user = user;
    this.webdavUrl = webdavUrl;
    this.username = username;
    this.encryptedPassword = encryptedPassword;
    this.displayName = displayName;
    if (timeout !== undefined) this.timeout = timeout;
    if (basePath !== undefined) this.basePath = basePath;
  }
}
