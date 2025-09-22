"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = restoreRoute;
const multipart_1 = __importDefault(require("@fastify/multipart"));
const imageService_js_1 = __importDefault(require("../services/imageService.js"));
// qwen-image-edit 模型使用同步调用，不需要任务状态接口
async function restoreRoute(app) {
    // 注册 multipart 支持
    await app.register(multipart_1.default, {
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    });
    // 创建 ImageService 实例
    const getImageService = () => {
        const apiKey = app.config.DASHSCOPE_API_KEY;
        if (!apiKey) {
            throw new Error('DASHSCOPE_API_KEY not configured');
        }
        return new imageService_js_1.default(apiKey);
    };
    // POST /restore - 支持 multipart 文件上传
    app.post('/restore', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.badRequest('No file uploaded');
            }
            const { filename, mimetype, file } = data;
            // 检查文件类型
            if (!mimetype.startsWith('image/')) {
                return reply.badRequest('Only image files are allowed');
            }
            // 读取文件内容
            const chunks = [];
            for await (const chunk of file) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            const size = buffer.length;
            // 转换为 base64
            const base64Image = buffer.toString('base64');
            // 调用图像修复服务
            const imageService = getImageService();
            const result = await imageService.restorePhoto(base64Image);
            return {
                success: result.success,
                filename,
                mimetype,
                size,
                imageUrl: result.imageUrl,
                originalPrompt: result.originalPrompt,
                error: result.error
            };
        }
        catch (error) {
            app.log.error('Error in restore route:', error);
            return {
                success: false,
                error: error.message || 'Internal server error'
            };
        }
    });
    // POST /restore/base64 - 支持 JSON base64 图片上传
    app.post('/restore/base64', async (request, reply) => {
        try {
            const { image } = request.body;
            if (!image) {
                return reply.badRequest('No base64 image provided');
            }
            // 验证 base64 格式
            let base64Data = image;
            if (image.startsWith('data:image/')) {
                // 移除 data URL 前缀
                const base64Match = image.match(/^data:image\/[^;]+;base64,(.+)$/);
                if (base64Match) {
                    base64Data = base64Match[1];
                }
                else {
                    return reply.badRequest('Invalid base64 image format');
                }
            }
            // 验证 base64 数据
            try {
                Buffer.from(base64Data, 'base64');
            }
            catch (error) {
                return reply.badRequest('Invalid base64 encoding');
            }
            // 调用图像修复服务
            const imageService = getImageService();
            const result = await imageService.restorePhoto(base64Data);
            return {
                success: result.success,
                imageUrl: result.imageUrl,
                originalPrompt: result.originalPrompt,
                error: result.error
            };
        }
        catch (error) {
            app.log.error('Error in restore/base64 route:', error);
            return {
                success: false,
                error: error.message || 'Internal server error'
            };
        }
    });
    // qwen-image-edit 模型是同步的，不需要任务状态查询
}
