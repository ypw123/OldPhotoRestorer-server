const { buildServer } = await import('../dist/server.js');

let app;

export default async function handler(req, res) {
  try {
    if (!app) {
      app = await buildServer();
      await app.ready();
    }
    
    // 使用 Fastify 的 inject 方法处理请求
    const response = await app.inject({
      method: req.method,
      url: req.url,
      query: req.query,
      payload: req.body,
      headers: req.headers,
    });

    // 设置响应头
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    // 设置状态码并发送响应
    res.status(response.statusCode).send(response.payload);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}