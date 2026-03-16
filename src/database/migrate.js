/**
 * Auto-migration & seed script
 * Runs on app startup - checks DB state and seeds missing data.
 * Safe to run multiple times (idempotent).
 */
const fs = require('fs');
const path = require('path');

async function migrate(pool) {
  console.log('[migrate] Checking database state...');

  // Add multilanguage columns (FR, ES, IT, JA)
  const newLangs = ['fr', 'es', 'it', 'ja'];
  for (const lang of newLangs) {
    await pool.query(`ALTER TABLE monsties ADD COLUMN IF NOT EXISTS name_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE monsties ADD COLUMN IF NOT EXISTS habitat_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE monsties ADD COLUMN IF NOT EXISTS description_${lang} TEXT`);
    await pool.query(`ALTER TABLE monsters ADD COLUMN IF NOT EXISTS name_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE monsters ADD COLUMN IF NOT EXISTS habitat_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE monsters ADD COLUMN IF NOT EXISTS description_${lang} TEXT`);
    await pool.query(`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS name_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS description_${lang} TEXT`);
    await pool.query(`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS materials_${lang} JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE genes ADD COLUMN IF NOT EXISTS name_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE genes ADD COLUMN IF NOT EXISTS skill_name_${lang} VARCHAR(100)`);
    await pool.query(`ALTER TABLE genes ADD COLUMN IF NOT EXISTS description_${lang} TEXT`);
  }

  // Apply multilang seed if present and not yet applied
  const multilangSeedPath = path.join(__dirname, 'multilang_seed.sql');
  if (fs.existsSync(multilangSeedPath)) {
    const frEquipCount = (await pool.query("SELECT COUNT(*)::int AS c FROM equipment WHERE name_fr IS NOT NULL")).rows[0].c;
    if (frEquipCount < 100) {
      console.log('[migrate] Applying multilang seed...');
      const sql = fs.readFileSync(multilangSeedPath, 'utf8');
      const stmts = sql.split('\n').filter(l => l.trim().startsWith('UPDATE'));
      let updated = 0;
      for (const stmt of stmts) {
        try {
          const r = await pool.query(stmt);
          if (r.rowCount > 0) updated++;
        } catch (e) { /* skip */ }
      }
      console.log(`[migrate] Multilang seed applied: ${updated} rows`);
    } else {
      console.log(`[migrate] Multilang: ${frEquipCount} FR equipment - OK`);
    }
  }

  // Schema migrations
  await pool.query('ALTER TABLE genes ADD COLUMN IF NOT EXISTS game_id INTEGER');
  await pool.query('ALTER TABLE genes ALTER COLUMN gene_type DROP NOT NULL');
  await pool.query('ALTER TABLE genes ALTER COLUMN element DROP NOT NULL');

  // Check gene count
  const geneCount = (await pool.query('SELECT COUNT(*)::int AS c FROM genes')).rows[0].c;
  const geneSeedPath = path.join(__dirname, 'gene_seed.sql');

  if (geneCount < 300 && fs.existsSync(geneSeedPath)) {
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

  // Update gene types/elements from genedata binary v3 (94 genes mapped via GeneDef.ID enum)
  const genesWithElem = (await pool.query("SELECT COUNT(*)::int AS c FROM genes WHERE element IS NOT NULL")).rows[0].c;
  if (genesWithElem < 100) {
    console.log(`[migrate] Gene elements: only ${genesWithElem} set, applying full type/element updates...`);
    const geneUpdates = [
      [1,'speed','non_elemental'],[3,null,'non_elemental'],[5,'speed','non_elemental'],[7,'speed','non_elemental'],[9,null,'dragon'],[10,null,'non_elemental'],
      [11,null,'water'],[13,'power','dragon'],[16,'power','dragon'],[18,'speed','non_elemental'],[19,'power','ice'],[21,null,'water'],
      [23,'power','non_elemental'],[27,'power','water'],[30,'speed','non_elemental'],[31,'technical','water'],[35,'technical','non_elemental'],[39,null,'thunder'],
      [42,null,'fire'],[43,'power','non_elemental'],[46,'speed','non_elemental'],[47,'power','non_elemental'],[50,null,'fire'],[51,null,'fire'],
      [53,'technical','fire'],[55,'technical','non_elemental'],[56,null,'non_elemental'],[59,'technical','non_elemental'],[61,'speed','non_elemental'],[63,'technical','non_elemental'],
      [67,'speed','fire'],[71,'speed','fire'],[75,null,'fire'],[79,'speed','non_elemental'],[80,'power','non_elemental'],[83,null,'water'],
      [86,null,'dragon'],[87,null,'fire'],[91,'power','fire'],[95,'power','fire'],[99,'technical','non_elemental'],[102,'speed','fire'],
      [103,'technical','non_elemental'],[105,'speed','non_elemental'],[107,'technical','non_elemental'],[110,'power','non_elemental'],[111,'speed','thunder'],[114,'speed','thunder'],
      [117,'technical','non_elemental'],[120,'power','fire'],[121,'technical','non_elemental'],[125,'speed','ice'],[129,'speed','ice'],[133,'speed','ice'],
      [137,'technical','water'],[140,'speed','fire'],[141,null,'water'],[145,null,'thunder'],[149,null,'ice'],[153,'technical','fire'],
      [157,'power','non_elemental'],[161,'power','fire'],[165,null,'non_elemental'],[169,'power','non_elemental'],[173,'power','non_elemental'],[177,null,'fire'],
      [181,null,'fire'],[182,null,'ice'],[185,null,'fire'],[189,null,'fire'],[192,'speed','fire'],[195,'technical','water'],
      [199,null,'water'],[201,'technical','thunder'],[203,'speed','water'],[206,'technical','thunder'],[207,null,'water'],[211,null,'water'],
      [215,null,'thunder'],[218,null,'thunder'],[222,'power','thunder'],[233,'technical','non_elemental'],[243,null,'non_elemental'],[246,'technical','non_elemental'],
      [255,'technical','fire'],[258,'technical','non_elemental'],[260,'technical','fire'],[265,'technical','non_elemental'],[267,'power','non_elemental'],[270,null,'thunder'],
      [272,null,'non_elemental'],[277,'power','non_elemental'],[297,'technical','fire'],[301,null,'non_elemental'],
    ];
    let updated = 0;
    for (const [gameId, geneType, element] of geneUpdates) {
      try {
        const r = await pool.query('UPDATE genes SET gene_type = $1, element = $2 WHERE game_id = $3', [geneType, element, gameId]);
        if (r.rowCount > 0) updated++;
      } catch (e) { /* skip */ }
    }
    console.log(`[migrate] Gene types/elements updated: ${updated}`);
  } else {
    console.log(`[migrate] Gene elements: ${genesWithElem} set - OK`);
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

  // Check equipment sort_id (needed for upgrade data matching)
  const equipWithSortId = (await pool.query("SELECT COUNT(*)::int AS c FROM equipment WHERE stats ? 'sort_id'")).rows[0].c;
  if (equipWithSortId < 200) {
    console.log(`[migrate] Equipment sort_id: only ${equipWithSortId} have sort_id, applying from equipSortIds...`);
    const sortIdPath = path.join(__dirname, 'equip_sort_ids.sql');
    if (fs.existsSync(sortIdPath)) {
      const sql = fs.readFileSync(sortIdPath, 'utf8');
      const stmts = sql.split('\n').filter(l => l.startsWith('UPDATE'));
      let updated = 0;
      for (const stmt of stmts) {
        try { const r = await pool.query(stmt); if (r.rowCount > 0) updated++; } catch (e) { /* skip */ }
      }
      console.log(`[migrate] Equipment sort_ids applied: ${updated}`);
    }
  } else {
    console.log(`[migrate] Equipment sort_id: ${equipWithSortId} - OK`);
  }

  // Check equipment upgrade data (per-level stats)
  const equipWithLevels = (await pool.query("SELECT COUNT(*)::int AS c FROM equipment WHERE stats ? 'levels'")).rows[0].c;
  if (equipWithLevels < 200) {
    console.log(`[migrate] Equipment upgrade data: only ${equipWithLevels} have levels, applying...`);
    const upgradeSeedPath = path.join(__dirname, 'upgrade_seed.sql');
    if (fs.existsSync(upgradeSeedPath)) {
      const sql = fs.readFileSync(upgradeSeedPath, 'utf8');
      const stmts = sql.split('\n').filter(l => l.startsWith('UPDATE'));
      let updated = 0;
      for (const stmt of stmts) {
        try { const r = await pool.query(stmt); if (r.rowCount > 0) updated++; } catch (e) { /* skip */ }
      }
      console.log(`[migrate] Equipment upgrade data applied: ${updated}`);
    } else {
      console.log('[migrate] upgrade_seed.sql not found, skipping');
    }
  } else {
    console.log(`[migrate] Equipment upgrade data: ${equipWithLevels} - OK`);
  }

  console.log('[migrate] Done.');
}

module.exports = migrate;
