# 圆桌俱乐部 - Vercel 部署指南

## 准备工作

### 1. 创建 Vercel 账号
- 访问 https://vercel.com
- 使用 GitHub 账号登录

### 2. 准备 GitHub 仓库
```bash
# 如果还没有推送到 GitHub
git remote add origin https://github.com/你的用户名/round-table-club.git
git push -u origin main
```

### 3. 安装 Vercel CLI（可选）
```bash
npm i -g vercel
```

---

## 部署步骤

### 方式一：Web 界面部署（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择 GitHub 仓库 `round-table-club`
4. 配置项目：
   - Framework Preset: Next.js
   - Build Command: `prisma generate && next build`
5. 点击 "Deploy"

### 方式二：CLI 部署

```bash
# 登录 Vercel
vercel login

# 在项目目录执行
vercel

# 生产部署
vercel --prod
```

---

## 环境变量配置

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

### 必需变量

| 变量名 | 说明 | 从哪里获取 |
|--------|------|------------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | Vercel Postgres |
| `NEXTAUTH_SECRET` | 随机字符串 | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 网站地址 | Vercel 自动提供 |
| `SECONDME_CLIENT_ID` | SecondMe App ID | SecondMe 开发者平台 |
| `SECONDME_CLIENT_SECRET` | SecondMe App Secret | SecondMe 开发者平台 |
| `SECONDME_REDIRECT_URI` | OAuth 回调地址 | `https://你的域名/api/auth/callback` |
| `SECONDME_API_BASE_URL` | SecondMe API 地址 | `https://api.mindverse.com/gate/lab` |
| `SECONDME_OAUTH_URL` | SecondMe OAuth 地址 | `https://go.second.me/oauth/` |
| `SECONDME_TOKEN_ENDPOINT` | Token 端点 | `https://api.mindverse.com/gate/lab/api/oauth/token/code` |
| `SECONDME_REFRESH_ENDPOINT` | Refresh 端点 | `https://api.mindverse.com/gate/lab/api/oauth/token/refresh` |

---

## 创建 Vercel Postgres 数据库

1. 在 Vercel Dashboard 中选择项目
2. 点击 "Storage" → "Connect Store" → "Create New" → "Postgres"
3. 创建完成后，复制 `.env.local` 中的 `DATABASE_URL`
4. 添加到 Environment Variables 中

### 初始化数据库

```bash
# 本地测试数据库连接
npx prisma db push

# 或在 Vercel 控制台执行
# Vercel Dashboard → Functions → 找到并执行
```

---

## SecondMe OAuth 配置更新

部署后需要更新 SecondMe 开发者平台的回调地址：

1. 登录 https://develop.second.me
2. 找到你的应用
3. 更新 Redirect URI:
   - 开发环境: `http://localhost:3001/api/auth/callback`
   - 生产环境: `https://你的域名/api/auth/callback`

---

## 验证部署

1. 访问部署后的域名
2. 测试登录功能（SecondMe OAuth）
3. 测试数据库读写（创建话题、加入圆桌等）

---

## 故障排查

### 问题：数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确认 Vercel Postgres 已在项目中连接

### 问题：OAuth 登录失败
- 检查 SecondMe 回调地址是否更新为生产域名
- 确认所有环境变量已配置

### 问题：样式丢失
- 检查 Tailwind 配置
- 确认 `postcss.config.mjs` 正确

---

## 自动化部署

每次推送代码到 GitHub main 分支，Vercel 会自动触发重新部署。

如需禁用自动部署：
Vercel Dashboard → Project Settings → Git → Deployment Protection
