# 成绩分析 Agent 云端部署说明

当前网页会优先请求 `/api/chat`，失败时自动回退到本地规则分析。

## 本地或 Vercel 环境变量

不要把真实密钥写进 `index.html`。

需要配置：

- `XFYUN_API_KEY`
- `XFYUN_BASE_URL`
- `XFYUN_MODEL`

参考 `.env.example`。

## 本机直接使用云端 Agent

1. 复制 `.env.example` 为 `.env.local`。
2. 在 `.env.local` 里填写真实的 `XFYUN_API_KEY`。
3. 运行：

```bash
npm run dev
```

4. 打开：

```text
http://127.0.0.1:8090/
```

注意：不要再用 `python -m http.server` 的 8088 地址测试云端 Agent。8088 只能打开静态网页，不能运行 `/api/chat`。

## Vercel 部署

1. 将本仓库导入 Vercel。
2. 在 Vercel 项目的 Environment Variables 中添加上面的三个变量。
3. 重新部署。

如果继续使用 GitHub Pages 托管静态页面，GitHub Pages 不能运行 `/api/chat`。这种情况下需要把后端单独部署到 Vercel，再把前端请求地址改成你的 Vercel API 地址。

## 额度控制

- 前端每次只发送当前学生的摘要数据，不发送全班原始列表。
- 每个问题限制 160 字。
- 后端 `max_tokens` 为 260。
- 云端失败时自动使用本地分析，不会影响查分功能。
