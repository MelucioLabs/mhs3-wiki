const { query } = require('../../database/connection');

async function getAll(req, res) {
  try {
    const { weakness, habitat, species } = req.query;
    const lang = req.lang;

    let sql = `SELECT id, name_${lang} AS name, species, weakness, habitat_${lang} AS habitat,
               description_${lang} AS description, image_url, created_at FROM monsters WHERE 1=1`;
    const params = [];

    if (weakness) {
      params.push(weakness);
      sql += ` AND weakness = $${params.length}`;
    }
    if (habitat) {
      params.push(habitat);
      sql += ` AND habitat_${lang} = $${params.length}`;
    }
    if (species) {
      params.push(species);
      sql += ` AND species = $${params.length}`;
    }

    sql += ' ORDER BY name_en';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('bestiary.getAll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getById(req, res) {
  try {
    const lang = req.lang;
    const result = await query(
      `SELECT id, name_${lang} AS name, species, weakness, habitat_${lang} AS habitat,
       description_${lang} AS description, image_url, created_at FROM monsters WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Monster not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('bestiary.getById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFilters(req, res) {
  try {
    const lang = req.lang;
    const weaknesses = await query('SELECT DISTINCT weakness FROM monsters WHERE weakness IS NOT NULL ORDER BY weakness');
    const habitats = await query(`SELECT DISTINCT habitat_${lang} AS habitat FROM monsters WHERE habitat_${lang} IS NOT NULL ORDER BY habitat_${lang}`);
    const species = await query('SELECT DISTINCT species FROM monsters WHERE species IS NOT NULL ORDER BY species');
    res.json({
      weaknesses: weaknesses.rows.map((r) => r.weakness),
      habitats: habitats.rows.map((r) => r.habitat),
      species: species.rows.map((r) => r.species),
    });
  } catch (err) {
    console.error('bestiary.getFilters error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAll, getById, getFilters };
