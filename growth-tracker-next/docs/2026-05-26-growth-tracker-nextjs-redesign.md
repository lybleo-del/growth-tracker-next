# Growth Tracker - Next.js 重设计方案

**日期**: 2026-05-26
**版本**: 1.0
**状态**: 设计中

---

## 项目概述

将现有的原生 JavaScript 成长助手项目全面重写为 Next.js 应用，采用移动端优先的卡片式设计，新增数据可视化、番茄钟和心情追踪功能。

### 项目目标
1. **技术升级** - 迁移到 Next.js + TypeScript 现代化技术栈
2. **UI 重设计** - 移动端优先的卡片式设计，类似原生 App 体验
3. **功能增强** - 新增数据可视化图表、番茄钟专注模式、心情追踪
4. **数据兼容** - 确保旧版数据可平滑迁移

---

## 技术架构

### 技术栈选择

| 技术 | 版本/选型 | 用途 |
|------|-----------|------|
| 框架 | Next.js 14 (App Router) | React 全栈框架 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS v4 | 原子化 CSS |
| UI 组件 | shadcn/ui | 高质量组件库 |
| 状态管理 | React Context API | 轻量级状态 + LocalStorage |
| 图表库 | Recharts | 数据可视化 |
| 动画 | Framer Motion | 流畅交互动画 |
| 图标 | Lucide React | 现代图标库 |
| 云端数据库 | Supabase (PostgreSQL) | 可选云端同步，解决数据持久化问题 |

### 项目结构

```
growth-tracker-next/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 根布局（主题、全局状态）
│   ├── page.tsx                   # 首页 / Dashboard
│   ├── stats/                     # 统计分析页
│   │   └── page.tsx
│   ├── focus/                     # 番茄钟专注页
│   │   └── page.tsx
│   └── profile/                   # 个人中心页
│       └── page.tsx
├── components/                    # React 组件
│   ├── ui/                        # shadcn/ui 组件（Button, Card, 等）
│   ├── layout/                    # 布局组件
│   │   ├── BottomNav.tsx          # 底部导航栏
│   │   └── PageContainer.tsx      # 页面容器
│   ├── features/                  # 功能组件
│   │   ├── TaskCard.tsx           # 任务打卡卡片
│   │   ├── MoodTracker.tsx        # 心情追踪器
│   │   ├── PomodoroTimer.tsx      # 番茄钟计时器
│   │   ├── StatCard.tsx           # 统计卡片
│   │   ├── AchievementCard.tsx    # 成就卡片
│   │   └── HistoryList.tsx        # 历史记录列表
│   └── charts/                    # 图表组件
│       ├── TrendChart.tsx         # 趋势图
│       └── DistributionChart.tsx  # 分布图
├── lib/                           # 工具函数
│   ├── storage.ts                 # 数据存储管理（支持云端同步）
│   ├── supabase.ts               # Supabase云端同步客户端
│   ├── migration.ts               # 旧版数据迁移
│   ├── types.ts                   # TypeScript 类型定义
│   ├── constants.ts               # 常量配置
│   └── utils.ts                   # 通用工具函数
├── hooks/                         # 自定义 Hooks
│   ├── useStorage.ts              # 数据存储 Hook
│   ├── usePomodoro.ts             # 番茄钟逻辑 Hook
│   └── useMood.ts                 # 心情追踪 Hook
├── public/                        # 静态资源
│   ├── icons/
│   └── images/
├── docs/                          # 文档
│   └── superpowers/
│       └── specs/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 数据模型

### TypeScript 类型定义

```typescript
// lib/types.ts

// 用户信息
interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string; // ISO date
}

// 任务类型
interface TaskType {
  id: number;
  name: string;
  icon: string;
  color: string;
  defaultDuration: number; // 分钟
}

// 任务记录
interface TaskRecord {
  id: string;
  type: number; // 对应 TaskType.id
  completed: boolean;
  duration: number; // 分钟
  notes?: string;
  tags: string[];
  completedAt: string; // ISO date
}

// 心情记录
type Mood = '😊' | '😐' | '😢' | '🤩' | '😴';

interface MoodRecord {
  date: string; // YYYY-MM-DD
  mood: Mood;
  note?: string;
}

// 番茄钟记录
interface PomodoroSession {
  id: string;
  duration: number; // 分钟
  taskType?: number;
  completedAt: string; // ISO date
}

// 每日记录
interface DailyRecord {
  date: string; // YYYY-MM-DD
  tasks: TaskRecord[];
  mood?: MoodRecord;
  pomodoroSessions: PomodoroSession[];
  dailyNotes?: string;
}

// 成就
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string; // ISO date
}

