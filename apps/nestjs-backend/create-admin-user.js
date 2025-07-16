const { EntityManager } = require('@mikro-orm/postgresql');
const { defineConfig, PostgreSqlDriver } = require('@mikro-orm/postgresql');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv/config');

// 模拟 User 实体结构
class User {
  constructor({ email, password, username, confirmationCode }) {
    this.id = uuidv4();
    this.email = email;
    this.password = password;
    this.username = username;
    this.confirmationCode = confirmationCode;
    this.status = 'active'; // 直接设置为激活状态
    this.subscriptionPlan = 'free';
    this.contentQuota = 10;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

async function createAdminUser() {
  // 创建 MikroORM 配置
  const config = defineConfig({
    driver: PostgreSqlDriver,
    dbName: process.env.POSTGRES_DB_NAME,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    debug: process.env.POSTGRES_DEBUG_MODE === 'true',
    timezone: process.env.POSTGRES_TIMEZONE,
  });

  // 创建实体管理器
  const em = new EntityManager(config);

  try {
    // 检查是否已存在 admin 用户
    const existingUser = await em.getConnection().execute(
      'SELECT * FROM public.user WHERE username = ? OR email = ?',
      ['admin', 'admin@example.com']
    );

    if (existingUser.length > 0) {
      console.log('Admin user already exists!');
      return;
    }

    // 创建哈希密码
    const hashedPassword = await bcrypt.hash('123456', 10);
    const confirmationCode = Buffer.from(uuidv4()).toString('base64url');

    // 创建用户
    const user = new User({
      email: 'admin@example.com',
      password: hashedPassword,
      username: 'admin',
      confirmationCode,
    });

    // 插入用户到数据库
    await em.getConnection().execute(
      `INSERT INTO public.user (id, email, password, username, confirmation_code, status, subscription_plan, content_quota, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.password,
        user.username,
        user.confirmationCode,
        user.status,
        user.subscriptionPlan,
        user.contentQuota,
        user.createdAt,
        user.updatedAt,
      ]
    );

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: 123456');
    console.log('Status: active');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await em.close();
  }
}

createAdminUser();