import {Publication} from '../entities/publication.entity';

export type IPlatformPublisher = {
  /**
   * 发布内容到指定平台
   */
  publish(publication: Publication): Promise<void>;

  /**
   * 检查发布状态
   */
  checkStatus(publication: Publication): Promise<void>;

  /**
   * 取消发布
   */
  cancel?(publication: Publication): Promise<void>;

  /**
   * 支持的平台标识
   */
  readonly platform: string;
}
