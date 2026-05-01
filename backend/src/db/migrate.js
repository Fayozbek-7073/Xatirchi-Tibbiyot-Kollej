'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedDefaultUsers() {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

  const defaults = [
    { username: 'admin',    password: 'Admin@2025',    role: 'admin' },
    { username: 'direktor', password: 'Direktor@2025', role: 'director' },
  ];

  for (const u of defaults) {
    const hash = await bcrypt.hash(u.password, rounds);
    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.role]
    );
  }

  console.log('Default users seeded: admin / direktor');
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`  Done: ${file}`);
  }

  await seedDefaultUsers();

  await pool.end();
  console.log('All migrations complete.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
