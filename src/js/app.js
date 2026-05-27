/**
 * 成长助手 - 主应用程序
 * 整合所有模块，初始化应用
 */

import storage from './storage.js';
import ui from './ui.js';

class GrowthTrackerApp {
    constructor() {
        this.isReady = false;
    }

    // 应用初始化
    async init() {
        try {
            console.log('🚀 正在初始化成长助手...');

            // 1. 初始化数据存储
            storage.initData();
            console.log('✅ 数据存储初始化完成');

            // 2. 显示启动界面
            await this.showSplashScreen();

            // 3. 渲染主页
            ui.renderHomePage();
            console.log('✅ 页面渲染完成');

            this.isReady = true;
            console.log('🎉 成长助手启动成功！');

            // 检查新成就解锁
            this.checkNewAchievements();

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            ui.showNotification('应用启动失败，请刷新重试', 'error');
        }
    }

    // 显示启动界面
    showSplashScreen() {
        return new Promise((resolve) => {
            ui.showSplashScreen(resolve);
        });
    }

    // 检查新成就解锁
    checkNewAchievements() {
        const data = storage.getData();
        const recentAchievements = data.achievements.filter(
            achievement => achievement.unlocked && achievement.unlockedAt === storage.formatDate(new Date())
        );

        if (recentAchievements.length > 0) {
            recentAchievements.forEach(achievement => {
                setTimeout(() => {
                    ui.showNotification(`🎉 解锁成就: ${achievement.name}`, 'success');
                }, 1000);
            });
        }
    }

    // 每日重置检查
    checkDailyReset() {
        const lastVisit = localStorage.getItem('lastVisit');
        const today = storage.formatDate(new Date());

        if (lastVisit !== today) {
            localStorage.setItem('lastVisit', today);
            console.log('📅 新的一天，新的开始！');
        }
    }

    // 获取数据快照
    getSnapshot() {
        return {
            data: storage.getData(),
            stats: storage.getTaskStats(),
            currentPage: ui.currentPage
        };
    }

    // 导出数据
    exportData() {
        try {
            storage.exportData();
            ui.showNotification('数据导出成功！', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            ui.showNotification('数据导出失败', 'error');
        }
    }

    // 导入数据
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonStr = e.target.result;
                if (storage.importData(jsonStr)) {
                    ui.renderHomePage();
                    ui.showNotification('数据导入成功！', 'success');
                    resolve(true);
                } else {
                    ui.showNotification('数据格式错误', 'error');
                    reject(new Error('Invalid data format'));
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // 重置所有数据
    resetAllData() {
        if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
            localStorage.removeItem(storage.KEY_DATA);
            localStorage.removeItem('lastVisit');
            storage.initData();
            ui.renderHomePage();
            ui.showNotification('数据已重置', 'success');
        }
    }
}

// 创建应用实例
const app = new GrowthTrackerApp();

// 暴露全局方法（用于调试和开发）
window.GrowthTrackerApp = {
    app,
    storage,
    ui
};

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    app.checkDailyReset();
});

export default app;
