# ClaudeCodeUI 使用文档

## 项目信息

- 项目地址：https://github.com/siteboon/claudecodeui.git
- 版本：1.31.5
- 本地路径：`D:\code\test\claude_gui\claudecodeui`

## 前置要求

- Node.js 18+
- Claude Code CLI 已安装并可用（命令行输入 `claude` 能运行）
- Claude Code 已登录（有有效的 API key 或 OAuth）

## 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/siteboon/claudecodeui.git
cd claudecodeui

# 2. 安装依赖
npm install

# 3. 创建环境配置文件
```

创建 `.env` 文件，内容如下：

```env
SERVER_PORT=3001
VITE_PORT=5173
HOST=127.0.0.1
VITE_CONTEXT_WINDOW=160000
CONTEXT_WINDOW=160000
```

## 启动

```bash
# 开发模式（推荐，带热更新）
npm run dev

# 生产模式
npm run start
```

启动后：
- 后端 API + WebSocket：http://localhost:3001
- 前端页面（开发模式）：http://localhost:5173

## 首次使用：注册账号

系统是单用户模式，首次使用需要注册一个账号。

### 方式一：通过浏览器

打开 http://localhost:5173，页面会显示注册/登录界面，直接注册即可。

### 方式二：通过命令行

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

注册成功后返回 token，浏览器登录使用：
- 用户名：`admin`
- 密码：`admin123`

> 注意：只能注册一个用户。如需重置，删除数据库文件重新注册。

## 登录

打开 http://localhost:5173，输入注册时的用户名和密码登录。

登录后 WebSocket 连接会自动建立，即可开始对话。

## 功能说明

### 对话

- 支持多会话管理
- 支持流式输出（实时显示 Claude 的回复）
- 支持 thinking 过程展示
- 支持工具调用权限拦截（允许/拒绝/记住）

### 工具权限

当 Claude 需要执行文件读写、命令行等操作时，会弹出权限确认：
- **允许**：本次允许执行
- **允许并记住**：后续相同操作自动允许
- **拒绝**：拒绝本次操作

### 图片上传

支持在对话中上传图片，Claude 可以识别图片内容。

### 会话历史

自动同步 Claude Code 的会话历史，可以查看和恢复之前的对话。

## 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| SERVER_PORT | 3001 | 后端服务端口 |
| VITE_PORT | 5173 | 前端开发服务端口 |
| HOST | 0.0.0.0 | 绑定地址 |
| VITE_IS_PLATFORM | false | 平台模式（跳过登录认证） |
| VITE_CONTEXT_WINDOW | 160000 | 上下文窗口大小 |
| JWT_SECRET | 自动生成 | JWT 密钥（可自定义） |
| API_KEY | 无 | API 密钥（可选，额外安全层） |
| CLAUDE_CLI_PATH | claude | Claude CLI 路径 |
| DATABASE_PATH | 默认 | 数据库文件路径 |

## 平台模式（跳过登录）

如果不想每次登录，可以设置平台模式：

```env
VITE_IS_PLATFORM=true
```

此模式下自动使用数据库中的第一个用户，无需输入密码。但仍需先注册一个用户。

## 常见问题

### WebSocket authentication failed

原因：没有注册用户或未登录。
解决：先注册用户，然后在浏览器中登录。

### Claude Code native binary not found

原因：Claude Code CLI 未安装或路径不对。
解决：确保命令行能运行 `claude --version`。如果安装在非默认路径，在 `.env` 中设置 `CLAUDE_CLI_PATH`。

### 端口被占用

修改 `.env` 中的 `SERVER_PORT` 和 `VITE_PORT`。

## 停止服务

```bash
# 如果在前台运行，按 Ctrl+C
# 如果需要强制停止
taskkill /F /IM node.exe   # Windows
pkill -f node              # Linux/Mac
```
