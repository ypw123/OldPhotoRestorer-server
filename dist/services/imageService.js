"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const axios_1 = __importDefault(require("axios"));
class ImageService {
    apiKey;
    baseUrl = 'https://dashscope.aliyuncs.com/api/v1';
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('DASHSCOPE_API_KEY is required');
        }
        this.apiKey = apiKey;
    }
    /**
     * 生成老照片修复的提示词
     */
    generateRestorePrompt() {
        return '修复老照片，去除划痕、污渍、破损和褪色，增强清晰度，改善色彩饱和度和对比度，使照片焕然一新。严格保持原有人物面部特征、表情、五官比例完全不变，保持原有场景构图和物体形状不变，只进行质量修复和增强，不做任何内容改变。';
    }
    /**
     * 使用qwen-image-edit进行图像修复（同步调用）
     */
    async restorePhoto(base64Image) {
        try {
            const prompt = this.generateRestorePrompt();
            // 确保base64图片格式正确
            let formattedBase64Image = base64Image;
            if (!base64Image.startsWith('data:image/')) {
                // 假设是JPEG格式，添加data URL前缀
                formattedBase64Image = `data:image/jpeg;base64,${base64Image}`;
            }
            console.log('Processing image with qwen-image-edit');
            console.log('Prompt:', prompt);
            console.log('Base64 image prefix:', formattedBase64Image.substring(0, 50) + '...');
            const requestData = {
                model: 'qwen-image-edit',
                input: {
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    image: formattedBase64Image
                                },
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                },
                parameters: {
                    watermark: false,
                    negative_prompt: '改变面部特征、改变五官、改变表情、改变人物外貌、面部变形、扭曲、变换身份、改变性别、改变年龄、添加物体、删除物体、改变构图、低分辨率、错误、最差质量、低质量、残缺、多余的手指、比例不良、模糊、噪点、JPEG压缩痕迹、过度曝光、欠曝光、颜色失真'
                }
            };
            console.log('Request data:', JSON.stringify(requestData, null, 2));
            const response = await axios_1.default.post(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 60000 // 60秒超时
            });
            console.log('API Response:', JSON.stringify(response.data, null, 2));
            // 解析响应
            if (response.data.output?.choices?.[0]?.message?.content?.[0]?.image) {
                const imageUrl = response.data.output.choices[0].message.content[0].image;
                return {
                    success: true,
                    imageUrl: imageUrl,
                    originalPrompt: prompt
                };
            }
            else {
                console.error('Unexpected response structure:', response.data);
                return {
                    success: false,
                    error: 'Failed to get image result: ' + JSON.stringify(response.data)
                };
            }
        }
        catch (error) {
            console.error('Error processing image:', error.response?.data || error.message);
            if (error.response?.data) {
                console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
            }
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error occurred'
            };
        }
    }
}
exports.ImageService = ImageService;
exports.default = ImageService;
