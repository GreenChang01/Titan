const {EntityManager} = require('@mikro-orm/postgresql');
const {MikroORM} = require('@mikro-orm/postgresql');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
require('dotenv/config');

async function seedUsers() {
	const orm = await MikroORM.init({
		driver: require('@mikro-orm/postgresql').PostgreSqlDriver,
		host: process.env.POSTGRES_HOST || 'localhost',
		port: Number.parseInt(process.env.POSTGRES_PORT || '5432'),
		user: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres',
		dbName: process.env.POSTGRES_DB_NAME || 'titan',
		entities: ['./src/users/entities/*.entity.js'],
		entitiesTs: ['./src/users/entities/*.entity.ts'],
		debug: true,
	});

	try {
		const em = orm.em.fork();

		// Check if users already exist
		const existingUsers = await em.getConnection().execute('SELECT * FROM public.user LIMIT 5');
		console.log('Existing users:', existingUsers);

		if (existingUsers.length === 0) {
			const hashedPassword = await bcrypt.hash('password123', 10);

			await em.getConnection().execute(
				`INSERT INTO public.user (id, email, password, username, status, subscription_plan, content_quota, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW()), (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
				[
					uuidv4(),
					'admin@example.com',
					hashedPassword,
					'admin',
					'active',
					'free',
					100,
					uuidv4(),
					'user@example.com',
					hashedPassword,
					'user',
					'active',
					'free',
					50,
				],
			);

			console.log('✅ Test users created successfully!');
			console.log('Admin: admin@example.com / password123');
			console.log('User: user@example.com / password123');
		} else {
			console.log('✅ Users already exist');
		}
	} catch (error) {
		console.error('❌ Error seeding users:', error);
	} finally {
		await orm.close();
	}
}

seedUsers();
