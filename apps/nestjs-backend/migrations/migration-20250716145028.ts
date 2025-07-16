import {Migration} from '@mikro-orm/migrations';

export class Migration20250716145028 extends Migration {
	override async up(): Promise<void> {
		this.addSql(`alter table "aliyun_drive_config" add column "name" varchar(255) not null default 'Default';`);
	}

	override async down(): Promise<void> {
		this.addSql(`alter table "aliyun_drive_config" drop column "name";`);
	}
}
