let app;
async function getApp() {
  if (!app) {
    const mod = await import('../dist/server.js');
    const buildServer = mod.buildServer || mod.default?.buildServer || mod.default;
    app = await buildServer();
    await app.ready();
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
    res.status(500).json({ error: 'Internal server error' });
  }
};