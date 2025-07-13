import {Migration} from '@mikro-orm/migrations';

export class Migration20250710000000 extends Migration {
	async up(): Promise<void> {
		// Create user table first
		this.addSql('create table "user" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "email" varchar(255) not null, "password" varchar(255) not null, "username" varchar(255) not null, "confirmation_code" varchar(255) not null, "status" text check ("status" in (\'CONFIRMATION_PENDING\', \'CONFIRMED\', \'SUSPENDED\')) not null, "password_reset_token" varchar(255) null, "password_reset_token_created_at" timestamptz null, constraint "user_pkey" primary key ("id"));');
		this.addSql('create unique index "user_email_unique" on "user" ("email");');
		this.addSql('create unique index "user_username_unique" on "user" ("username");');

		// Create two_factor_auth table
		this.addSql('create table "two_factor_auth" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "code" varchar(255) not null, "user_id" uuid not null, constraint "two_factor_auth_pkey" primary key ("id"));');

		// Create revoked_refresh_token table
		this.addSql('create table "revoked_refresh_token" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "refresh_token" varchar(1000) not null, constraint "revoked_refresh_token_pkey" primary key ("id"));');

		// Add foreign key constraints
		this.addSql('alter table "two_factor_auth" add constraint "two_factor_auth_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
	}

	async down(): Promise<void> {
		// Drop foreign key constraints first
		this.addSql('alter table "two_factor_auth" drop constraint "two_factor_auth_user_id_foreign";');

		// Drop tables
		this.addSql('drop table if exists "revoked_refresh_token" cascade;');
		this.addSql('drop table if exists "two_factor_auth" cascade;');
		this.addSql('drop table if exists "user" cascade;');
	}
}
