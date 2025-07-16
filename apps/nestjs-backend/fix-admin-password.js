const bcrypt = require('bcrypt');
require('dotenv/config');

// Simple script to generate correct bcrypt hash
async function generateHash() {
  const password = 'password123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Correct bcrypt hash for "password123":', hash);
  return hash;
}

generateHash();