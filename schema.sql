-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建任务类型表
CREATE TABLE IF NOT EXISTS task_types (
  id INTEGER PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  default_duration INTEGER NOT NULL DEFAULT 30,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建心情类型表
CREATE TABLE IF NOT EXISTS mood_records (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood TEXT NOT NULL CHECK(mood IN ('😊', '😐', '😢', '🤩', '😴')),
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建任务记录表
CREATE TABLE IF NOT EXISTS task_records (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  type INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  duration INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  completed_at TEXT NOT NULL,
  FOREIGN KEY (type) REFERENCES task_types(id) ON DELETE CASCADE
);

-- 创建番茄钟记录表
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 25,
  task_type INTEGER,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (task_type) REFERENCES task_types(id) ON DELETE CASCADE
);

-- 创建每日记录表
CREATE TABLE IF NOT EXISTS daily_records (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL UNIQUE,
  daily_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_task_records_user_date ON task_records(user_id, date);
CREATE INDEX idx_mood_records_user_date ON mood_records(user_id, date);
CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, date);
CREATE INDEX idx_daily_records_user_date ON daily_records(user_id, date);

-- 插入默认任务类型
INSERT INTO task_types (id, name, icon, color, default_duration) VALUES
(1, '读书', '📚', '#667eea', 60),
(2, 'Vibe Coding', '💻', '#764ba2', 90),
(3, '健身', '🏋️', '#f093fb', 45),
(4, '写自媒体', '📱', '#4facfe', 60),
(5, '其他', '⭐', '#fa709a', 30)
ON CONFLICT (id) DO NOTHING;

-- 插入默认成就
INSERT INTO achievements (id, name, description, icon) VALUES
(1, '新手上路', '完成首次打卡', '🎯'),
(2, '坚持一周', '连续打卡7天', '🔥'),
(3, '月度达人', '完成30天打卡', '🏆'),
(4, '知识渊博', '读书任务完成50次', '📖'),
(5, '代码大师', 'Vibe Coding完成100小时', '👨‍💻'),
(6, '专注达人', '完成100个番茄钟', '⏱️')
ON CONFLICT (id) DO NOTHING;