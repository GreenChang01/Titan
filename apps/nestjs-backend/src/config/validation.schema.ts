/* eslint-disable unicorn/no-thenable */

import * as Joi from 'joi';
import {ConfigKey} from './config-key.enum';

const validationSchemaMap: Record<ConfigKey, Joi.Schema> = {
  [ConfigKey.NODE_ENV]: Joi.string().valid('development', 'staging', 'production').required(),
  [ConfigKey.FRONTEND_HOST]: Joi.string().default('localhost'),
  [ConfigKey.PORT]: Joi.number().min(0).max(65_535).default(4000),
  [ConfigKey.ENABLE_SWAGGER]: Joi.boolean().optional().default(true),

  [ConfigKey.POSTGRES_TIMEZONE]: Joi.string().default('UTC'),
  [ConfigKey.POSTGRES_DB_NAME]: Joi.string().required(),
  [ConfigKey.POSTGRES_PASSWORD]: Joi.string().required(),
  [ConfigKey.POSTGRES_PORT]: Joi.number().min(0).max(65_535).default(5432),
  [ConfigKey.POSTGRES_USER]: Joi.string().required(),
  [ConfigKey.POSTGRES_HOST]: Joi.string().required(),
  [ConfigKey.POSTGRES_DEBUG_MODE]: Joi.boolean().optional().default(false),

  [ConfigKey.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ConfigKey.JWT_REFRESH_SECRET]: Joi.string().required(),

  [ConfigKey.MAILDEV_WEB_PORT]: Joi.number().min(0).max(65_535).default(1080).when(ConfigKey.NODE_ENV, {
    is: 'development',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  [ConfigKey.MAIL_HOST]: Joi.string().required(),

  [ConfigKey.MAIL_PORT]: Joi.number().min(0).max(65_535).default(587).required(),

  [ConfigKey.MAIL_USER]: Joi.string().optional(),

  [ConfigKey.MAIL_PASS]: Joi.string().optional(),

  [ConfigKey.ENCRYPTION_KEY]: Joi.string().length(32).required(),
  [ConfigKey.WEBDAV_BASE_URL]: Joi.string().uri().required(),
  [ConfigKey.WEBDAV_USERNAME]: Joi.string().required(),
  [ConfigKey.WEBDAV_PASSWORD]: Joi.string().required(),
  [ConfigKey.WEBDAV_TIMEOUT]: Joi.number().min(1000).max(300_000).default(30_000),

  // Media Processing
  [ConfigKey.FFMPEG_PATH]: Joi.string().default('/usr/bin/ffmpeg'),
  [ConfigKey.TEMP_DIR]: Joi.string().default('/tmp/titan'),
  [ConfigKey.MAX_CONCURRENT_JOBS]: Joi.number().min(1).max(10).default(3),

  // File Storage
  [ConfigKey.UPLOAD_DIR]: Joi.string().default('./uploads'),
  [ConfigKey.MAX_FILE_SIZE]: Joi.number().min(1024).default(524288000), // 500MB
  [ConfigKey.ALLOWED_MIME_TYPES]: Joi.string().default('image/*,video/*,audio/*,text/*'),

  // Redis
  [ConfigKey.REDIS_HOST]: Joi.string().default('localhost'),
  [ConfigKey.REDIS_PORT]: Joi.number().min(1).max(65535).default(6379),
  [ConfigKey.REDIS_PASSWORD]: Joi.string().allow('').default(''),
  [ConfigKey.REDIS_DB]: Joi.number().min(0).max(15).default(0),

  // WeChat
  [ConfigKey.WECHAT_APP_ID]: Joi.string().required(),
  [ConfigKey.WECHAT_APP_SECRET]: Joi.string().required(),
  [ConfigKey.WECHAT_REDIRECT_URI]: Joi.string().uri().required(),

  // Content Generation
  [ConfigKey.DEFAULT_VIDEO_RESOLUTION]: Joi.string().default('1080x1920'),
  [ConfigKey.DEFAULT_VIDEO_FPS]: Joi.number().min(15).max(60).default(30),
  [ConfigKey.DEFAULT_AUDIO_BITRATE]: Joi.string().default('128k'),
  [ConfigKey.DEFAULT_VIDEO_BITRATE]: Joi.string().default('2000k'),
};

export default Joi.object(validationSchemaMap);
