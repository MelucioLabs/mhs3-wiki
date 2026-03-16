const { query } = require('../../database/connection');

async function getAll(req, res) {
  try {
    const { type, rarity, element } = req.query;
    const lang = req.lang;

    let sql = `SELECT id, COALESCE(name_${lang}, name_en) AS name, type, rarity, stats, COALESCE(materials_${lang}, materials_en) AS materials,
               COALESCE(description_${lang}, description_en) AS description, created_at FROM equipment WHERE 1=1`;
    const params = [];

    if (type) {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }
    if (rarity) {
      params.push(parseInt(rarity, 10));
      sql += ` AND rarity = $${params.length}`;
    }
    if (element) {
      if (element === 'non_elemental') {
        sql += ` AND (stats->>'element' IS NULL OR stats->>'element' = '')`;
      } else {
        params.push(element);
        sql += ` AND stats->>'element' = $${params.length}`;
      }
    }

    sql += ` ORDER BY name_en`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('equipment.getAll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getById(req, res) {
  try {
    const lang = req.lang;
    const result = await query(
      `SELECT id, COALESCE(name_${lang}, name_en) AS name, type, rarity, stats, COALESCE(materials_${lang}, materials_en) AS materials,
       COALESCE(description_${lang}, description_en) AS description, created_at FROM equipment WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('equipment.getById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFilters(req, res) {
  try {
    const types = await query('SELECT DISTINCT type FROM equipment ORDER BY type');
    const rarities = await query('SELECT DISTINCT rarity FROM equipment ORDER BY rarity');
    const elements = await query(
      `SELECT DISTINCT stats->>'element' AS element FROM equipment
       WHERE stats->>'element' IS NOT NULL AND stats->>'element' != ''
       ORDER BY element`
    );
    res.json({
      types: types.rows.map((r) => r.type),
      rarities: rarities.rows.map((r) => r.rarity),
      elements: ['non_elemental', ...elements.rows.map((r) => r.element)],
    });
  } catch (err) {
    console.error('equipment.getFilters error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAll, getById, getFilters };