// 应用状态
interface AppData {
  user: User;
  taskTypes: TaskType[];
  dailyRecords: DailyRecord[];
  achievements: Achievement[];
}
```

### 默认数据

```typescript
// lib/constants.ts

const DEFAULT_TASK_TYPES: TaskType[] = [
  { id: 1, name: '读书', icon: '📚', color: '#667eea', defaultDuration: 60 },
  { id: 2, name: 'Vibe Coding', icon: '💻', color: '#764ba2', defaultDuration: 90 },
  { id: 3, name: '健身', icon: '🏋️', color: '#f093fb', defaultDuration: 45 },
  { id: 4, name: '写自媒体', icon: '📱', color: '#4facfe', defaultDuration: 60 },
  { id: 5, name: '其他', icon: '⭐', color: '#fa709a', defaultDuration: 30 },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: '新手上路', description: '完成首次打卡', icon: '🎯', unlocked: false },
  { id: 2, name: '坚持一周', description: '连续打卡7天', icon: '🔥', unlocked: false },
  { id: 3, name: '月度达人', description: '完成30天打卡', icon: '🏆', unlocked: false },
  { id: 4, name: '知识渊博', description: '读书任务完成50次', icon: '📖', unlocked: false },
  { id: 5, name: '代码大师', description: 'Vibe Coding完成100小时', icon: '👨‍💻', unlocked: false },
  { id: 6, name: '专注达人', description: '完成100个番茄钟', icon: '⏱️', unlocked: false },
];
```

### 数据迁移

从旧版 LocalStorage 读取 `growthTrackerData`，自动转换为新格式：

```typescript
// lib/migration.ts

