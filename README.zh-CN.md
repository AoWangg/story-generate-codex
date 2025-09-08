# AI 故事生成器

线上地址：https://story.orville.wang/

一个基于 Next.js 的应用：把你的主题提示转化为带插图的短篇故事。文本通过 OpenAI 兼容接口生成，插图异步生成。未登录用户数据保存在浏览器本地；登录后会同步到 Supabase。内置良好的移动端体验、OG/Twitter 分享卡片、可下载的故事与图片资源。

## 功能特性
- 生成带 Markdown 格式的短篇故事
- 异步生成插画，并可一键下载
- 访客使用本地历史；登录后与 Supabase 云端同步
- 适配移动端的 UI（考虑溢出与长词换行）
- OG/Twitter 分享卡片与站点图标

## 技术栈
- Next.js 13 App Router（Edge Runtime）
- Tailwind CSS + Radix UI + shadcn/ui
- Supabase（认证 + Postgres）
- `openai` SDK（适配 DashScope baseURL）

## 本地运行
1) 安装依赖
- `npm install`（或 `yarn`、`pnpm i`）

2) 环境变量（`.env.local`）
- `NEXT_PUBLIC_SITE_URL` —— 例如 `https://story.orville.wang`
- `OPENAI_API_KEY` —— DashScope Key（用于文本与图片生成）
- `NEXT_PUBLIC_SUPABASE_URL` —— 你的 Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` —— Supabase 匿名 Key
- `SUPABASE_SERVICE_ROLE_KEY` —— 可选，用于服务端管理操作

3) 启动开发
- `npm run dev`，打开 `http://localhost:3000`

## Supabase 配置
- 创建 Supabase 项目并获取 URL 和 anon key。
- 在 `supabase/migrations` 中有 `stories`、`conversations`、`messages` 等表结构，可在 SQL 编辑器中按顺序执行。
- 在 Authentication 中启用需要的登录方式（Email、GitHub 等）。

数据模型说明
- `stories` 存储主故事数据（title/theme/content/image_url/created_at）。登录用户的历史从此表读取。
- 新生成的故事会插入/更新 `stories.image_url`，保证插画长期可用。
- `conversations`/`messages` 用于保留生成过程中的对话轨迹（历史展示可选）。

## 部署
- 在部署平台（如 Vercel）配置上述环境变量，确保 `NEXT_PUBLIC_SITE_URL` 与你的域名一致。
- App Router 自动暴露：
  - 全局 metadata：`app/layout.tsx`
  - OG/Twitter 图片：`/opengraph-image`、`/twitter-image`

## 自定义
- 修改站点名称、色彩与文案：`app/layout.tsx` 和 `app/*-image.tsx`。
- 替换图标：`app/icon.svg`、`app/apple-icon.svg`。
- 根据需要在 `components/` 下调整 UI 组件。

## 常用脚本
- `npm run dev` —— 启动开发
- `npm run build` —— 打包生产
- `npm run start` —— 运行生产包

## 说明
- 目前图片 URL 指向外部生成结果；若需长期保留，建议上传到 Supabase Storage，并在 `stories.image_url` 存储其路径。

## 许可
代码以现状提供，仓库未附带开源许可。如需超出本地试用的用途，请联系作者。

