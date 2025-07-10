import {Migration} from '@mikro-orm/migrations';

export class Migration20250710181900 extends Migration {
  async up(): Promise<void> {
    // Update aliyun_drive_config table for WebDAV support
    // First, add new WebDAV columns
    this.addSql('alter table "aliyun_drive_config" add column "webdav_url" varchar(500) null;');
    this.addSql('alter table "aliyun_drive_config" add column "username" varchar(255) null;');
    this.addSql('alter table "aliyun_drive_config" add column "encrypted_password" text null;');
    this.addSql('alter table "aliyun_drive_config" add column "display_name" varchar(255) null;');
    this.addSql('alter table "aliyun_drive_config" add column "timeout" integer not null default 30000;');
    this.addSql('alter table "aliyun_drive_config" add column "base_path" varchar(255) not null default \'/\';');

    // Drop old API-based columns (after data migration if needed)
    this.addSql('alter table "aliyun_drive_config" drop column if exists "encrypted_refresh_token";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "drive_id";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "user_name";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "nick_name";');

    // Make new columns required after adding them
    this.addSql('alter table "aliyun_drive_config" alter column "webdav_url" set not null;');
    this.addSql('alter table "aliyun_drive_config" alter column "username" set not null;');
    this.addSql('alter table "aliyun_drive_config" alter column "encrypted_password" set not null;');
  }

  async down(): Promise<void> {
    // Rollback: restore old API-based columns
    this.addSql('alter table "aliyun_drive_config" add column "encrypted_refresh_token" varchar(1000) null;');
    this.addSql('alter table "aliyun_drive_config" add column "drive_id" varchar(255) null;');
    this.addSql('alter table "aliyun_drive_config" add column "user_name" varchar(255) null;');
    this.addSql('alter table "aliyun_drive_config" add column "nick_name" varchar(255) null;');

    // Drop WebDAV columns
    this.addSql('alter table "aliyun_drive_config" drop column if exists "webdav_url";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "username";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "encrypted_password";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "display_name";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "timeout";');
    this.addSql('alter table "aliyun_drive_config" drop column if exists "base_path";');

    // Restore old column requirements
    this.addSql('alter table "aliyun_drive_config" alter column "encrypted_refresh_token" set not null;');
    this.addSql('alter table "aliyun_drive_config" alter column "drive_id" set not null;');
    this.addSql('alter table "aliyun_drive_config" alter column "user_name" set not null;');
  }
}
