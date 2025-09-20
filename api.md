# OldPhotoRestorer API 文档

## 概述

OldPhotoRestorer 后端服务基于 Fastify 框架构建，集成了通义万相 AI 图像生成能力，提供老照片修复功能。

**服务地址**: `http://localhost:4000`

## 环境配置

### 必需的环境变量

在 `.env` 文件中配置以下变量：

```bash
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173
DASHSCOPE_API_KEY=sk-your-api-key-here
```

### 获取 API Key

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册并开通通义万相服务
3. 在控制台获取 API Key
4. 将 API Key 配置到环境变量 `DASHSCOPE_API_KEY`

## API 接口

### 1. 健康检查

**接口**: `GET /health`

**描述**: 检查服务状态

**响应示例**:
```json
{
  "status": "ok",
  "time": "2025-01-16T10:30:00.000Z"
}
```

---

### 2. 老照片修复（文件上传）

**接口**: `POST /restore`

**描述**: 通过 multipart/form-data 上传图片文件进行老照片修复

**请求类型**: `multipart/form-data`

**请求参数**:
- `file` (required): 图片文件，支持 jpg、png、jpeg 等格式，最大 10MB

**响应示例**:
```json
{
  "success": true,
  "filename": "old-photo.jpg",
  "mimetype": "image/jpeg",
  "size": 1024576,
  "taskId": "d492bffd-10b5-4169-b639-xxxxxx",
  "imageUrl": "https://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/restored.png",
  "originalPrompt": "高质量老照片修复，去除划痕、污渍、褪色...",
  "actualPrompt": "高质量专业老照片修复技术，精确去除图像中的划痕..."
}
```

**错误响应示例**:
```json
{
  "success": false,
  "error": "Only image files are allowed"
}
```

---

### 3. 老照片修复（Base64）

**接口**: `POST /restore/base64`

**描述**: 通过 JSON 格式上传 base64 编码的图片进行老照片修复

**请求类型**: `application/json`

**请求体**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." 
}
```

**请求参数说明**:
- `image` (required): base64 编码的图片数据，支持 data URL 格式或纯 base64 字符串

**响应示例**:
```json
{
  "success": true,
  "taskId": "d492bffd-10b5-4169-b639-xxxxxx",
  "imageUrl": "https://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/restored.png",
  "originalPrompt": "高质量老照片修复，去除划痕、污渍、褪色...",
  "actualPrompt": "高质量专业老照片修复技术，精确去除图像中的划痕..."
}
```

**错误响应示例**:
```json
{
  "success": false,
  "error": "Invalid base64 encoding"
}
```

---

### 4. 查询任务状态

**接口**: `GET /restore/status/:taskId`

**描述**: 查询图片处理任务的状态和结果

**路径参数**:
- `taskId` (required): 任务 ID，从修复接口返回结果中获取

**响应示例**:

**处理中**:
```json
{
  "taskId": "d492bffd-10b5-4169-b639-xxxxxx",
  "status": "RUNNING"
}
```

**处理成功**:
```json
{
  "taskId": "d492bffd-10b5-4169-b639-xxxxxx",
  "status": "SUCCEEDED",
  "imageUrl": "https://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/restored.png",
  "originalPrompt": "高质量老照片修复，去除划痕、污渍、褪色...",
  "actualPrompt": "高质量专业老照片修复技术，精确去除图像中的划痕..."
}
```

**处理失败**:
```json
{
  "taskId": "d492bffd-10b5-4169-b639-xxxxxx",
  "status": "FAILED",
  "error": "Task execution failed"
}
```

**状态说明**:
- `PENDING`: 任务排队中
- `RUNNING`: 任务处理中
- `SUCCEEDED`: 任务执行成功
- `FAILED`: 任务执行失败
- `CANCELED`: 任务取消成功
- `UNKNOWN`: 任务不存在或状态未知

---

## 使用示例

### 1. 使用 curl 测试文件上传

```bash
curl -X POST http://localhost:4000/restore \
  -F "file=@/path/to/your/old-photo.jpg" \
  -H "Content-Type: multipart/form-data"
```

### 2. 使用 curl 测试 base64 上传

```bash
curl -X POST http://localhost:4000/restore/base64 \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  }'
```

### 3. 查询任务状态

```bash
curl -X GET http://localhost:4000/restore/status/d492bffd-10b5-4169-b639-xxxxxx
```

### 4. JavaScript/TypeScript 示例

```typescript
// 文件上传示例
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:4000/restore', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);

// Base64 上传示例
const base64Response = await fetch('http://localhost:4000/restore/base64', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
  })
});

const base64Result = await base64Response.json();
console.log(base64Result);
```

---

## 错误处理

### 常见错误码

- `400 Bad Request`: 请求参数错误
  - 没有上传文件
  - 文件格式不支持
  - base64 编码无效
  
- `500 Internal Server Error`: 服务器内部错误
  - API Key 未配置
  - 通义万相 API 调用失败

### 错误响应格式

所有错误响应都遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

---

## 注意事项

1. **图片限制**: 
   - 文件大小最大 10MB
   - 支持常见图片格式：jpg、jpeg、png、gif、bmp、webp

2. **处理时间**: 
   - 图片处理通常需要 10-60 秒
   - 服务内置超时机制（5分钟）

3. **结果有效期**: 
   - 生成的图片 URL 有效期为 24 小时
   - 请及时下载或保存修复后的图片

4. **并发限制**: 
   - 阿里云账号默认限制每秒 2 个请求
   - 同时处理中的任务数量限制为 100 个

5. **费用说明**: 
   - 使用通义万相 API 会产生费用
   - 万相 2.2 极速版：0.14元/张
   - 请关注阿里云账单

---

## 开发指南

### 启动开发服务器

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入真实的 DASHSCOPE_API_KEY

# 启动开发服务器
npm run dev
```

### 项目结构

```
src/
├── server.ts              # 服务器入口
├── plugins/
│   ├── env.ts             # 环境变量插件
│   └── cors.ts            # CORS 插件
├── routes/
│   ├── health.ts          # 健康检查路由
│   └── restore.ts         # 图片修复路由
└── services/
    └── imageService.ts    # 图像处理服务
```

### 扩展功能

服务架构支持轻松扩展：

1. **添加新的 AI 能力**: 在 `services/` 目录创建新的服务类
2. **添加新的路由**: 在 `routes/` 目录创建新的路由文件
3. **添加中间件**: 在 `plugins/` 目录创建新的插件

---

## 更新日志

### v0.1.0 (2025-01-16)
- ✨ 初始版本发布
- ✨ 集成通义万相 AI 图像生成 API
- ✨ 支持文件上传和 base64 格式图片处理
- ✨ 提供异步任务状态查询
- ✨ 完整的错误处理和日志记录