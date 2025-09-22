import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import envPlugin from './plugins/env.js';
import corsPlugin from './plugins/cors.js';
import healthRoute from './routes/health.js';
import restoreRoute from './routes/restore.js';

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(sensible);
  await app.register(envPlugin);
  await app.register(corsPlugin);

  await app.register(healthRoute);
  await app.register(restoreRoute);

  return app;
}

// 本地开发启动（在直接运行 node dist/server.js 时）
if (require.main === module) {
  (async () => {
    console.log('[bootstrap] building server (standalone)...');
    const app = await buildServer();
    const { PORT, HOST } = app.config;
    try {
      await app.listen({ port: PORT, host: HOST });
      app.log.info(`Server listening on http://${HOST}:${PORT}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  })();
}

export { buildServer };
