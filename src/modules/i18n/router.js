const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();
const localesDir = path.join(__dirname, '../../locales');

router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  if (!['de', 'en', 'fr', 'es', 'it', 'ja'].includes(lang)) {
    return res.status(400).json({ error: 'Unsupported language.' });
  }

  const filePath = path.join(localesDir, `${lang}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch (err) {
    console.error('i18n load error:', err);
    res.status(500).json({ error: 'Could not load language file' });
  }
});

module.exports = router;
