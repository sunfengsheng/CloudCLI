# Upstream Sync v1.31.5 → v1.33.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将上游 siteboon/claudecodeui v1.32.0 和 v1.33.0 的改动合入本仓库，按批次从低风险到高风险逐步推进。

**Architecture:** 采用 cherry-pick 策略而非 merge，避免上游 `shared/modelConstants.js` 和 `server/claude-sdk.js` 与我们已有修改冲突。每批次独立测试后再推进下一批。

**Tech Stack:** Node.js, TypeScript, React, Electron, electron-builder, git cherry-pick

---

## 文件总览

### 批次 1 — 稳定性修复（9 个 commit，低风险）

| commit | 说明 | 涉及文件 |
|--------|------|----------|
| `36b860e` | WebSocket 插件代理保留帧类型 | `server/modules/websocket/services/plugin-websocket-proxy.service.ts` |
| `dbc41dc` | 移动端防重复发送 | `src/components/chat/view/subcomponents/ChatComposer.tsx` |
| `8694809` | Plugin 设置按来源分组 | `src/components/plugins/view/PluginSettingsTab.tsx`, i18n |
| `951f587` | 重命名输入框保持可见 | sidebar session item 组件 |
| `27e509a` | 活跃会话指示点 tooltip | sidebar 组件 |
| `295bad9` | 项目星标按钮位置修复 | sidebar 组件 |
| `f132a21` | Router basename 修复 | `src/` router 配置 |
| `1e125f3` | Claude 登录后刷新 auth 状态 | auth provider |
| `beb0a50` | claude.exe 路径正则修复 | `server/shared/claude-cli-path.ts` |

### 批次 2 — WebSocket/会话核心修复（2 个 commit，中风险）

| commit | 说明 | 涉及文件数 |
|--------|------|-----------|
| `039696c` | WebSocket 流式传输修复 | 24 个文件 |
| `e89d2da` | 新会话创建/状态一致性修复 | 16 个文件 |

### 批次 3 — 新功能（2 个 commit，高风险）

| commit | 说明 | 涉及文件数 |
|--------|------|-----------|
| `631695e` | Slash 命令菜单显示 provider skills | 25 个文件 |
| `374e9de` | 新增 OpenCode provider 支持 | 30+ 个文件 |

---

## 批次 1：稳定性修复

### Task 1: cherry-pick 批次 1 的 9 个 commit

**Files:**
- Modify: `server/modules/websocket/services/plugin-websocket-proxy.service.ts`
- Modify: `src/components/chat/view/subcomponents/ChatComposer.tsx`
- Modify: `src/components/plugins/view/PluginSettingsTab.tsx`
- Modify: `server/shared/claude-cli-path.ts`
- Modify: 多个 sidebar/auth 组件

- [ ] **Step 1: 确认工作区干净**

```bash
cd D:/code/test/CloudCLI/claudecodeui
git status
```

预期输出：`nothing to commit, working tree clean`。如有未提交改动先 stash。

- [ ] **Step 2: cherry-pick 批次 1（不含冲突风险的 commit）**

```bash
git cherry-pick beb0a50 36b860e dbc41dc 951f587 27e509a 295bad9 f132a21 1e125f3
```

注意：`8694809`（plugin 设置分组）可能因 i18n 文件冲突单独处理，先跳过。

- [ ] **Step 3: 检查是否有冲突**

```bash
git status
```

如有冲突文件，逐一解决：
- 保留我们对 `claude-sdk.js` 的 model 修改（不传 model 参数）
- 保留我们对 `shared/modelConstants.js` 的改动（DEFAULT 为空字符串，加 Default 选项）

- [ ] **Step 4: 如有冲突，解决后继续**

```bash
git add <resolved-files>
git cherry-pick --continue
```

- [ ] **Step 5: cherry-pick plugin 设置分组 commit**

```bash
git cherry-pick 8694809
```

如有 i18n 冲突，接受上游版本（我们未修改 i18n 文件）：
```bash
git checkout --theirs src/i18n/locales/en/settings.json
git add src/i18n/locales/en/settings.json
git cherry-pick --continue
```

- [ ] **Step 6: 验证 cherry-pick 结果**

```bash
git log --oneline -12
git diff HEAD~9 --stat
```

预期：看到 9 条新 commit，各自对应上游 commit 描述。

- [ ] **Step 7: 构建验证**

```bash
cd D:/code/test/CloudCLI/claudecodeui
npm run build 2>&1 | tail -10
```

预期：构建成功，无 TypeScript 错误。

- [ ] **Step 8: 推送**

```bash
cd D:/code/test/CloudCLI
git push origin master
```

---

## 批次 2：WebSocket / 会话核心修复

### Task 2: cherry-pick WebSocket 流式传输修复（039696c）

**Files:**
- Modify: `server/gemini-cli.js`
- Modify: `server/modules/database/` (migrations, schema, repositories)
- Modify: `server/modules/providers/list/claude/claude-sessions.provider.ts`
- Modify: `server/modules/providers/list/cursor/cursor-sessions.provider.ts`
- Modify: `server/modules/providers/services/sessions.service.ts`
- Modify: `server/openai-codex.js`
- Modify: `server/shared/types.ts`

- [ ] **Step 1: cherry-pick**

```bash
cd D:/code/test/CloudCLI/claudecodeui
git cherry-pick 039696c
```

- [ ] **Step 2: 处理冲突**

主要冲突点：
- `server/shared/types.ts` — 接受上游新增字段，保留我们未改动的部分
- `server/claude-sdk.js` — **关键**：上游此 commit 改了 claude-sdk.js，需手动检查并保留我们的 "不传 model 参数" 修改

```bash
# 查看冲突
git diff --name-only --diff-filter=U
```

