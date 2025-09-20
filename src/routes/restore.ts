import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import multipart, { MultipartFile } from '@fastify/multipart';
import ImageService, { ImageProcessingResult } from '../services/imageService.js';

// 支持 multipart 文件上传的响应接口
interface MultipartRestoreResponse {
  success: boolean;
  filename?: string;
  mimetype?: string;
  size?: number;
  imageUrl?: string;
  originalPrompt?: string;
  error?: string;
}

// 支持 JSON base64 的请求和响应接口
interface Base64RestoreRequest {
  image: string; // base64 编码的图片数据
}

interface Base64RestoreResponse {
  success: boolean;
  imageUrl?: string;
  originalPrompt?: string;
  error?: string;
}

// qwen-image-edit 模型使用同步调用，不需要任务状态接口

export default async function restoreRoute(app: FastifyInstance) {
  // 注册 multipart 支持
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  // 创建 ImageService 实例
  const getImageService = () => {
    const apiKey = app.config.DASHSCOPE_API_KEY;
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY not configured');
    }
    return new ImageService(apiKey);
  };

  // POST /restore - 支持 multipart 文件上传
  app.post('/restore', async (request: FastifyRequest, reply: FastifyReply): Promise<MultipartRestoreResponse> => {
    try {
      const data: MultipartFile | undefined = await (request as any).file();
      if (!data) {
        return reply.badRequest('No file uploaded');
      }

      const { filename, mimetype, file } = data;
      
      // 检查文件类型
      if (!mimetype.startsWith('image/')) {
        return reply.badRequest('Only image files are allowed');
      }

      // 读取文件内容
      const chunks: Buffer[] = [];
      for await (const chunk of file) {
        chunks.push(chunk as Buffer);
      }
      const buffer = Buffer.concat(chunks);
      const size = buffer.length;

      // 转换为 base64
      const base64Image = buffer.toString('base64');

      // 调用图像修复服务
      const imageService = getImageService();
      const result: ImageProcessingResult = await imageService.restorePhoto(base64Image);

      return {
        success: result.success,
        filename,
        mimetype,
        size,
        imageUrl: result.imageUrl,
        originalPrompt: result.originalPrompt,
        error: result.error
      };

    } catch (error: any) {
      app.log.error('Error in restore route:', error);
      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  });

  // POST /restore/base64 - 支持 JSON base64 图片上传
  app.post<{ Body: Base64RestoreRequest }>('/restore/base64', async (request, reply): Promise<Base64RestoreResponse> => {
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
        } else {
          return reply.badRequest('Invalid base64 image format');
        }
      }

      // 验证 base64 数据
      try {
        Buffer.from(base64Data, 'base64');
      } catch (error) {
        return reply.badRequest('Invalid base64 encoding');
      }

      // 调用图像修复服务
      const imageService = getImageService();
      const result: ImageProcessingResult = await imageService.restorePhoto(base64Data);

      return {
        success: result.success,
        imageUrl: result.imageUrl,
        originalPrompt: result.originalPrompt,
        error: result.error
      };

    } catch (error: any) {
      app.log.error('Error in restore/base64 route:', error);
      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  });

  // qwen-image-edit 模型是同步的，不需要任务状态查询
}
