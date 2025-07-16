const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv/config');

async function updatePassword() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres_user',
    password: process.env.POSTGRES_PASSWORD || 'postgres_password',
    database: process.env.POSTGRES_DB_NAME || 'postgres_db',
  });

  try {
    await client.connect();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Update the admin user's password
    const result = await client.query(
      'UPDATE public.user SET password = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, 'admin@example.com']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('❌ Admin user not found, creating one...');
      
      const { v4: uuidv4 } = require('uuid');
      await client.query(
        'INSERT INTO public.user (id, email, password, username, status, subscription_plan, content_quota, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
        [uuidv4(), 'admin@example.com', hashedPassword, 'admin', 'active', 'free', 100]
      );
      console.log('✅ Admin user created with password: password123');
    }
    
    // Verify the update
    const users = await client.query('SELECT id, email, username, status FROM public.user');
    console.log('Current users:', users.rows);
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await client.end();
  }
}

updatePassword();