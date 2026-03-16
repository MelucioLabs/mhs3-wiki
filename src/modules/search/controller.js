const { query } = require('../../database/connection');

const TS_CONFIGS = { de: 'german', en: 'english', fr: 'french', it: 'italian', es: 'spanish', ja: 'simple' };

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters.' });
    }

    const lang = req.lang;
    const tsConfig = TS_CONFIGS[lang] || 'simple';
    const tsQuery = q.trim().split(/\s+/).join(' & ');

    // For new languages, fall back to English content for FTS where lang data is missing
    const nameFts = `COALESCE(name_${lang}, name_en)`;
    const descFts = `COALESCE(description_${lang}, description_en, '')`;

    const [monsties, monsters, equip] = await Promise.all([
      query(
        `SELECT id, COALESCE(name_${lang}, name_en) AS name, 'monstie' AS category, element,
         ts_rank(to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}), to_tsquery($1::regconfig, $2)) AS rank
         FROM monsties
         WHERE to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}) @@ to_tsquery($1::regconfig, $2)
         ORDER BY rank DESC LIMIT 10`,
        [tsConfig, tsQuery]
      ),
      query(
        `SELECT id, COALESCE(name_${lang}, name_en) AS name, 'monster' AS category, weakness,
         ts_rank(to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}), to_tsquery($1::regconfig, $2)) AS rank
         FROM monsters
         WHERE to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}) @@ to_tsquery($1::regconfig, $2)
         ORDER BY rank DESC LIMIT 10`,
        [tsConfig, tsQuery]
      ),
      query(
        `SELECT id, COALESCE(name_${lang}, name_en) AS name, 'equipment' AS category, type,
         ts_rank(to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}), to_tsquery($1::regconfig, $2)) AS rank
         FROM equipment
         WHERE to_tsvector($1::regconfig, ${nameFts} || ' ' || ${descFts}) @@ to_tsquery($1::regconfig, $2)
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
