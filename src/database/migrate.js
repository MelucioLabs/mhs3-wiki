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

  // Update gene types/elements from genedata (if not already set)
  const genesWithType = (await pool.query('SELECT COUNT(*)::int AS c FROM genes WHERE gene_type IS NOT NULL')).rows[0].c;
  if (genesWithType < 30) {
    console.log(`[migrate] Gene types: only ${genesWithType} set, applying type/element updates...`);
    const geneUpdates = [
      [3,'technical','fire'],[4,'speed','non_elemental'],[9,'speed','fire'],[10,'speed','non_elemental'],
      [11,'power','non_elemental'],[12,'power','fire'],[14,'speed','fire'],[23,null,'ice'],
      [24,'technical','thunder'],[27,'power','fire'],[30,null,'non_elemental'],[40,'technical','non_elemental'],
      [41,'technical','fire'],[42,'technical','non_elemental'],[46,null,'thunder'],[47,null,'non_elemental'],
      [49,'power','non_elemental'],[50,'speed','non_elemental'],[51,'speed','non_elemental'],
      [52,null,'water'],[53,'speed','non_elemental'],[54,null,'water'],[61,null,'non_elemental'],
      [62,'speed','non_elemental'],[76,null,'thunder'],[102,'technical','ice'],[105,'power','dragon'],
      [106,'power','dragon'],[119,'technical','water'],[136,'power','non_elemental'],
      [137,'power','non_elemental'],[139,'technical','non_elemental'],[140,'technical','non_elemental'],
      [174,'speed','fire'],[199,null,'fire'],[200,'power','fire'],[213,'speed','thunder'],
      [216,'technical','non_elemental'],[218,'speed','ice'],[238,null,'ice'],[243,'technical','fire'],
      [244,'power','non_elemental'],[245,'power','fire'],[246,null,'non_elemental'],
      [255,null,'fire'],[256,null,'fire'],[260,null,'water'],[265,'power','thunder'],
      [268,null,'ice'],[272,'technical','dragon'],[274,null,'dragon'],[275,null,'non_elemental'],
      [277,null,'non_elemental'],[278,null,'non_elemental'],[282,'speed','non_elemental'],
      [292,'power','ice'],[295,null,'ice'],[297,'technical','non_elemental'],
      [298,'speed','non_elemental'],[301,'technical','fire'],
    ];
    let updated = 0;
    for (const [gameId, geneType, element] of geneUpdates) {
      try {
        const r = await pool.query('UPDATE genes SET gene_type = $1, element = $2 WHERE game_id = $3', [geneType, element, gameId]);
        if (r.rowCount > 0) updated++;
      } catch (e) { /* skip */ }
    }
    console.log(`[migrate] Gene types updated: ${updated}`);
  } else {
    console.log(`[migrate] Gene types: ${genesWithType} set - OK`);
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
