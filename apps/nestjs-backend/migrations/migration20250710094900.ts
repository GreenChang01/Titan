import {Migration} from '@mikro-orm/migrations';

export class Migration20250710094900 extends Migration {
	async up(): Promise<void> {
		// Create aliyun_drive_config table
		this.addSql(
			'create table "aliyun_drive_config" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "encrypted_refresh_token" varchar(1000) not null, "drive_id" varchar(255) not null, "user_name" varchar(255) not null, "nick_name" varchar(255) null, "last_sync_at" timestamptz null, "is_active" boolean not null default true, "user_id" uuid not null, constraint "aliyun_drive_config_pkey" primary key ("id"));',
		);
		this.addSql('create unique index "aliyun_drive_config_user_id_unique" on "aliyun_drive_config" ("user_id");');

		// Create project table
		this.addSql(
			'create table "project" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "name" varchar(255) not null, "description" text null, "color" varchar(7) not null default \'#3B82F6\', "is_active" boolean not null default true, "last_accessed_at" timestamptz null, "user_id" uuid not null, constraint "project_pkey" primary key ("id"));',
		);

		// Create project_material table
		this.addSql(
			'create table "project_material" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "aliyun_file_id" varchar(255) not null, "file_name" varchar(255) not null, "file_path" varchar(1000) not null, "file_type" varchar(100) not null, "file_size" bigint null, "thumbnail_url" varchar(500) null, "metadata" jsonb null, "project_id" uuid not null, constraint "project_material_pkey" primary key ("id"));',
		);
		this.addSql(
			'create unique index "project_material_project_id_aliyun_file_id_unique" on "project_material" ("project_id", "aliyun_file_id");',
		);

		// Add foreign key constraints
		this.addSql(
			'alter table "aliyun_drive_config" add constraint "aliyun_drive_config_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
		);
		this.addSql(
			'alter table "project" add constraint "project_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
		);
		this.addSql(
			'alter table "project_material" add constraint "project_material_project_id_foreign" foreign key ("project_id") references "project" ("id") on update cascade on delete cascade;',
		);
	}

	async down(): Promise<void> {
		// Drop foreign key constraints first
		this.addSql('alter table "aliyun_drive_config" drop constraint "aliyun_drive_config_user_id_foreign";');
		this.addSql('alter table "project" drop constraint "project_user_id_foreign";');
		this.addSql('alter table "project_material" drop constraint "project_material_project_id_foreign";');

		// Drop tables
		this.addSql('drop table if exists "project_material" cascade;');
		this.addSql('drop table if exists "project" cascade;');
		this.addSql('drop table if exists "aliyun_drive_config" cascade;');
	}
}
