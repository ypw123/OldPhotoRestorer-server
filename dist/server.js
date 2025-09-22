"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const fastify_1 = __importDefault(require("fastify"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const env_js_1 = __importDefault(require("./plugins/env.js"));
const cors_js_1 = __importDefault(require("./plugins/cors.js"));
const health_js_1 = __importDefault(require("./routes/health.js"));
const restore_js_1 = __importDefault(require("./routes/restore.js"));
async function buildServer() {
    const app = (0, fastify_1.default)({ logger: true });
    await app.register(sensible_1.default);
    await app.register(env_js_1.default);
    await app.register(cors_js_1.default);
    await app.register(health_js_1.default);
    await app.register(restore_js_1.default);
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
        }
        catch (err) {
            app.log.error(err);
            process.exit(1);
        }
    })();
}
