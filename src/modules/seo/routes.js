const express = require('express');
const router = express.Router();
const { query } = require('../../database/connection');

const BASE_URL = 'https://mhs3.meluciolabs.de';
const SUPPORTED_LANGS = ['de', 'en', 'fr', 'es', 'it', 'ja'];

function hreflangLinks(path) {
  return SUPPORTED_LANGS.map(lang =>
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=${lang}"/>`
  ).join('\n');
}

// Sitemap.xml - dynamic, includes all monsties and monsters
router.get('/sitemap.xml', async (req, res) => {
  try {
    const [monsties, monsters, equipment] = await Promise.all([
      query('SELECT id, name_en FROM monsties ORDER BY id'),
      query('SELECT id, name_en FROM monsters ORDER BY id'),
      query('SELECT id, name_en FROM equipment ORDER BY id'),
    ]);

    const today = new Date().toISOString().split('T')[0];

    const mainPages = [
      { path: '/', freq: 'daily', priority: '1.0' },
      { path: '/monsties', freq: 'weekly', priority: '0.9' },
      { path: '/bestiary', freq: 'weekly', priority: '0.9' },
      { path: '/equipment', freq: 'weekly', priority: '0.8' },
      { path: '/gene-calc', freq: 'monthly', priority: '0.8' },
      { path: '/map', freq: 'weekly', priority: '0.9' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main Pages -->`;

    for (const page of mainPages) {
      xml += `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
${hreflangLinks(page.path)}
    <lastmod>${today}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Add individual monstie pages
    for (const m of monsties.rows) {
      const slug = m.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      xml += `
  <url>
    <loc>${BASE_URL}/monstie/${slug}-${m.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Add individual monster pages
    for (const m of monsters.rows) {
      const slug = m.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      xml += `
  <url>
    <loc>${BASE_URL}/monster/${slug}-${m.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Add individual equipment pages
    for (const e of equipment.rows) {
      const slug = e.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      xml += `
  <url>
    <loc>${BASE_URL}/equipment/${slug}-${e.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Sitemap generation failed');
  }
});

module.exports = router;
