import {type EntityManager} from '@mikro-orm/postgresql';
import {User} from '../../users/entities/user.entity';
import {UserStatus} from '@titan/shared';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
	async run(em: EntityManager): Promise<void> {
		// Create admin user
		const adminUser = new User({
			email: 'admin@example.com',
			username: 'admin',
			password: await bcrypt.hash('password123', 10),
			status: UserStatus.ACTIVE,
			confirmationCode: Math.floor(100_000 + Math.random() * 900_000).toString(),
		});

		// Create test user
		const testUser = new User({
			email: 'user@example.com',
			username: 'testuser',
			password: await bcrypt.hash('password123', 10),
			status: UserStatus.ACTIVE,
			confirmationCode: Math.floor(100_000 + Math.random() * 900_000).toString(),
		});

		await em.persistAndFlush([adminUser, testUser]);
		console.log('Seeded admin and test users');
	}
}
