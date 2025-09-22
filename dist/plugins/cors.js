"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const cors_1 = __importDefault(require("@fastify/cors"));
async function corsPlugin(app) {
    const origin = app.config.CORS_ORIGIN || true;
    await app.register(cors_1.default, { origin, credentials: true });
}
exports.default = (0, fastify_plugin_1.default)(corsPlugin, { name: 'cors' });
