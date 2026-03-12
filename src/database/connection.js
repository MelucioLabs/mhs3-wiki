const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'mhs3_user',
  password: process.env.DB_PASSWORD || 'changeme123',
  database: process.env.DB_NAME || 'mhs3_wiki',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

async function checkConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

async function shutdown() {
  await pool.end();
  console.log('Database pool closed.');
}

module.exports = { pool, query, checkConnection, shutdown };
