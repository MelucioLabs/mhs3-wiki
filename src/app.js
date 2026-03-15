const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const { pool, checkConnection, shutdown } = require('./database/connection');
const migrate = require('./database/migrate');

const monstiesRouter = require('./modules/monsties/router');
const bestiaryRouter = require('./modules/bestiary/router');
const equipmentRouter = require('./modules/equipment/router');
const i18nRouter = require('./modules/i18n/router');
const searchRouter = require('./modules/search/router');
const seoRouter = require('./modules/seo/routes');
const { i18nMiddleware } = require('./modules/i18n/middleware');

const fs = require('fs');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Read index.html template once for deep-link SSR
const indexTemplate = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

function buildDeepLinkHTML({ title, description, url }) {
  const esc = (s) => s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return indexTemplate
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(url)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(url)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
}

// Middleware
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);

// Static files with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// Map images (mounted volume, not in git)
app.use('/maps', express.static(path.join(__dirname, '..', 'maps'), {
  maxAge: '7d',
  etag: true,
}));

// SEO Routes (sitemap.xml is handled at root level)
app.use('/', seoRouter);

// API Routes
app.use('/api/monsties', monstiesRouter);
app.use('/api/bestiary', bestiaryRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/search', searchRouter);

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    await checkConnection();
    res.json({ status: 'ok', version: process.env.BUILD_VERSION || 'dev', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// Deep-link SSR: Inject dynamic meta tags for crawlers (SEO + social sharing)
app.get('/monstie/:slug', async (req, res) => {
  const idMatch = req.params.slug.match(/-(\d+)$/);
  if (idMatch) {
    try {
      const result = await pool.query('SELECT name_de, name_en, element, attack_type, habitat_de, habitat_en FROM monsties WHERE id = $1', [idMatch[1]]);
      if (result.rows.length) {
        const m = result.rows[0];
        return res.send(buildDeepLinkHTML({
          title: `${m.name_de} (${m.name_en}) | MHS3 Wiki`,
          description: `${m.name_de} — Element: ${m.element || '-'}, Typ: ${m.attack_type || '-'}, Habitat: ${m.habitat_de || '-'}. Monstie-Daten im MHS3 Wiki.`,
          url: `https://mhs3.meluciolabs.de${req.originalUrl}`,
        }));
      }
    } catch (e) { console.error('Deep-link monstie error:', e); }
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/monster/:slug', async (req, res) => {
  const idMatch = req.params.slug.match(/-(\d+)$/);
  if (idMatch) {
    try {
      const result = await pool.query('SELECT name_de, name_en, species_de, species_en, weakness, habitat_de, habitat_en FROM monsters WHERE id = $1', [idMatch[1]]);
      if (result.rows.length) {
        const m = result.rows[0];
        return res.send(buildDeepLinkHTML({
          title: `${m.name_de} (${m.name_en}) | MHS3 Wiki`,
          description: `${m.name_de} — Spezies: ${m.species_de || '-'}, Schwäche: ${m.weakness || '-'}, Habitat: ${m.habitat_de || '-'}. Bestiarum-Eintrag im MHS3 Wiki.`,
          url: `https://mhs3.meluciolabs.de${req.originalUrl}`,
        }));
      }
    } catch (e) { console.error('Deep-link monster error:', e); }
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/equipment/:slug', async (req, res) => {
  const idMatch = req.params.slug.match(/-(\d+)$/);
  if (idMatch) {
    try {
      const result = await pool.query("SELECT name_de, name_en, type, stats->>'element' AS element FROM equipment WHERE id = $1", [idMatch[1]]);
      if (result.rows.length) {
        const e = result.rows[0];
        return res.send(buildDeepLinkHTML({
          title: `${e.name_de} (${e.name_en}) | MHS3 Wiki`,
          description: `${e.name_de} — Typ: ${e.type || '-'}${e.element ? ', Element: ' + e.element : ''}. Ausrüstungsdaten im MHS3 Wiki.`,
          url: `https://mhs3.meluciolabs.de${req.originalUrl}`,
        }));
      }
    } catch (e2) { console.error('Deep-link equipment error:', e2); }
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
  try {
    await checkConnection();
    console.log('Database connected.');
    await migrate(pool);
  } catch (err) {
    console.error('Database connection failed, retrying in 3s...', err.message);
    await new Promise((r) => setTimeout(r, 3000));
    return start();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MHS3 Wiki running on http://0.0.0.0:${PORT}`);
  });
}

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  shutdown().then(() => process.exit(0));
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();
