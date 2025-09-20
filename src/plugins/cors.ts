import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

async function corsPlugin(app: FastifyInstance) {
  const origin = app.config.CORS_ORIGIN || true;
  await app.register(cors, { origin, credentials: true });
}

export default fp(corsPlugin, { name: 'cors' });
