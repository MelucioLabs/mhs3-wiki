const express = require('express');
const router = express.Router();
const { query } = require('../../database/connection');

const BASE_URL = 'https://mhs3.meluciolabs.de';

// Sitemap.xml - dynamic, includes all monsties and monsters
router.get('/sitemap.xml', async (req, res) => {
  try {
    const [monsties, monsters, equipment] = await Promise.all([
      query('SELECT id, name_en FROM monsties ORDER BY id'),
      query('SELECT id, name_en FROM monsters ORDER BY id'),
      query('SELECT id, name_en FROM equipment ORDER BY id'),
    ]);

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/monsties</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/monsties?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/monsties?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/bestiary</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/bestiary?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/bestiary?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/equipment</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/equipment?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/equipment?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/gene-calc</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/gene-calc?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/gene-calc?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/map</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE_URL}/map?lang=de"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/map?lang=en"/>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

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
