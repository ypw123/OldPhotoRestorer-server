"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function envPlugin(app) {
    const PORT = Number(process.env.PORT) || 4000;
    const HOST = process.env.HOST || '0.0.0.0';
    const CORS_ORIGIN = process.env.CORS_ORIGIN;
    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        app.log.warn('DASHSCOPE_API_KEY not found in environment variables');
    }
    app.decorate('config', { PORT, HOST, CORS_ORIGIN, DASHSCOPE_API_KEY });
}
exports.default = (0, fastify_plugin_1.default)(envPlugin, { name: 'env' });
