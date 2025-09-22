const { buildServer } = require('../dist/server.js');

let app;

module.exports = async function handler(req, res) {
  try {
    if (!app) {
      app = await buildServer();
      await app.ready();
    }
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