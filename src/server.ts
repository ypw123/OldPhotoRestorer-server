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

async function start() {
  console.log('[bootstrap] building server...');
  const app = await buildServer();
  const { PORT, HOST } = app.config;
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// 直接启动（打包后 Windows 路径差异会导致条件判断失败）
start();

export { buildServer };
