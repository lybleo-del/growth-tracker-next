/**
 * 用户界面管理器 - 负责界面渲染和交互
 */

import storage from './storage.js';

class UIManager {
    constructor() {
        this.currentPage = 'home';
        this.historyEnabled = true;
        this.initElements();
        this.initHistory();
    }

    initElements() {
        // 页面元素
        this.splashScreen = document.getElementById('splashScreen');
        this.appContainer = document.getElementById('app');
        this.currentDateElement = document.getElementById('currentDate');
        this.weekdayElement = document.getElementById('weekday');
        this.greetingTextElement = document.getElementById('greetingText');
        this.taskGridElement = document.getElementById('taskGrid');
        this.todayTasksElement = document.getElementById('todayTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        this.streakDaysElement = document.getElementById('streakDays');
        this.historyContainerElement = document.getElementById('historyContainer');
        this.dailyNotesElement = document.getElementById('dailyNotes');
        this.saveNotesButton = document.getElementById('saveNotes');
        this.taskModal = document.getElementById('taskModal');
        this.closeModalButton = document.getElementById('closeModal');
        this.taskForm = document.getElementById('taskForm');
        this.joinDateElement = document.getElementById('joinDate');
        this.totalDaysElement = document.getElementById('totalDays');
        this.taskDistributionElement = document.getElementById('taskDistribution');
        this.achievementsGridElement = document.getElementById('achievementsGrid');
        this.notification = document.getElementById('notification');
        this.addPlanButton = document.getElementById('addPlan');

        // 导航按钮
        this.navItems = document.querySelectorAll('.nav-item');

        // 添加事件监听
        this.initEventListeners();
    }

    initHistory() {
        // 监听浏览器历史变化
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.switchPage(e.state.page, false); // 不记录历史
            } else {
                // 如果没有状态，默认返回首页
                this.switchPage('home', false);
            }
        });

        // 初始化历史状态
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.endsWith('index.html')) {
            const page = currentPath.split('/').pop().replace('.html', '');
            if (['stats', 'tasks', 'profile'].includes(page)) {
                this.switchPage(page, false);
            }
        }
    }

    initEventListeners() {
        // 页面导航
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });

        // 保存每日感悟
        this.saveNotesButton.addEventListener('click', () => {
            this.saveDailyNotes();
        });

        // 模态框操作
        this.closeModalButton.addEventListener('click', () => {
            this.closeModal();
        });
        this.taskModal.addEventListener('click', (e) => {
            if (e.target === this.taskModal) {
                this.closeModal();
            }
        });
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitTaskForm();
        });

        // 点击任务卡片
        this.taskGridElement.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card');
            if (taskCard) {
                const taskTypeId = parseInt(taskCard.dataset.taskType);
                this.openTaskModal(taskTypeId);
            }
        });

        // 添加任务按钮
        const addPlanButton = document.getElementById('addPlan');
        if (addPlanButton) {
            addPlanButton.addEventListener('click', () => {
                this.openTaskModal();
            });
        }

        // 返回按钮
        const backButtons = document.querySelectorAll('.btn-back');
        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchPage('home');
            });
        });

        // 统计页面返回
        const backFromStats = document.getElementById('backFromStats');
        if (backFromStats) {
            backFromStats.addEventListener('click', () => {
                this.switchPage('home');
            });
        }

        // 任务页面返回
        const backFromTasks = document.getElementById('backFromTasks');
        if (backFromTasks) {
            backFromTasks.addEventListener('click', () => {
                this.switchPage('home');
            });
        }

        // 个人页面返回
        const backFromProfile = document.getElementById('backFromProfile');
        if (backFromProfile) {
            backFromProfile.addEventListener('click', () => {
                this.switchPage('home');
            });
        }
    }

    // 显示通知
    showNotification(message, type = 'success') {
        const notificationContent = this.notification.querySelector('.notification-content');
        const notificationIcon = this.notification.querySelector('.notification-icon');
        const notificationMessage = this.notification.querySelector('.notification-message');

        // 设置类型
        this.notification.className = `notification ${type}`;

        // 设置图标
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        notificationIcon.textContent = icons[type] || 'ℹ️';

        // 设置消息
        notificationMessage.textContent = message;

        // 显示通知
        this.notification.style.display = 'block';

        // 自动隐藏
        setTimeout(() => {
            this.hideNotification();
        }, 3000);
    }

    hideNotification() {
        this.notification.style.display = 'none';
    }

    // 页面切换
    switchPage(page, addToHistory = true) {
        if (page === this.currentPage) return;

        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(el => {
            el.classList.add('hidden');
        });

        // 移除所有导航激活状态
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });

        // 显示目标页面
        if (page !== 'home') {
            const pageElement = document.getElementById(`${page}Page`);
            if (pageElement) {
                pageElement.classList.remove('hidden');
            }
        }

        // 更新导航状态
        const activeNav = Array.from(this.navItems).find(item => item.dataset.page === page);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // 更新页面标题
        this.updatePageTitle(page);

        // 渲染页面内容
        if (page === 'stats') {
            this.renderStatsPage();
        } else if (page === 'tasks') {
            this.renderTasksPage();
        } else if (page === 'profile') {
            this.renderProfilePage();
        } else {
            this.renderHomePage();
        }

        // 添加到浏览器历史
        if (addToHistory && this.historyEnabled) {
            const url = page === 'home' ? '#' : `#${page}`;
            window.history.pushState({ page: page }, '', url);
        }

        this.currentPage = page;
    }

    updatePageTitle(page) {
        const titles = {
            home: '成长助手 | 个人成长陪伴工具',
            stats: '📊 统计分析',
            tasks: '📝 任务管理',
            profile: '👤 个人中心'
        };
        document.title = titles[page] || titles.home;
    }

    // 显示模态框
    openTaskModal(taskTypeId = null) {
        this.taskModal.classList.add('active');

        // 重置表单
        this.taskForm.reset();

        // 如果有任务类型，设置默认值
        if (taskTypeId) {
            document.getElementById('taskType').value = taskTypeId;
            const taskType = storage.getData().taskTypes.find(t => t.id === taskTypeId);
            if (taskType) {
                document.getElementById('taskDuration').value = taskType.defaultDuration;
            }
        }
    }

    closeModal() {
        this.taskModal.classList.remove('active');
    }

    // 提交任务表单
    submitTaskForm() {
        const formData = {
            id: Date.now(),
            type: parseInt(document.getElementById('taskType').value),
            completed: true,
            duration: parseInt(document.getElementById('taskDuration').value),
            notes: document.getElementById('taskNotes').value,
            tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            completedAt: new Date().toISOString()
        };

        const today = storage.formatDate(new Date());
        storage.addTaskRecord(today, formData);

        this.closeModal();
        this.showNotification('任务完成！🎉', 'success');
        this.renderHomePage();
    }

    // 渲染首页
    renderHomePage() {
        this.renderDate();
        this.renderGreeting();
        this.renderTaskGrid();
        this.renderStats();
        this.renderHistory();
        this.renderDailyNotes();
    }

    // 渲染日期
    renderDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const weekdayOptions = { weekday: 'long' };

        this.currentDateElement.textContent = now.toLocaleDateString('zh-CN', options);
        this.weekdayElement.textContent = now.toLocaleDateString('zh-CN', weekdayOptions);
    }

    // 渲染问候语
    renderGreeting() {
        const hour = new Date().getHours();
        let greeting = '';

        if (hour < 6) {
            greeting = '🌙 夜深了，注意休息哦';
        } else if (hour < 9) {
            greeting = '🌅 早上好！新的一天，新的成长！';
        } else if (hour < 12) {
            greeting = '☀️ 上午好！学习效率很高哦！';
        } else if (hour < 14) {
            greeting = '🍱 中午好！休息一下，准备下午的学习！';
        } else if (hour < 18) {
            greeting = '🌤️ 下午好！保持学习的热情！';
        } else if (hour < 21) {
            greeting = '🌆 晚上好！复盘今天的收获！';
        } else {
            greeting = '🌙 夜深了，回顾一下今天的学习成果吧';
        }

        this.greetingTextElement.innerHTML = `<span class="wave">👋</span> ${greeting}`;
    }

    // 渲染任务网格
    renderTaskGrid() {
        const taskTypes = storage.getData().taskTypes;
        const today = storage.formatDate(new Date());
        const todayRecord = storage.getTodayRecords();

        this.taskGridElement.innerHTML = '';

        taskTypes.forEach(taskType => {
            const isCompleted = todayRecord && todayRecord.tasks.some(task => task.type === taskType.id && task.completed);
            const taskCount = todayRecord ? todayRecord.tasks.filter(task => task.type === taskType.id).length : 0;

            const taskCard = document.createElement('div');
            taskCard.className = `task-card ${isCompleted ? 'completed' : ''}`;
            taskCard.dataset.taskType = taskType.id;

            taskCard.innerHTML = `
                <div class="task-icon">${taskType.icon}</div>
                <div class="task-name">${taskType.name}</div>
                <div class="task-progress">
                    ${isCompleted ? '✅ 已完成' : `📊 ${taskCount}次`}
                </div>
            `;

            this.taskGridElement.appendChild(taskCard);
        });
    }

    // 渲染统计数据
    renderStats() {
        const stats = storage.getTaskStats();
        const taskTypes = storage.getData().taskTypes;

        this.todayTasksElement.textContent = taskTypes.length;
        this.completedTasksElement.textContent = stats.completedTasks;
        this.streakDaysElement.textContent = stats.streakDays;
    }

    // 渲染历史记录
    renderHistory() {
        const records = storage.getData().dailyRecords.slice(-7).reverse();

        this.historyContainerElement.innerHTML = '';

        if (records.length === 0) {
            this.historyContainerElement.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                    <div>还没有打卡记录，开始你的第一天吧！</div>
                </div>
            `;
            return;
        }

        records.forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
            });

            const tasksHTML = record.tasks.map(task => {
                const taskType = storage.getData().taskTypes.find(t => t.id === task.type);
                return `
                    <div class="history-task">
                        <div class="history-task-icon">${taskType?.icon || '📝'}</div>
                        <div class="history-task-info">
                            <div class="history-task-name">${taskType?.name || '其他'}</div>
                            ${task.notes ? `<div class="history-task-notes">${task.notes}</div>` : ''}
                        </div>
                        <div class="history-task-duration">${task.duration}分钟</div>
                    </div>
                `;
            }).join('');

            historyItem.innerHTML = `
                <div class="history-date">${formattedDate}</div>
                <div class="history-tasks">
                    ${tasksHTML}
                </div>
            `;

            this.historyContainerElement.appendChild(historyItem);
        });
    }

    // 渲染每日感悟
    renderDailyNotes() {
        const today = storage.formatDate(new Date());
        const todayRecord = storage.getTodayRecords();

        if (todayRecord && todayRecord.dailyNotes) {
            this.dailyNotesElement.value = todayRecord.dailyNotes;
        }
    }

    // 保存每日感悟
    saveDailyNotes() {
        const today = storage.formatDate(new Date());
        const notes = this.dailyNotesElement.value;
        storage.saveDailyNotes(today, notes);
        this.showNotification('每日感悟已保存！', 'success');
    }

    // 渲染统计页面
    renderStatsPage() {
        this.renderTaskDistribution();
        this.renderAchievements();
    }

    // 渲染任务分布
    renderTaskDistribution() {
        const distribution = storage.getTaskStats().taskDistribution;
        const taskTypes = storage.getData().taskTypes;

        this.taskDistributionElement.innerHTML = '';

        taskTypes.forEach(taskType => {
            const count = distribution[taskType.id] || 0;

            const distributionItem = document.createElement('div');
            distributionItem.className = 'distribution-item';

            distributionItem.innerHTML = `
                <div class="distribution-info">
                    <div class="distribution-icon">${taskType.icon}</div>
                    <div class="distribution-name">${taskType.name}</div>
                </div>
                <div class="distribution-count">${count}</div>
            `;

            this.taskDistributionElement.appendChild(distributionItem);
        });
    }

    // 渲染成就
    renderAchievements() {
        const achievements = storage.getData().achievements;

        this.achievementsGridElement.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'achievement-card';

            achievementCard.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${achievement.unlocked ?
                    `<div class="achievement-date">
                        获得于 ${achievement.unlockedAt}
                    </div>` :
                    `<div class="achievement-date">
                        🔒 未解锁
                    </div>`
                }
            `;

            this.achievementsGridElement.appendChild(achievementCard);
        });
    }

    // 渲染任务管理页面
    renderTasksPage() {
        const taskTypes = storage.getData().taskTypes;
        const typeListElement = document.getElementById('typeList');

        typeListElement.innerHTML = '';

        taskTypes.forEach(taskType => {
            const typeItem = document.createElement('div');
            typeItem.className = 'type-item';

            typeItem.innerHTML = `
                <div class="type-info">
                    <div class="type-icon">${taskType.icon}</div>
                    <div class="type-details">
                        <div class="type-name">${taskType.name}</div>
                        <div class="type-count">
                            ${storage.getTaskStats().taskDistribution[taskType.id] || 0} 次
                        </div>
                    </div>
                </div>
            `;

            typeListElement.appendChild(typeItem);
        });
    }

    // 渲染个人页面
    renderProfilePage() {
        const userData = storage.getData().user;
        const totalDays = storage.getData().dailyRecords.length;

        this.joinDateElement.textContent = userData.createdAt;
        this.totalDaysElement.textContent = totalDays;

        // 添加导出数据按钮事件
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            const exportBtn = settingsSection.querySelector('.btn-secondary');
            if (exportBtn) {
                // 确保事件只绑定一次
                exportBtn.removeEventListener('click', this.exportDataHandler);
                this.exportDataHandler = () => {
                    this.exportData();
                };
                exportBtn.addEventListener('click', this.exportDataHandler);
            }
        }
    }

    // 导出数据
    exportData() {
        const data = storage.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `growth-tracker-data-${storage.formatDate(new Date())}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();

        this.showNotification('数据导出成功！', 'success');
    }

    // 显示启动界面
    showSplashScreen(callback) {
        this.splashScreen.classList.remove('hidden');
        this.splashScreen.classList.add('active');

        // 模拟加载动画
        const loadingProgress = this.splashScreen.querySelector('.loading-progress');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.splashScreen.classList.remove('active');
                    this.splashScreen.classList.add('hidden');
                    if (callback) callback();
                }, 500);
            }
            loadingProgress.style.width = progress + '%';
        }, 200);
    }
}

// 导出单例实例
const ui = new UIManager();
export default ui;
