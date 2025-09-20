import { FastifyInstance } from 'fastify';

export default async function healthRoute(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok', time: new Date().toISOString() };
  });
}
