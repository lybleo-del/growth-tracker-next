/**
 * 本地存储管理器 - 负责数据的存储和读取
 */

class StorageManager {
    constructor() {
        this.KEY_DATA = 'growthTrackerData';
        this.defaultData = {
            user: {
                id: this.generateId(),
                name: '用户名',
                avatar: '👤',
                createdAt: this.formatDate(new Date())
            },
            taskTypes: [
                { id: 1, name: '读书', icon: '📚', color: '#667eea', defaultDuration: 60 },
                { id: 2, name: 'Vibe Coding', icon: '💻', color: '#764ba2', defaultDuration: 90 },
                { id: 3, name: '健身', icon: '🏋️', color: '#f093fb', defaultDuration: 45 },
                { id: 4, name: '写自媒体', icon: '📱', color: '#4facfe', defaultDuration: 60 },
                { id: 5, name: '其他', icon: '⭐', color: '#fa709a', defaultDuration: 30 }
            ],
            dailyRecords: [],
            achievements: [
                {
                    id: 1,
                    name: '新手上路',
                    description: '完成首次打卡',
                    icon: '🎯',
                    unlocked: false,
                    unlockedAt: null
                },
                {
                    id: 2,
                    name: '坚持一周',
                    description: '连续打卡7天',
                    icon: '🔥',
                    unlocked: false,
                    unlockedAt: null
                },
                {
                    id: 3,
                    name: '月度达人',
                    description: '完成30天打卡',
                    icon: '🏆',
                    unlocked: false,
                    unlockedAt: null
                },
                {
                    id: 4,
                    name: '知识渊博',
                    description: '读书任务完成50次',
                    icon: '📖',
                    unlocked: false,
                    unlockedAt: null
                },
                {
                    id: 5,
                    name: '代码大师',
                    description: 'Vibe Coding完成100小时',
                    icon: '👨‍💻',
                    unlocked: false,
                    unlockedAt: null
                }
            ]
        };
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 格式化日期 (YYYY-MM-DD)
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 获取当前日期的记录
    getTodayRecords() {
        const today = this.formatDate(new Date());
        const records = this.getData();
        return records.dailyRecords.find(record => record.date === today);
    }

    // 初始化数据
    initData() {
        const existingData = localStorage.getItem(this.KEY_DATA);
        if (!existingData) {
            localStorage.setItem(this.KEY_DATA, JSON.stringify(this.defaultData));
            console.log('数据初始化成功');
        }
    }

    // 获取所有数据
    getData() {
        const data = localStorage.getItem(this.KEY_DATA);
        return data ? JSON.parse(data) : this.defaultData;
    }

    // 保存数据
    saveData(data) {
        localStorage.setItem(this.KEY_DATA, JSON.stringify(data));
    }

    // 添加每日记录
    addDailyRecord(date, tasks = [], mood = '😊', dailyNotes = '') {
        const data = this.getData();
        const existingRecordIndex = data.dailyRecords.findIndex(record => record.date === date);

        if (existingRecordIndex !== -1) {
            // 更新现有记录
            data.dailyRecords[existingRecordIndex].tasks = tasks;
            data.dailyRecords[existingRecordIndex].mood = mood;
            data.dailyRecords[existingRecordIndex].dailyNotes = dailyNotes;
        } else {
            // 添加新记录
            data.dailyRecords.push({
                date,
                tasks,
                mood,
                dailyNotes
            });
        }

        this.saveData(data);
    }

    // 添加任务记录
    addTaskRecord(date, task) {
        const data = this.getData();
        const record = data.dailyRecords.find(r => r.date === date);

        if (record) {
            const taskIndex = record.tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                record.tasks[taskIndex] = task;
            } else {
                record.tasks.push(task);
            }
        } else {
            data.dailyRecords.push({
                date,
                tasks: [task],
                mood: '😊',
                dailyNotes: ''
            });
        }

        this.saveData(data);
        this.checkAchievements();
    }

