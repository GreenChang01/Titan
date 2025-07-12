import {PrimaryKey, Property, types} from '@mikro-orm/core';
import {v4 as uuidv4} from 'uuid';

/**
 * 基础实体类
 * 为所有数据库实体提供通用字段：ID、创建时间和更新时间
 */
export abstract class BaseEntity {
  /** 主键 ID，自动生成的 UUID */
  @PrimaryKey({type: types.uuid})
  id = uuidv4();

  /** 创建时间，在创建时自动设置 */
  @Property({onCreate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
  createdAt = new Date();

  /** 更新时间，在每次更新时自动设置 */
  @Property({onUpdate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
  updatedAt = new Date();
}
