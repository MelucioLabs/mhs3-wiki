const { query } = require('../../database/connection');

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters.' });
    }

    const lang = req.lang;
    const tsConfig = lang === 'de' ? 'german' : 'english';
    const tsQuery = q.trim().split(/\s+/).join(' & ');

    const [monsties, monsters, equip] = await Promise.all([
      query(
        `SELECT id, name_${lang} AS name, 'monstie' AS category, element,
         ts_rank(to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')), to_tsquery($1::regconfig, $2)) AS rank
         FROM monsties
         WHERE to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')) @@ to_tsquery($1::regconfig, $2)
         ORDER BY rank DESC LIMIT 10`,
        [tsConfig, tsQuery]
      ),
      query(
        `SELECT id, name_${lang} AS name, 'monster' AS category, weakness,
         ts_rank(to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')), to_tsquery($1::regconfig, $2)) AS rank
         FROM monsters
         WHERE to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')) @@ to_tsquery($1::regconfig, $2)
         ORDER BY rank DESC LIMIT 10`,
        [tsConfig, tsQuery]
      ),
      query(
        `SELECT id, name_${lang} AS name, 'equipment' AS category, type,
         ts_rank(to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')), to_tsquery($1::regconfig, $2)) AS rank
         FROM equipment
         WHERE to_tsvector($1::regconfig, name_${lang} || ' ' || COALESCE(description_${lang}, '')) @@ to_tsquery($1::regconfig, $2)
         ORDER BY rank DESC LIMIT 10`,
        [tsConfig, tsQuery]
      ),
    ]);

    const results = [...monsties.rows, ...monsters.rows, ...equip.rows].sort(
      (a, b) => b.rank - a.rank
    );

    res.json({ query: q, total: results.length, results });
  } catch (err) {
    console.error('search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
}

module.exports = { search };
