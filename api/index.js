const fs = require('fs');
const path = require('path');
let app;
async function getApp() {
  if (app) return app;
  const distPath = path.join(__dirname, '..', 'dist', 'server.js');
  if (!fs.existsSync(distPath)) {
    console.error('[api] dist/server.js not found at runtime:', distPath);
    throw new Error('dist/server.js missing in serverless bundle');
  }
  console.log('[api] requiring dist/server.js');
  const mod = require('../dist/server.js');
  const buildServer = mod.buildServer || (typeof mod === 'function' ? mod : mod.default);
  if (typeof buildServer !== 'function') {
    console.error('[api] buildServer export not found. keys=', Object.keys(mod));
    throw new Error('buildServer export not found');
  }
  app = await buildServer();
  await app.ready();
  console.log('[api] fastify app ready');
  return app;
}

module.exports = async function handler(req, res) {
  try {
    const fastify = await getApp();
    const response = await app.inject({
      method: req.method,
      url: req.url,
      query: req.query,
      payload: req.body,
      headers: req.headers,
    });
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });
    res.status(response.statusCode).send(response.payload);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
};