对于 `server/claude-sdk.js`，解决冲突后确认以下代码存在（我们的修改）：
```javascript
// Model selection is intentionally skipped — the API endpoint in use
// rejects any --model argument. The CLI's configured default is used.
```

- [ ] **Step 3: 继续 cherry-pick**

```bash
git add .
git cherry-pick --continue
```

- [ ] **Step 4: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

预期：构建成功。

### Task 3: cherry-pick 新会话状态修复（e89d2da）

**Files:**
- Modify: `src/stores/useSessionStore.ts`
- Modify: `src/components/chat/hooks/useChatRealtimeHandlers.ts`
- Modify: `src/components/chat/hooks/useChatSessionState.ts`
- Modify: `src/hooks/useProjectsState.ts`
- Modify: `server/shared/claude-cli-path.ts`
- Modify: `server/claude-sdk.js`

- [ ] **Step 1: cherry-pick**

```bash
git cherry-pick e89d2da
```

- [ ] **Step 2: 处理冲突**

主要关注 `server/claude-sdk.js`，再次确认保留我们的 model 修改：
```javascript
// Model selection is intentionally skipped — the API endpoint in use
// rejects any --model argument. The CLI's configured default is used.
```

- [ ] **Step 3: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: 构建并打包 exe，测试新建会话流程**

```bash
npm run build 2>&1 | tail -5
cd ../
cp -r claudecodeui/dist electron-shell/app/dist
cp -r claudecodeui/dist-server electron-shell/app/dist-server
echo '{"type":"module"}' > electron-shell/app/dist-server/package.json
cd electron-shell && npm run dist 2>&1 | tail -5
```

- [ ] **Step 5: 推送**

```bash
cd D:/code/test/CloudCLI
git push origin master
```

---

## 批次 3：新功能

### Task 4: cherry-pick Skills 显示在 Slash 命令菜单（631695e）

**Files:**
- Create: `server/modules/providers/shared/skills/skills.provider.ts`
- Create: `server/modules/providers/list/claude/claude-skills.provider.ts`
- Create: `server/modules/providers/list/cursor/cursor-skills.provider.ts`
- Create: `server/modules/providers/list/gemini/gemini-skills.provider.ts`
- Modify: `server/modules/providers/provider.routes.ts`
- Modify: `server/routes/commands.js`
- Modify: `server/shared/types.ts`
- Modify: `server/shared/utils.ts`
- Modify: `src/components/chat/hooks/useSlashCommands.ts`
- Modify: `src/components/chat/view/subcomponents/CommandMenu.tsx`

- [ ] **Step 1: cherry-pick**

```bash
cd D:/code/test/CloudCLI/claudecodeui
git cherry-pick 631695e
```

- [ ] **Step 2: 处理冲突**

预期冲突点：
- `server/shared/types.ts` — 接受上游新增类型
- `server/shared/utils.ts` — 接受上游新增工具函数
- `server/routes/commands.js` — 检查是否有 model 相关改动，保留我们的 model 不传逻辑

- [ ] **Step 3: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: 推送**

```bash
cd D:/code/test/CloudCLI
git push origin master
```

### Task 5: cherry-pick OpenCode provider 支持（374e9de）

**Files:**
- Create: `server/opencode-cli.js`
- Create: `server/modules/providers/list/opencode/` (多个文件)
- Modify: `server/modules/providers/provider.registry.ts`
- Modify: `server/index.js`
- Modify: `server/routes/commands.js`
- Modify: `public/modelConstants.js` (新增，注意与 `shared/modelConstants.js` 区别)
- Modify: `src/components/chat/hooks/useChatProviderState.ts`
- Modify: `src/components/chat/hooks/useChatComposerState.ts`

- [ ] **Step 1: cherry-pick**

```bash
cd D:/code/test/CloudCLI/claudecodeui
git cherry-pick 374e9de
```

- [ ] **Step 2: 处理冲突**

主要冲突点：
- `shared/modelConstants.js` — 上游重构了这个文件，我们有自己的修改。策略：
  1. 接受上游对其他 provider 模型的改动
  2. 保留我们对 `CLAUDE_MODELS` 的改动（`DEFAULT: ""`, 加 `Default (CLI configured)` 选项）
  3. 确认 `server/claude-sdk.js` 里的 model 不传逻辑完整

- [ ] **Step 3: 构建验证**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: 完整打包**

```bash
cd D:/code/test/CloudCLI
cp -r claudecodeui/dist electron-shell/app/dist
cp -r claudecodeui/dist-server electron-shell/app/dist-server
echo '{"type":"module"}' > electron-shell/app/dist-server/package.json
RELEASE_DIR="electron-shell/app/node_modules/better-sqlite3/build/Release"
CURRENT_ABI=$(node -e "console.log(process.versions.modules)")
cp "${RELEASE_DIR}/better_sqlite3.node" "${RELEASE_DIR}/better_sqlite3_abi${CURRENT_ABI}.node"
cd electron-shell && npm run dist 2>&1 | tail -5
```

- [ ] **Step 5: 推送**

```bash
cd D:/code/test/CloudCLI
git push origin master
```

---

## 冲突处理备忘

每次 cherry-pick 出现冲突时，以下文件有固定处理规则：

| 文件 | 处理规则 |
|------|----------|
| `server/claude-sdk.js` | 保留我们的 "不传 model 参数" 注释块，接受上游其他改动 |
| `shared/modelConstants.js` | 保留 `CLAUDE_MODELS.DEFAULT = ""` 和 `Default (CLI configured)` 选项，接受上游对其他 provider 的改动 |
| 其他文件 | 接受上游版本（我们未修改） |

如果 cherry-pick 因冲突太复杂无法继续：
```bash
git cherry-pick --abort
```
然后手动将 diff 逐段应用。
