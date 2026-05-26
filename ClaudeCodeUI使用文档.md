# CloudCLI 使用文档

## 概述

CloudCLI 是基于 ClaudeCodeUI v1.31.5 封装的桌面客户端，使用 Electron 打包为 Windows 单文件 exe。

- 仓库地址：https://github.com/sunfengsheng/CloudCLI
- 上游项目：https://github.com/siteboon/claudecodeui

## 前置要求

- **Node.js 18+**（必须安装，exe 运行时依赖系统 node）
- **Claude Code CLI** 已安装并登录
  - 验证方式：命令行执行 `claude --version` 能正常输出

## 快速开始

双击 `ClaudeCodeUI.exe`，等待约 5 秒后窗口自动出现，无需注册登录，直接使用。

> exe 路径：`electron-shell/release/ClaudeCodeUI.exe`（142MB）

## 功能说明

### 项目与会话

- 左侧栏显示所有 Claude Code 项目及会话历史
- 点击项目可展开查看历史对话
- 点击 `+` 按钮新建项目/会话

### 对话

- 流式输出，实时显示回复
- 支持 Thinking 过程展示（可折叠）
- 支持图片上传（Claude 可识别图片内容）

### 工具权限拦截

当 Claude 需要执行文件读写、命令行等操作时，弹出确认框：

| 选项 | 说明 |
|------|------|
| 允许 | 本次允许执行 |
| 允许并记住 | 后续相同操作自动允许 |
| 拒绝 | 拒绝本次操作 |

## 常见问题

### 启动后窗口不出现

- 确认 Node.js 已安装（`node --version`）
- 确认 3001 端口未被占用：`netstat -ano | findstr :3001`

### Claude Code native binary not found

Claude Code CLI 未安装或不在 PATH 中。
解决：确保 `claude --version` 可以执行。

### 响应很慢或无响应

确认 Claude Code CLI 已登录：`claude /status`

## 从源码构建 exe

```bash
git clone https://github.com/sunfengsheng/CloudCLI.git
cd CloudCLI/claudecodeui
npm install
npm run build          # 构建前端和后端

cd ../electron-shell
# 将 claudecodeui 构建产物复制过来
cp -r ../claudecodeui/dist app/dist
cp -r ../claudecodeui/dist-server app/dist-server
cp -r ../claudecodeui/node_modules app/node_modules

npm install
npm run dist           # 生成 release/ClaudeCodeUI.exe
```
