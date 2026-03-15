/**
 * Auto-migration & seed script
 * Runs on app startup - checks DB state and seeds missing data.
 * Safe to run multiple times (idempotent).
 */
const fs = require('fs');
const path = require('path');

async function migrate(pool) {
  console.log('[migrate] Checking database state...');

  // Schema migrations
  await pool.query('ALTER TABLE genes ADD COLUMN IF NOT EXISTS game_id INTEGER');
  await pool.query('ALTER TABLE genes ALTER COLUMN gene_type DROP NOT NULL');
  await pool.query('ALTER TABLE genes ALTER COLUMN element DROP NOT NULL');

  // Check gene count
  const geneCount = (await pool.query('SELECT COUNT(*)::int AS c FROM genes')).rows[0].c;
  const geneSeedPath = path.join(__dirname, 'gene_seed.sql');

  if (geneCount < 100 && fs.existsSync(geneSeedPath)) {
    console.log(`[migrate] Genes: ${geneCount} found, seeding from gene_seed.sql...`);
    await pool.query('TRUNCATE TABLE genes RESTART IDENTITY');
    const sql = fs.readFileSync(geneSeedPath, 'utf8');
    const stmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && s.toUpperCase().startsWith('INSERT'));
    for (const stmt of stmts) {
      await pool.query(stmt);
    }
    const newCount = (await pool.query('SELECT COUNT(*)::int AS c FROM genes')).rows[0].c;
    console.log(`[migrate] Genes seeded: ${newCount}`);
  } else {
    console.log(`[migrate] Genes: ${geneCount} - OK`);
  }

  // Check equipment count
  const equipCount = (await pool.query('SELECT COUNT(*)::int AS c FROM equipment')).rows[0].c;
  const equipSeedPath = path.join(__dirname, 'equipment_seed.sql');

  if (equipCount < 100 && fs.existsSync(equipSeedPath)) {
    console.log(`[migrate] Equipment: ${equipCount} found, seeding from equipment_seed.sql...`);
    await pool.query('TRUNCATE TABLE equipment RESTART IDENTITY');
    const sql = fs.readFileSync(equipSeedPath, 'utf8');
    // Use regex to handle escaped single quotes in INSERT statements
    const stmts = sql.match(/INSERT[^;]*(?:''[^;]*)*;/gi) || [];
    let seeded = 0;
    for (const stmt of stmts) {
      try {
        await pool.query(stmt);
        seeded++;
      } catch (e) {
        console.warn(`[migrate] Equipment insert failed: ${e.message.substring(0, 80)}`);
      }
    }
    const newCount = (await pool.query('SELECT COUNT(*)::int AS c FROM equipment')).rows[0].c;
    console.log(`[migrate] Equipment seeded: ${newCount} (${seeded} statements)`);
  } else {
    console.log(`[migrate] Equipment: ${equipCount} - OK`);
  }

  console.log('[migrate] Done.');
}

module.exports = migrate;
