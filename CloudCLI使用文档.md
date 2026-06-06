# CloudCLI 使用文档

## 概述

CloudCLI 是基于 [ClaudeCodeUI](https://github.com/siteboon/claudecodeui) v1.31.5 封装的 AI 编程助手桌面客户端，使用 Electron 打包为 Windows 单文件 exe，开箱即用，无需注册登录。

- 仓库地址：https://github.com/sunfengsheng/CloudCLI
- 上游项目：https://github.com/siteboon/claudecodeui

支持的 AI CLI：

| CLI | 说明 |
|-----|------|
| Claude Code | Anthropic 官方 CLI |
| OpenAI Codex | `@openai/codex` CLI |
| Gemini CLI | Google `gemini` CLI |

---

## 前置要求

### 必须

- **Node.js 18+**：exe 运行时使用系统 Node 启动服务，不能缺少
  - 验证：`node --version` 输出 `v18.x.x` 或以上

### 按需安装对应 CLI

| 想用的功能 | 需要安装的 CLI |
|-----------|---------------|
| Claude Code | `npm install -g @anthropic-ai/claude-code`，然后 `claude login` |
| Codex | `npm install -g @openai/codex`，配置 `~/.codex/config.toml` |
| Gemini CLI | `npm install -g @google/gemini-cli`，然后 `gemini auth` |

验证安装：

```bash
claude --version    # Claude Code
codex --version     # Codex
gemini --version    # Gemini CLI
```

---

## 快速开始

1. 从 [Releases](https://github.com/sunfengsheng/CloudCLI/releases) 下载最新 `CloudCLI.exe`
2. 双击运行，首次启动约 5-10 秒后窗口自动弹出
3. 左侧点击 `+` 新建项目，选择本地代码目录
4. 开始对话

> 无需注册，无需登录，直接使用。

---

## 界面说明

### 左侧栏

- **项目列表**：所有已添加的本地项目
- **会话历史**：点击项目展开，查看历史对话记录
- **`+` 按钮**：新建项目或会话

### 主区域

- **对话输入框**：底部，支持多行输入，`Enter` 发送，`Shift+Enter` 换行
- **流式输出**：AI 回复实时流式显示
- **Thinking 区域**：Claude 的思考过程，默认折叠，点击展开

---

## 功能详解

### 新建项目

1. 点击左侧 `+` 按钮
2. 选择 **"Open Existing Folder"**（打开本地目录）
3. 在文件浏览器中选择项目路径：
   - 顶部显示所有可用盘符（C:、D: 等），点击进入对应盘
   - 点击文件夹进入，点击 **"All Drives"** 返回盘符列表
   - 选好目录后点击 **"Use this folder"** 确认
4. 也可以在底部路径框直接输入路径，按 `Enter` 跳转

### 切换 AI Provider

新建会话时可以选择使用的 AI：

- **Claude Code**：默认，使用 Anthropic Claude
- **Codex**：使用 OpenAI Codex（需本地安装 `@openai/codex`）
- **Gemini**：使用 Google Gemini CLI

选择后，对话将通过对应 CLI 与 AI 通信。

### 工具权限拦截

当 AI 需要执行文件读写、运行命令等操作时，会弹出确认框：

| 选项 | 说明 |
|------|------|
| Allow | 本次允许执行 |
| Allow & Remember | 后续相同操作自动允许，无需再次确认 |
| Deny | 拒绝本次操作 |

### 图片上传

- 在输入框中粘贴图片（`Ctrl+V`）或拖拽图片文件
- Claude 可识别图片内容并进行分析

### 会话管理

- 点击左侧历史会话可继续之前的对话
- 会话记录与 Claude Code CLI 本地存储同步，重启后依然保留

---

## 常见问题

### 启动后窗口不出现

1. 确认 Node.js 已安装：`node --version`
2. 确认 3001 端口未被占用：
   ```
   netstat -ano | findstr :3001
   ```
   如果被占用，关闭占用进程后重试
3. 以管理员身份运行 exe

### Claude Code native binary not found

Claude Code CLI 未安装或不在 PATH 中。

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

安装后重启 CloudCLI。

### 使用 Codex 时报错 / 无响应

1. 确认已全局安装：`npm install -g @openai/codex`
2. 确认配置文件存在：`~/.codex/config.toml`（配置 API Key 等）
3. 验证命令行可用：`codex --version`

### 响应很慢或一直转圈

- Claude Code：确认已登录 `claude /status`
- Codex：确认 API Key 有效且余额充足
- Gemini：确认已认证 `gemini auth`

### 选择项目路径时只能看到 C 盘

文件浏览器顶部的盘符列表会列出所有可用盘（C:、D: 等），点击对应盘符即可切换。如果盘符列表为空，可在底部路径框直接输入路径（如 `D:\projects\myapp`）按 Enter 跳转。

---

## 从源码构建 exe

```bash
git clone https://github.com/sunfengsheng/CloudCLI.git
cd CloudCLI/claudecodeui

npm install
npm run build          # 构建前端（dist/）和后端（dist-server/）

cd ../electron-shell

# 将构建产物复制到运行时目录
cp -r ../claudecodeui/dist app/dist
cp -r ../claudecodeui/dist-server app/dist-server
cp -r ../claudecodeui/node_modules app/node_modules

npm install
npm run dist           # 生成 release/CloudCLI.exe
```

产物在 `electron-shell/release/CloudCLI.exe`，约 140MB。

---

## License

本项目基于 [ClaudeCodeUI](https://github.com/siteboon/claudecodeui)，遵循其原始 License。
