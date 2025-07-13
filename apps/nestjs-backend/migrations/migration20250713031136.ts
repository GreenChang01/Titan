import {Migration} from '@mikro-orm/migrations';

export class Migration20250713031136 extends Migration {
	override async up(): Promise<void> {
		// 只添加用户表缺失的字段
		this.addSql(
			`alter table "user" add column "wechat_video_channel_id" varchar(255) null, add column "subscription_plan" varchar(255) not null default 'free', add column "content_quota" int not null default 10;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table "user" drop column "wechat_video_channel_id", drop column "subscription_plan", drop column "content_quota";`,
		);
	}
}
