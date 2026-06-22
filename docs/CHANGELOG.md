# 变更日志

所有重要的项目变更都将记录在此文件中。

---

## [v2.0.5] - 2026-06-22

### 功能优化

- **心情可取消**：再次点击已选中的心情即可取消选择（之前选了无法撤销）
- **打卡可取消/可改时长**：点击任务卡片改为弹出打卡弹窗
  - 未打卡：可在打卡前调整本次时长（默认填入预设时长），再确认打卡
  - 已打卡：可「保存时长」调整实际时长，或「取消打卡」删除本次记录
- **修复** 重复打卡 bug：此前重复点击已打卡卡片会不断新增重复记录
- 任务卡片已打卡时显示实际记录的时长（「已打卡 · X分钟」）

### 修改文件

- `lib/storage.tsx` - 新增 `removeTaskRecord` / `updateTaskRecord` / `clearMood`
- `components/features/MoodTracker.tsx` - 支持再次点击取消选择
- `components/features/TaskCard.tsx` - 改为点击打开打卡弹窗，显示实际时长
- `components/features/TaskCheckInModal.tsx` - 新建打卡弹窗（调整时长 / 取消打卡）
- `app/page.tsx` - 接入打卡弹窗与心情取消

---

## [v2.0.4] - 2026-06-22

### 工程化

- **新增** `.githooks/pre-push` 钩子：每次 `git push` 前自动运行 `npm run build`，构建失败则中止推送，避免把会导致 Vercel 部署失败的代码推上远程
- **启用方式**：每台开发机执行一次 `git config core.hooksPath .githooks`（临时跳过用 `git push --no-verify`）

### 修改文件

- `.githooks/pre-push` - 新建推送前构建检查钩子

---

## [v2.0.3] - 2026-06-22

### Bug 修复 / 部署加固

- **修复** Vercel 构建时 recharts 报出的 `width(-1)/height(-1)` 警告：图表改为客户端挂载后再渲染（构建静态预渲染阶段容器无真实尺寸）
- **新增** `package.json` 的 `engines` 字段，锁定 Node `>=20.9.0`，避免 Vercel 默认 Node 版本变动导致构建异常
- **新增** `.env.example`，列出 Supabase 同步所需的环境变量（缺失不影响构建，仅云端同步不可用）
- **说明** 历史部署失败的根因（Next.js 项目未在仓库根目录 + 残留旧 Vite 文件干扰框架检测 + `vercel.json` 反复改坏）已在此前提交中解决，当前 `npm run build` 本地验证通过

### 修改文件

- `app/stats/page.tsx` - 图表客户端挂载后渲染
- `package.json` - 新增 `engines` 字段
- `.env.example` - 新建环境变量示例
- `.gitignore` - 放行 `.env.example`

---

## [v2.0.2] - 2026-05-28

### Bug 修复

- **修复** Vercel 部署失败问题：添加缺失的 `vercel-build` 脚本
- **新增** `vercel.json` 配置文件，确保部署正确识别 Next.js 应用

### 修改文件

- `package.json` - 添加 `vercel-build` 脚本
- `vercel.json` - 新建部署配置文件

---

## [v2.0.1] - 2026-05-28

### 功能调整

- **移除** 个人中心页面的「导出数据」功能
- **移除** 个人中心页面的「导入数据」功能
- **新增** 个人中心页面的「更新日志」功能，展示版本历史记录

### 修改文件

- `app/profile/page.tsx` - 删除导入/导出功能，新增更新日志组件

### 更新日志数据结构

```typescript
{
  version: string,    // 版本号
  date: string,       // 更新日期
  changes: string[]   // 更新内容列表
}
```

---

## [v2.0.0] - 2026-05-27

### 重大更新

- 使用 Next.js 重写整个应用
- 支持 PWA 离线使用
- 新增云端同步功能（Supabase）
- 优化 UI 设计和交互体验

### 修改文件

- 项目整体重构，迁移至 Next.js 16

---

## [v1.5.0] - 2026-04-15

### 功能新增

- 新增成就系统
- 优化任务管理功能
- 添加专注模式计时器

---

## [v1.0.0] - 2026-03-01

### 初始版本

- 日常打卡记录功能
- 任务管理功能
- 数据统计功能