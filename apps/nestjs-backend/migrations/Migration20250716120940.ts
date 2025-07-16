import {Migration} from '@mikro-orm/migrations';

export class Migration20250716120940 extends Migration {
	override async up(): Promise<void> {
		this.addSql(`create table "asmrpreset_entity" ("id" varchar(100) not null, "name" varchar(255) not null, "description" text not null, "type" text check ("type" in ('voice', 'soundscape', 'mixing')) not null, "config" jsonb not null, "elderly_friendly" boolean not null default true, "tags" text[] not null, "usage_count" int not null default 0, "rating" numeric(3,2) not null default 0, "is_active" boolean not null default true, "created_at" timestamp not null, "updated_at" timestamp not null, constraint "asmrpreset_entity_pkey" primary key ("id"));`);
		this.addSql(`create index "asmrpreset_entity_usage_count_index" on "asmrpreset_entity" ("usage_count");`);
		this.addSql(`create index "asmrpreset_entity_elderly_friendly_index" on "asmrpreset_entity" ("elderly_friendly");`);
		this.addSql(`create index "asmrpreset_entity_type_index" on "asmrpreset_entity" ("type");`);

		this.addSql(`create table "asmrgeneration" ("id" uuid not null, "created_at" timestamp not null, "updated_at" timestamp not null, "title" varchar(255) not null, "content" text not null, "description" text null, "user_id" uuid not null, "voice_settings" jsonb not null, "soundscape_settings" jsonb not null, "mixing_settings" jsonb not null, "tags" text[] null, "is_private" boolean not null default true, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed', 'cancelled')) not null default 'pending', "cost" numeric(10,4) not null default 0, "estimated_duration" int not null default 0, "file_path" varchar(500) null, "duration" int null, "file_size" bigint null, "play_count" int not null default 0, "rating" numeric(3,2) null, "error_message" text null, constraint "asmrgeneration_pkey" primary key ("id"));`);
		this.addSql(`create index "asmrgeneration_status_index" on "asmrgeneration" ("status");`);
		this.addSql(`create index "asmrgeneration_user_id_created_at_index" on "asmrgeneration" ("user_id", "created_at");`);

		this.addSql(`create table "library_item_rating" ("id" uuid not null, "created_at" timestamp not null, "updated_at" timestamp not null, "rating" numeric(3,2) not null, "item_id" uuid not null, "user_id" uuid not null, constraint "library_item_rating_pkey" primary key ("id"));`);
		this.addSql(`create index "library_item_rating_item_id_index" on "library_item_rating" ("item_id");`);
		this.addSql(`create index "library_item_rating_user_id_index" on "library_item_rating" ("user_id");`);
		this.addSql(`alter table "library_item_rating" add constraint "library_item_rating_item_id_user_id_unique" unique ("item_id", "user_id");`);

		this.addSql(`create table "library_item_favorite" ("id" uuid not null, "created_at" timestamp not null, "updated_at" timestamp not null, "is_favorite" boolean not null default true, "item_id" uuid not null, "user_id" uuid not null, constraint "library_item_favorite_pkey" primary key ("id"));`);
		this.addSql(`create index "library_item_favorite_item_id_index" on "library_item_favorite" ("item_id");`);
		this.addSql(`create index "library_item_favorite_user_id_index" on "library_item_favorite" ("user_id");`);
		this.addSql(`alter table "library_item_favorite" add constraint "library_item_favorite_item_id_user_id_unique" unique ("item_id", "user_id");`);

		this.addSql(`alter table "asmrgeneration" add constraint "asmrgeneration_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

		this.addSql(`alter table "library_item_rating" add constraint "library_item_rating_item_id_foreign" foreign key ("item_id") references "asmrgeneration" ("id") on update cascade;`);
		this.addSql(`alter table "library_item_rating" add constraint "library_item_rating_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

		this.addSql(`alter table "library_item_favorite" add constraint "library_item_favorite_item_id_foreign" foreign key ("item_id") references "asmrgeneration" ("id") on update cascade;`);
		this.addSql(`alter table "library_item_favorite" add constraint "library_item_favorite_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
	}

	override async down(): Promise<void> {
		this.addSql(`alter table "library_item_rating" drop constraint "library_item_rating_item_id_foreign";`);

		this.addSql(`alter table "library_item_favorite" drop constraint "library_item_favorite_item_id_foreign";`);

		this.addSql(`drop table if exists "asmrpreset_entity" cascade;`);

		this.addSql(`drop table if exists "asmrgeneration" cascade;`);

		this.addSql(`drop table if exists "library_item_rating" cascade;`);

		this.addSql(`drop table if exists "library_item_favorite" cascade;`);
	}
}
