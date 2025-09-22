"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = healthRoute;
async function healthRoute(app) {
    app.get('/health', async () => {
        return { status: 'ok', time: new Date().toISOString() };
    });
}