    // 保存每日感悟
    saveDailyNotes(date, notes) {
        const data = this.getData();
        const record = data.dailyRecords.find(r => r.date === date);

        if (record) {
            record.dailyNotes = notes;
        } else {
            data.dailyRecords.push({
                date,
                tasks: [],
                mood: '😊',
                dailyNotes: notes
            });
        }

        this.saveData(data);
    }

    // 获取任务统计
    getTaskStats() {
        const data = this.getData();
        const today = this.formatDate(new Date());
        const todayRecord = data.dailyRecords.find(record => record.date === today);

        const stats = {
            totalTasks: data.taskTypes.length,
            completedTasks: todayRecord ? todayRecord.tasks.filter(task => task.completed).length : 0,
            streakDays: this.getStreakDays(),
            totalHours: this.getTotalHours(),
            taskDistribution: this.getTaskDistribution()
        };

        return stats;
    }

    // 获取连续打卡天数
    getStreakDays() {
        const data = this.getData();
        if (data.dailyRecords.length === 0) return 0;

        // 按日期降序排序
        const sortedRecords = [...data.dailyRecords].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < sortedRecords.length; i++) {
            const recordDate = new Date(sortedRecords[i].date);
            const diffTime = Math.abs(today - recordDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === i && sortedRecords[i].tasks.length > 0) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // 获取总学习时长
    getTotalHours() {
        const data = this.getData();
        let totalMinutes = 0;

        data.dailyRecords.forEach(record => {
            record.tasks.forEach(task => {
                if (task.completed && task.duration) {
                    totalMinutes += task.duration;
                }
            });
        });

        return Math.floor(totalMinutes / 60);
    }

    // 获取任务分布
    getTaskDistribution() {
        const data = this.getData();
        const distribution = {};

        data.taskTypes.forEach(taskType => {
            distribution[taskType.id] = 0;
        });

        data.dailyRecords.forEach(record => {
            record.tasks.forEach(task => {
                if (task.completed) {
                    distribution[task.type] = (distribution[task.type] || 0) + 1;
                }
            });
        });

        return distribution;
    }

    // 检查成就解锁
    checkAchievements() {
        const data = this.getData();
        const stats = this.getTaskStats();

        // 检查新手上路成就
        if (stats.completedTasks > 0 && !data.achievements[0].unlocked) {
            data.achievements[0].unlocked = true;
            data.achievements[0].unlockedAt = this.formatDate(new Date());
        }

        // 检查坚持一周成就
        if (stats.streakDays >= 7 && !data.achievements[1].unlocked) {
            data.achievements[1].unlocked = true;
            data.achievements[1].unlockedAt = this.formatDate(new Date());
        }

        // 检查月度达人成就
        if (data.dailyRecords.length >= 30 && !data.achievements[2].unlocked) {
            data.achievements[2].unlocked = true;
            data.achievements[2].unlockedAt = this.formatDate(new Date());
        }

        // 检查知识渊博成就
        const bookTasks = this.getTaskDistribution()[1] || 0;
        if (bookTasks >= 50 && !data.achievements[3].unlocked) {
            data.achievements[3].unlocked = true;
            data.achievements[3].unlockedAt = this.formatDate(new Date());
        }

        // 检查代码大师成就
        const codingHours = this.getCodingHours();
        if (codingHours >= 100 && !data.achievements[4].unlocked) {
            data.achievements[4].unlocked = true;
            data.achievements[4].unlockedAt = this.formatDate(new Date());
        }

        this.saveData(data);
    }

    // 获取编程时长
    getCodingHours() {
        const data = this.getData();
        let codingMinutes = 0;

        data.dailyRecords.forEach(record => {
            record.tasks.forEach(task => {
                if (task.completed && task.type === 2 && task.duration) {
                    codingMinutes += task.duration;
                }
            });
        });

        return Math.floor(codingMinutes / 60);
    }

    // 导出数据
    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `growth-tracker-data-${this.formatDate(new Date())}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // 导入数据
    importData(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            this.saveData(data);
            return true;
        } catch (error) {
            console.error('数据导入失败:', error);
            return false;
        }
    }
}

// 导出单例实例
const storage = new StorageManager();
export default storage;
