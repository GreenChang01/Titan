export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export enum JobType {
  SINGLE = 'single',
  BATCH = 'batch',
}

export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PublishStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export enum ScheduleStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum UploadSource {
  LOCAL = 'local',
  ALIYUN_DRIVE = 'aliyun_drive',
}