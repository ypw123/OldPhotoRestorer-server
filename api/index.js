let app;
async function getApp() {
  if (!app) {
    // 调试：确认 dist 是否存在
    try {
      const fs = require('fs');
      const path = require('path');
      const distPath = path.join(__dirname, '..', 'dist', 'server.js');
      if (!fs.existsSync(distPath)) {
        console.error('[api] dist/server.js not found at runtime:', distPath);
        throw new Error('dist/server.js missing in serverless bundle');
      }
      console.log('[api] dist/server.js exists, importing...');
    } catch (fsErr) {
      console.error('[api] pre-import check failed:', fsErr);
      throw fsErr;
    }

    const mod = await import('../dist/server.js').catch(e => {
      console.error('[api] dynamic import failed:', e);
      throw e;
    });
    console.log('[api] module keys:', Object.keys(mod));
    const buildServer = mod.buildServer || mod.default?.buildServer || mod.default;
    if (typeof buildServer !== 'function') {
      console.error('[api] buildServer not a function. mod =', mod);
      throw new Error('buildServer export not found');
    }
    app = await buildServer();
    await app.ready();
    console.log('[api] fastify app ready');
  }
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