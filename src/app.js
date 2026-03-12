const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const { checkConnection, shutdown } = require('./database/connection');

const monstiesRouter = require('./modules/monsties/router');
const bestiaryRouter = require('./modules/bestiary/router');
const equipmentRouter = require('./modules/equipment/router');
const i18nRouter = require('./modules/i18n/router');
const searchRouter = require('./modules/search/router');
const { i18nMiddleware } = require('./modules/i18n/middleware');

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Middleware
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(i18nMiddleware);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
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
