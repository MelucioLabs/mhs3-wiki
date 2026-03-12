const SUPPORTED_LANGS = ['de', 'en'];
const DEFAULT_LANG = 'de';

function i18nMiddleware(req, res, next) {
  const langParam = req.query.lang || req.headers['accept-language']?.substring(0, 2);
  req.lang = SUPPORTED_LANGS.includes(langParam) ? langParam : DEFAULT_LANG;
  next();
}

module.exports = { i18nMiddleware, SUPPORTED_LANGS, DEFAULT_LANG };