function migrateLegacyData(legacyData: any): AppData {
  // 转换逻辑
  // 1. 保留 user, taskTypes, achievements
  // 2. 转换 dailyRecords，添加 mood 和 pomodoroSessions 字段
}
```

---

## UI/UX 设计

### 设计原则
- **移动端优先** - 设计从手机开始，向上适配平板和桌面
- **卡片式布局** - 信息分组清晰，易于浏览
- **流畅动画** - Framer Motion 提供自然的过渡效果
- **主题支持** - 深色/浅色主题切换

### 页面设计

#### 1. 首页 (Dashboard) - `/`

**布局**：
```
┌─────────────────────┐
│  日期 + 心情选择    │  ← 顶部栏
├─────────────────────┤
│  问候语卡片         │
├─────────────────────┤
│  快捷任务网格       │  ← 2x2 网格卡片
├─────────────────────┤
│  今日统计卡片       │
├─────────────────────┤
│  最近记录           │
└─────────────────────┘
│  [⏱️ 专注] 浮动按钮  │  ← 右下角
└─────────────────────┘
│  🏠  📊  ⏱️  👤      │  ← 底部导航
└─────────────────────┘
```

**功能**：
- 心情选择：5个表情按钮，点击快速记录
- 任务卡片：点击弹出详情模态框，完成打卡
- 统计卡片：今日任务、完成数、连续天数
- 浮动按钮：快速进入番茄钟

#### 2. 统计页 (Stats) - `/stats`

**布局**：
```
┌─────────────────────┐
│  ←  统计分析        │  ← 返回按钮 + 标题
├─────────────────────┤
│  [周] [月] [年] 切换 │
├─────────────────────┤
│                     │
│   📈 趋势图        │  ← Recharts 折线图
│                     │
├─────────────────────┤
│  📊 任务分布        │  ← 饼图
├─────────────────────┤
│  🏆 成就卡片        │  ← 横向滚动
└─────────────────────┘
```

**图表功能**：
- 趋势图：显示每日任务完成数量
- 分布图：各任务类型的完成比例
- 时间范围：周/月/年切换

#### 3. 专注页 (Focus) - `/focus`

**布局**：
```
┌─────────────────────┐
│  ←  专注模式        │
├─────────────────────┤
│                     │
│     ⏱️ 25:00       │  ← 大数字计时器
│     [进度环]        │
├─────────────────────┤
│  [开始] [暂停] [重置]│
├─────────────────────┤
│  选择任务类型       │
├─────────────────────┤
│  白噪音选项         │  ← 雨声、咖啡馆、白噪音
├─────────────────────┤
│  专注历史           │
└─────────────────────┘
```

**番茄钟功能**：
- 默认：25分钟专注 + 5分钟休息
- 可自定义时长
- 专注完成后自动记录
- 白噪音播放（可选）

#### 4. 个人页 (Profile) - `/profile`

**布局**：
```
┌─────────────────────┐
│  ←  个人中心        │
├─────────────────────┤
│  👤 头像 + 用户名    │
├─────────────────────┤
│  ┌───────────────┐ │
│  │ 加入时间      │ │
│  │ 总记录天数    │ │
│  │ 总专注时长    │ │
│  └───────────────┘ │
├─────────────────────┤
│  主题切换           │  ← 深色/浅色
├─────────────────────┤
│  更新日志           │
│  - 版本历史记录    │
│  - 更新内容展示    │
├─────────────────────┤
│  重置数据           │  ← 危险操作
└─────────────────────┘
```

### 组件设计

#### TaskCard 组件
```tsx
// components/features/TaskCard.tsx
Props: {
  taskType: TaskType;
  completedToday?: boolean;
  onComplete: () => void;
}
```

#### MoodTracker 组件
```tsx
// components/features/MoodTracker.tsx
Props: {
  currentMood?: Mood;
  onSelect: (mood: Mood) => void;
}
```

#### PomodoroTimer 组件
```tsx
// components/features/PomodoroTimer.tsx
Props: {
  defaultDuration?: number; // 默认25分钟
  onComplete: (duration: number) => void;
}
```

---

## 功能模块

### Phase 1：基础框架搭建
- [ ] 初始化 Next.js 项目
- [ ] 配置 TypeScript, Tailwind CSS
- [ ] 设置 shadcn/ui 组件库
- [ ] 实现基础布局（BottomNav, PageContainer）
- [ ] 设置 Context API + LocalStorage
- [ ] 实现数据迁移功能

### Phase 2：UI 重设计
- [ ] 实现首页布局和卡片
- [ ] 实现底部导航和页面切换
- [ ] 添加 Framer Motion 动画
- [ ] 实现深色/浅色主题切换
- [ ] 响应式适配

### Phase 3：数据可视化图表
- [ ] 集成 Recharts 库
- [ ] 实现任务完成趋势图
- [ ] 实现任务类型分布图
- [ ] 实现时间范围切换（周/月/年）
- [ ] 成就系统展示

### Phase 4：番茄钟专注模式
- [ ] 实现计时器逻辑（usePomodoro hook）
- [ ] 计时器 UI 组件
- [ ] 白噪音功能
- [ ] 专注历史记录
- [ ] 番茄钟成就

### Phase 5：心情追踪功能
- [ ] 心情选择组件
- [ ] 心情趋势图
- [ ] 心情与任务完成关联分析
- [ ] 历史心情记录

### Phase 6：云端同步功能（可选）
- [ ] 集成Supabase数据库
- [ ] 实现用户数据云端备份
- [ ] 支持本地存储和云端双重保障
- [ ] 提供手动同步功能
- [ ] 数据迁移工具（从本地到云端）

---

## 状态管理

### AppContext

```typescript
// hooks/useStorage.ts

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  isCloudSyncEnabled: boolean;
  toggleCloudSync: () => void;
  syncFromCloud: () => Promise<void>;
  addTaskRecord: (date: string, task: Omit<TaskRecord, 'id' | 'completedAt'>) => void;
  saveMood: (date: string, mood: Mood, note?: string) => void;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;
  saveDailyNotes: (date: string, notes: string) => void;
  resetData: () => void;
}
```

### 自定义 Hooks

- `useStorage()` - 数据存取
- `usePomodoro()` - 番茄钟状态管理
- `useMood()` - 心情追踪
- `useStats()` - 统计数据计算

---

## 实现计划

### 开发顺序

1. **Phase 1** - 基础框架（可独立运行）
2. **Phase 2** - UI 重设计（核心体验）
3. **Phase 3** - 数据可视化（增强功能）
4. **Phase 4** - 番茄钟（新功能）
5. **Phase 5** - 心情追踪（新功能）

每个 Phase 都可以独立提交和测试。

---

## 数据兼容性

- 旧版 LocalStorage 键：`growthTrackerData`
- 新版 LocalStorage 键：`growthTrackerNextData`
- 首次启动时检测旧数据，自动迁移
- 提供手动导入/导出功能
- 保留旧数据格式作为备份

---

## 验收标准

### 功能完整性
- [ ] 所有旧版功能可用
- [ ] 数据迁移正常工作
- [ ] 新增功能（图表、番茄钟、心情）正常

### 技术质量
- [ ] TypeScript 无类型错误
- [ ] 响应式适配良好
- [ ] 动画流畅自然
- [ ] 代码结构清晰

### 用户体验
- [ ] 移动端体验优秀
- [ ] 交互反馈及时
- [ ] 深色/浅色主题正常

---

## 后续优化方向（可选）

- ~~数据云同步（Firebase/Supabase）~~ ✅ 已实现Supabase云同步
- 提醒通知功能
- 社交分享功能
- ~~更多白噪音选项~~ ✅ 已实现5种音效
- ~~数据备份到云端~~ ✅ 已实现
