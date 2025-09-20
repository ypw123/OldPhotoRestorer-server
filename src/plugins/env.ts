import fp from 'fastify-plugin';
import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  HOST: string;
  CORS_ORIGIN?: string;
  DASHSCOPE_API_KEY?: string;
}

async function envPlugin(app: FastifyInstance) {
  const PORT = Number(process.env.PORT) || 4000;
  const HOST = process.env.HOST || '0.0.0.0';
  const CORS_ORIGIN = process.env.CORS_ORIGIN;
  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  
  if (!DASHSCOPE_API_KEY) {
    app.log.warn('DASHSCOPE_API_KEY not found in environment variables');
  }
  
  app.decorate('config', { PORT, HOST, CORS_ORIGIN, DASHSCOPE_API_KEY } as EnvConfig);
}

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
  }
}

export default fp(envPlugin, { name: 'env' });
