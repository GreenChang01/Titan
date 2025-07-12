import {ConfigKey} from './config-key.enum';

const appConfig = (): Record<ConfigKey, unknown> => ({
  [ConfigKey.NODE_ENV]: process.env.NODE_ENV,
  [ConfigKey.FRONTEND_HOST]: process.env.HOST,
  [ConfigKey.PORT]: process.env.PORT,
  [ConfigKey.ENABLE_SWAGGER]: Boolean(process.env.ENABLE_SWAGGER === 'true'),

  [ConfigKey.POSTGRES_TIMEZONE]: process.env.POSTGRES_TIMEZONE,
  [ConfigKey.POSTGRES_DB_NAME]: process.env.POSTGRES_DB_NAME,
  [ConfigKey.POSTGRES_PASSWORD]: process.env.POSTGRES_PASSWORD,
  [ConfigKey.POSTGRES_PORT]: Number(process.env.POSTGRES_PORT),
  [ConfigKey.POSTGRES_HOST]: process.env.POSTGRES_HOST,
  [ConfigKey.POSTGRES_USER]: process.env.POSTGRES_USER,
  [ConfigKey.POSTGRES_DEBUG_MODE]: Boolean(process.env.POSTGRES_DEBUG_MODE === 'true'),

  [ConfigKey.JWT_ACCESS_SECRET]: process.env.JWT_ACCESS_SECRET,
  [ConfigKey.JWT_REFRESH_SECRET]: process.env.JWT_REFRESH_SECRET,

  [ConfigKey.MAILDEV_WEB_PORT]: Number(process.env.MAILDEV_WEB_PORT),
  [ConfigKey.MAIL_HOST]: process.env.MAIL_HOST,
  [ConfigKey.MAIL_PORT]: Number(process.env.MAIL_PORT),
  [ConfigKey.MAIL_USER]: process.env.MAIL_USER,
  [ConfigKey.MAIL_PASS]: process.env.MAIL_PASS,

  [ConfigKey.ENCRYPTION_KEY]: process.env.ENCRYPTION_KEY,
  [ConfigKey.WEBDAV_BASE_URL]: process.env.WEBDAV_BASE_URL,
  [ConfigKey.WEBDAV_USERNAME]: process.env.WEBDAV_USERNAME,
  [ConfigKey.WEBDAV_PASSWORD]: process.env.WEBDAV_PASSWORD,
  [ConfigKey.WEBDAV_TIMEOUT]: Number(process.env.WEBDAV_TIMEOUT),

  // Media Processing
  [ConfigKey.FFMPEG_PATH]: process.env.FFMPEG_PATH,
  [ConfigKey.TEMP_DIR]: process.env.TEMP_DIR,
  [ConfigKey.MAX_CONCURRENT_JOBS]: Number(process.env.MAX_CONCURRENT_JOBS),

  // File Storage
  [ConfigKey.UPLOAD_DIR]: process.env.UPLOAD_DIR,
  [ConfigKey.MAX_FILE_SIZE]: Number(process.env.MAX_FILE_SIZE),
  [ConfigKey.ALLOWED_MIME_TYPES]: process.env.ALLOWED_MIME_TYPES,

  // Redis
  [ConfigKey.REDIS_HOST]: process.env.REDIS_HOST,
  [ConfigKey.REDIS_PORT]: Number(process.env.REDIS_PORT),
  [ConfigKey.REDIS_PASSWORD]: process.env.REDIS_PASSWORD,
  [ConfigKey.REDIS_DB]: Number(process.env.REDIS_DB),

  // WeChat
  [ConfigKey.WECHAT_APP_ID]: process.env.WECHAT_APP_ID,
  [ConfigKey.WECHAT_APP_SECRET]: process.env.WECHAT_APP_SECRET,
  [ConfigKey.WECHAT_REDIRECT_URI]: process.env.WECHAT_REDIRECT_URI,

  // Content Generation
  [ConfigKey.DEFAULT_VIDEO_RESOLUTION]: process.env.DEFAULT_VIDEO_RESOLUTION,
  [ConfigKey.DEFAULT_VIDEO_FPS]: Number(process.env.DEFAULT_VIDEO_FPS),
  [ConfigKey.DEFAULT_AUDIO_BITRATE]: Number(process.env.DEFAULT_AUDIO_BITRATE),
  [ConfigKey.DEFAULT_VIDEO_BITRATE]: Number(process.env.DEFAULT_VIDEO_BITRATE),
});

export default appConfig;
