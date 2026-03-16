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

  // Update gene types/elements from genedata binary (all 115 genes)
  const genesWithElem = (await pool.query("SELECT COUNT(*)::int AS c FROM genes WHERE element IS NOT NULL")).rows[0].c;
  if (genesWithElem < 100) {
    console.log(`[migrate] Gene elements: only ${genesWithElem} set, applying full type/element updates...`);
    const geneUpdates = [
      [2,null,'fire'],[3,'technical','fire'],[4,'speed','non_elemental'],[5,null,'fire'],
      [6,'speed','non_elemental'],[7,null,'water'],[9,'speed','fire'],[10,'speed','non_elemental'],
      [11,'power','non_elemental'],[12,'power','fire'],[13,null,'non_elemental'],[14,'speed','fire'],
      [17,'speed','fire'],[18,null,'non_elemental'],[22,'technical','thunder'],[23,null,'ice'],
      [24,'technical','thunder'],[25,'technical','thunder'],[27,'power','fire'],
      [28,'power','non_elemental'],[29,'technical','non_elemental'],[30,null,'non_elemental'],
      [40,'technical','non_elemental'],[41,'technical','fire'],[42,'technical','non_elemental'],
      [43,'technical','fire'],[44,'speed','non_elemental'],[45,'power','non_elemental'],
      [46,null,'thunder'],[47,null,'non_elemental'],[48,'power','non_elemental'],
      [49,'power','non_elemental'],[50,'speed','non_elemental'],[51,'speed','non_elemental'],
      [52,null,'water'],[53,'speed','non_elemental'],[54,null,'water'],[61,null,'non_elemental'],
      [62,'speed','non_elemental'],[63,null,'dragon'],[76,null,'thunder'],[80,null,'dragon'],
      [102,'technical','ice'],[104,null,'dragon'],[105,'power','dragon'],[106,'power','dragon'],
      [110,'power','non_elemental'],[118,'power','water'],[119,'technical','water'],
      [120,'technical','non_elemental'],[125,null,'thunder'],[136,'power','non_elemental'],
      [137,'power','non_elemental'],[138,null,'fire'],[139,'technical','non_elemental'],
      [140,'technical','non_elemental'],[141,'technical','non_elemental'],[148,'speed','fire'],
      [149,'speed','fire'],[150,null,'fire'],[174,'speed','fire'],[182,null,'water'],
      [199,null,'fire'],[200,'power','fire'],[201,'power','fire'],[204,'technical','non_elemental'],
      [205,'technical','non_elemental'],[206,'technical','non_elemental'],[213,'speed','thunder'],
      [214,'speed','thunder'],[215,'technical','non_elemental'],[216,'technical','non_elemental'],
      [217,'speed','ice'],[218,'speed','ice'],[219,'speed','ice'],[232,'technical','water'],
      [233,null,'water'],[234,null,'thunder'],[238,null,'ice'],[243,'technical','fire'],
      [244,'power','non_elemental'],[245,'power','fire'],[246,null,'non_elemental'],
      [247,'power','non_elemental'],[248,'power','non_elemental'],[255,null,'fire'],
      [256,null,'fire'],[257,null,'fire'],[258,null,'fire'],[259,'technical','water'],
      [260,null,'water'],[261,'speed','water'],[262,null,'water'],[263,null,'thunder'],
      [264,null,'thunder'],[265,'power','thunder'],[266,'technical','thunder'],
      [267,'speed','ice'],[268,null,'ice'],[269,null,'ice'],[270,'power','ice'],
      [271,null,'dragon'],[272,'technical','dragon'],[273,'power','dragon'],[274,null,'dragon'],
      [275,null,'non_elemental'],[276,null,'non_elemental'],[277,null,'non_elemental'],
      [278,null,'non_elemental'],[282,'speed','non_elemental'],[292,'power','ice'],
      [295,null,'ice'],[297,'technical','non_elemental'],[298,'speed','non_elemental'],
      [301,'technical','fire'],
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
