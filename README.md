# CloudCLI

基于 [ClaudeCodeUI](https://github.com/siteboon/claudecodeui) 封装的 Claude Code 桌面客户端，打包为 Windows 单文件 exe，开箱即用。

## 功能

- 多项目/多会话管理
- 流式输出、Thinking 过程展示
- 工具调用权限拦截（允许 / 允许并记住 / 拒绝）
- 图片上传识别
- 自动同步 Claude Code 会话历史
- 无需注册登录，直接使用

## 前置要求

- **Node.js 18+**（必须，服务端运行依赖）
- **Claude Code CLI** 已安装并登录（命令行能执行 `claude` 命令）

## 直接使用（推荐）

下载 `release/ClaudeCodeUI.exe`，双击运行即可。

> 首次启动稍慢（约 5 秒），等待窗口自动弹出。

## 从源码构建

```bash
# 1. 克隆本仓库
git clone https://github.com/sunfengsheng/CloudCLI.git
cd CloudCLI

# 2. 构建前端
cd claudecodeui
npm install
npm run build

# 3. 将构建产物复制到 electron-shell
cp -r dist ../electron-shell/app/dist
cp -r dist-server ../electron-shell/app/dist-server
cp -r node_modules ../electron-shell/app/node_modules   # 或重新 npm install

# 4. 打包 exe
cd ../electron-shell
npm install
npm run dist
# 产物在 release/ClaudeCodeUI.exe
```

## 项目结构

```
CloudCLI/
├── claudecodeui/        # ClaudeCodeUI 前端 + 后端源码（已定制）
├── electron-shell/      # Electron 封装层
│   ├── main.js          # Electron 主进程
│   ├── package.json     # 打包配置
│   └── app/             # 运行时目录（构建后生成，不含在 git 中）
└── README.md
```

## 相对原版的改动

| 改动 | 说明 |
|------|------|
| 跳过登录 | `VITE_IS_PLATFORM=true`，直接进入主界面 |
| 移除 Logo 跳转 | 点击左上角 Logo 不再跳转外部链接 |
| 关闭版本检查 | 不再请求 GitHub API 检查更新 |

## License

本项目基于 [ClaudeCodeUI](https://github.com/siteboon/claudecodeui)，遵循其原始 License。
