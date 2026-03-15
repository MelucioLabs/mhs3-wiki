const { query } = require('../../database/connection');

async function getAll(req, res) {
  try {
    const { element, attack_type, ride_action } = req.query;
    const lang = req.lang;

    let sql = `SELECT id, name_${lang} AS name, element, attack_type, ride_action,
               habitat_${lang} AS habitat, description_${lang} AS description, image_url, created_at FROM monsties WHERE 1=1`;
    const params = [];

    if (element) {
      params.push(element);
      sql += ` AND element = $${params.length}`;
    }
    if (attack_type) {
      params.push(attack_type);
      sql += ` AND attack_type = $${params.length}`;
    }
    if (ride_action) {
      params.push(ride_action);
      sql += ` AND ride_action = $${params.length}`;
    }

    sql += ' ORDER BY name_en';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('monsties.getAll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getById(req, res) {
  try {
    const lang = req.lang;
    const result = await query(
      `SELECT id, name_${lang} AS name, element, attack_type, ride_action,
       habitat_${lang} AS habitat, description_${lang} AS description, image_url, created_at FROM monsties WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Monstie not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('monsties.getById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getGenes(req, res) {
  try {
    const lang = req.lang;
    const { gene_type, element } = req.query;

    let sql = `SELECT id, game_id, name_${lang} AS name, gene_type, element,
               skill_name_${lang} AS skill_name, description_${lang} AS description FROM genes WHERE 1=1`;
    const params = [];

    if (gene_type) {
      params.push(gene_type);
      sql += ` AND gene_type = $${params.length}`;
    }
    if (element) {
      params.push(element);
      sql += ` AND element = $${params.length}`;
    }

    sql += ` ORDER BY name_${lang}`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('monsties.getGenes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFilters(req, res) {
  try {
    const elements = await query('SELECT DISTINCT element FROM monsties WHERE element IS NOT NULL ORDER BY element');
    const attackTypes = await query('SELECT DISTINCT attack_type FROM monsties WHERE attack_type IS NOT NULL ORDER BY attack_type');
    const rideActions = await query('SELECT DISTINCT ride_action FROM monsties WHERE ride_action IS NOT NULL ORDER BY ride_action');
    res.json({
      elements: elements.rows.map((r) => r.element),
      attack_types: attackTypes.rows.map((r) => r.attack_type),
      ride_actions: rideActions.rows.map((r) => r.ride_action),
    });
  } catch (err) {
    console.error('monsties.getFilters error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAll, getById, getGenes, getFilters };
