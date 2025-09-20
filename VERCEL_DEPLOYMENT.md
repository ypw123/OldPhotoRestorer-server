# OldPhotoRestorer Server - Vercel 部署指南

## 部署到 Vercel

### 1. 环境准备

确保项目已经构建：
```bash
npm install
npm run build
```

### 2. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

- `DASHSCOPE_API_KEY`: 阿里云百炼的 API Key
- `CORS_ORIGIN`: 前端域名（如 https://your-frontend.vercel.app）
- `NODE_ENV`: production

### 3. 部署步骤

#### 方法一：通过 GitHub 自动部署

1. 将项目推送到 GitHub
2. 在 Vercel 控制台连接 GitHub 仓库
3. 选择 `OldPhotoRestorer-server` 项目
4. Vercel 会自动检测配置并部署

#### 方法二：使用 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 在项目根目录运行：
```bash
vercel
```

3. 按照提示完成部署

### 4. 项目结构说明

- `api/index.js`: Vercel serverless 函数入口
- `vercel.json`: Vercel 部署配置
- `dist/`: TypeScript 编译后的 JavaScript 文件
- `.vercelignore`: 部署时忽略的文件

### 5. API 路由

部署后，所有 API 请求都会通过 `/api` 路径：

- 健康检查: `GET /health`
- 图片修复: `POST /api/restore`

### 6. 注意事项

- Vercel 函数有 30 秒的执行时间限制
- 确保 `DASHSCOPE_API_KEY` 环境变量已正确设置
- CORS 配置需要匹配前端域名