import {Migration} from '@mikro-orm/migrations';

export class Migration20250713031500 extends Migration {
	override async up(): Promise<void> {
		// 删除旧的check约束
		this.addSql(`alter table "user" drop constraint "user_status_check";`);

		// 添加新的check约束，匹配UserStatus枚举值
		this.addSql(
			`alter table "user" add constraint "user_status_check" check ("status" in ('pending', 'active', 'blocked'));`,
		);
	}

	override async down(): Promise<void> {
		// 恢复原来的约束
		this.addSql(`alter table "user" drop constraint "user_status_check";`);
		this.addSql(
			`alter table "user" add constraint "user_status_check" check ("status" in ('CONFIRMATION_PENDING', 'CONFIRMED', 'SUSPENDED'));`,
		);
	}
}
