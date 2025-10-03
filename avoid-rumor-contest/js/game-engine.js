// 游戏引擎核心类
class GameEngine {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSceneIndex = 0;
        this.sceneProgress = {}; // 存储每个场景的净化进度
        this.totalCleaned = 0;
        this.sceneManager = null;
        this.bubbleManager = null;
        this.progressUpdateTimer = null;
        this.audioEnabled = false;
        
        // 事件回调
        this.onProgressUpdate = null;
        this.onSceneComplete = null;
        this.onGameComplete = null;
    }

    // 初始化游戏引擎
    async init() {
        try {
            // 加载配置
            await window.gameConfig.loadConfig();
            
            // 加载谣言数据
            await window.gameConfig.loadRumors();
            
            // 初始化场景管理器
            this.sceneManager = new SceneManager();
            await this.sceneManager.init();
            
            // 初始化气泡管理器
            this.bubbleManager = new BubbleManager();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 初始化进度数据（在场景管理器初始化之后）
            this.initializeProgress();
        
        // 设置场景切换监听
        this.sceneManager?.addSceneChangeListener((newIndex, oldIndex) => {
            this.onSceneChange(newIndex, oldIndex);
        });
        
        this.isInitialized = true;
            
        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
        }
    }

    // 设置事件监听
    setupEventListeners() {
        // 导航按钮
        const prevBtn = document.getElementById('prev-scene');
        const nextBtn = document.getElementById('next-scene');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.sceneManager.prevScene());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.sceneManager.nextScene());
        }
        
        // 真相弹窗
        const closePopupBtn = document.getElementById('close-popup');
        const continueBtn = document.getElementById('continue-game');
        
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', () => this.closeTruthPopup());
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeTruthPopup());
        }
        
        // 游戏完成弹窗
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // 音效控制
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleAudio());
        }
        
        // 开始游戏按钮
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 窗口失焦/获焦事件
        window.addEventListener('blur', () => this.pauseGame());
        window.addEventListener('focus', () => this.resumeGame());
    }

    // 初始化进度数据
    initializeProgress() {
        const scenes = this.sceneManager?.scenes || [];
        scenes.forEach((scene, index) => {
            this.sceneProgress[index] = {
                cleaned: 0,
                total: scene.bubbleCount || 4,
                percentage: 0,
                completed: false
            };
        });
    }

    // 开始游戏
    startGame() {
        if (!this.isInitialized) {
            console.error('游戏引擎未初始化');
            return;
        }
        
        this.isPlaying = true;
        this.isPaused = false;
        
        // 隐藏说明页面
        const instructions = document.getElementById('game-instructions');
        if (instructions) {
            instructions.classList.add('hidden');
        }
        
        // 显示游戏界面
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
        
        // 开始气泡生成
        this.startBubbleGeneration();
        
        // 开始进度更新
        this.startProgressUpdate();
    }

    // 暂停游戏
    pauseGame() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.bubbleManager?.pauseAllBubbles();
        this.bubbleManager?.stopSpawning();
        this.stopProgressUpdate();
    }

    // 恢复游戏
    resumeGame() {
        if (!this.isPlaying || !this.isPaused) return;
        
        this.isPaused = false;
        // 确保气泡容器存在
        if (this.bubbleManager && !this.bubbleManager.container) {
            const bubbleContainer = this.sceneManager?.getCurrentSceneElement()?.querySelector('.bubble-container');
            if (bubbleContainer) {
                this.bubbleManager.init(bubbleContainer);
            }
        }

        this.bubbleManager?.resumeAllBubbles();
        this.bubbleManager?.startSpawning();
        // 强制马上生成一个气泡，避免恢复后长时间没有新气泡
        setTimeout(() => {
            this.bubbleManager?.spawnBubble();
        }, 50);
        this.startProgressUpdate();
    }

    // 停止游戏
    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        
        this.bubbleManager?.stopSpawning();
        this.bubbleManager?.clearAllBubbles();
        this.stopProgressUpdate();
    }

    // 重新开始游戏
    restartGame() {
        this.stopGame();
        
        // 重置进度
        this.totalCleaned = 0;
        this.initializeProgress();
        
        // 重置场景
        this.sceneManager?.resetAllScenes();
        
        // 隐藏所有弹窗和页面
        this.hideAllPopups();
        
        // 显示说明页面（主页）
        const instructions = document.getElementById('game-instructions');
        if (instructions) {
            instructions.classList.remove('hidden');
        }
        
        // 隐藏游戏界面
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.classList.add('hidden');
        }
    }

    // 隐藏所有弹窗和页面
    hideAllPopups() {
        // 隐藏完成弹窗
        const completionPopup = document.getElementById('completion-popup');
        if (completionPopup) {
            completionPopup.classList.add('hidden');
        }
        
        // 隐藏庆祝页面
        const celebrationPage = document.getElementById('celebration-page');
        if (celebrationPage) {
            celebrationPage.classList.add('hidden');
        }
        
        // 隐藏证书页面
        const certificatePage = document.getElementById('certificate-page');
        if (certificatePage) {
            certificatePage.classList.add('hidden');
        }
        
        // 隐藏真相弹窗
        const truthPopup = document.getElementById('truth-popup');
        if (truthPopup) {
            truthPopup.classList.add('hidden');
        }
    }

    // 开始气泡生成
    startBubbleGeneration() {
        const currentScene = this.sceneManager?.getCurrentScene();
        if (!currentScene) return;
        
        const bubbleContainer = this.sceneManager?.getCurrentSceneElement()?.querySelector('.bubble-container');
        if (bubbleContainer) {
            this.bubbleManager?.init(bubbleContainer);
        }
    }

    // 停止气泡生成
    stopBubbleGeneration() {
        this.bubbleManager?.stopSpawning();
    }

    // 开始进度更新
    startProgressUpdate() {
        if (this.progressUpdateTimer) return;
        
        this.progressUpdateTimer = setInterval(() => {
            this.updateProgress();
        }, 100);
    }

    // 停止进度更新
    stopProgressUpdate() {
        if (this.progressUpdateTimer) {
            clearInterval(this.progressUpdateTimer);
            this.progressUpdateTimer = null;
        }
    }

    // 更新进度
    updateProgress() {
        const currentScene = this.sceneManager?.getCurrentScene();
        if (!currentScene) return;
        
        const sceneIndex = this.sceneManager?.currentSceneIndex || 0;
        const progress = this.sceneProgress[sceneIndex];
        
        if (progress) {
            const percentage = Math.round((progress.cleaned / progress.total) * 100);
            progress.percentage = percentage;
            
            // 更新UI
            this.updateProgressUI(percentage);
            
            // 检查场景是否完成
            if (percentage >= 100 && !progress.completed) {
                this.completeScene(sceneIndex);
            }
            
            // 触发进度更新事件
            if (this.onProgressUpdate) {
                this.onProgressUpdate(sceneIndex, percentage);
            }
        }
    }

    // 更新进度UI
    updateProgressUI(percentage) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const cleanedCount = document.getElementById('cleaned-count');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
        
        if (cleanedCount) {
            cleanedCount.textContent = this.totalCleaned;
        }
    }

    // 处理气泡破裂
    onBubbleBurst(bubble) {
        if (!bubble) return;
        
        // 增加净化计数
        this.totalCleaned++;
        
        // 更新当前场景进度
        const sceneIndex = this.sceneManager?.currentSceneIndex || 0;
        const progress = this.sceneProgress[sceneIndex];
        
        if (progress) {
            progress.cleaned = Math.min(progress.cleaned + 1, progress.total);
            
            // 立即更新进度显示
            const percentage = Math.round((progress.cleaned / progress.total) * 100);
            progress.percentage = percentage;
            this.updateProgressUI(percentage);
            
            // 更新导航按钮状态
            this.sceneManager?.updateNavigationButtons();
            
            // 检查场景是否完成
            if (percentage >= 100 && !progress.completed) {
                this.completeScene(sceneIndex);
            }
        }
        
        // 显示真相弹窗
        this.showTruthPopup(bubble);
    }

    // 显示真相弹窗
    showTruthPopup(bubble) {
        const popup = document.getElementById('truth-popup');
        const rumorText = document.getElementById('popup-rumor-text');
        const truthText = document.getElementById('popup-truth-text');
        const rumorType = document.getElementById('popup-rumor-type');
        
        if (popup && rumorText && truthText && rumorType) {
            rumorText.textContent = bubble.text;
            truthText.textContent = bubble.truth;
            rumorType.textContent = bubble.type;
            
            popup.classList.remove('hidden');
            popup.classList.add('popup-slide-in');
        }
    }

    // 关闭真相弹窗
    closeTruthPopup() {
        const popup = document.getElementById('truth-popup');
        if (popup) {
            popup.classList.add('popup-slide-out');
            
            setTimeout(() => {
                popup.classList.add('hidden');
                popup.classList.remove('popup-slide-in', 'popup-slide-out');
            }, 300);
        }
    }

    // 完成场景
    completeScene(sceneIndex) {
        const progress = this.sceneProgress[sceneIndex];
        if (progress) {
            progress.completed = true;
        }
        
        // 净化场景
        this.sceneManager?.purifyScene(sceneIndex);
        
        // 检查是否所有场景都完成
        const allCompleted = Object.values(this.sceneProgress).every(p => p.completed);
        
        if (allCompleted) {
            this.completeGame();
        } else {
            // 解锁下一个场景
            this.unlockNextScene(sceneIndex);
        }
        
        // 触发场景完成事件
        if (this.onSceneComplete) {
            this.onSceneComplete(sceneIndex);
        }
    }

    // 解锁下一个场景
    unlockNextScene(currentSceneIndex) {
        const nextSceneIndex = currentSceneIndex + 1;
        if (nextSceneIndex < this.sceneManager?.scenes.length) {
            // 这里可以添加解锁动画或提示
        }
    }

    // 完成游戏
    completeGame() {
        this.stopGame();
        
        // 显示庆祝页面
        this.showCelebrationPage();
        
        // 触发游戏完成事件
        if (this.onGameComplete) {
            this.onGameComplete();
        }
    }

    // 显示庆祝页面
    showCelebrationPage() {
        const celebrationPage = document.getElementById('celebration-page');
        const celebrationCleanedCount = document.getElementById('celebration-cleaned-count');
        const celebrationSceneCount = document.getElementById('celebration-scene-count');
        
        if (celebrationPage) {
            // 更新统计数据
            if (celebrationCleanedCount) {
                celebrationCleanedCount.textContent = this.totalCleaned;
            }
            
            if (celebrationSceneCount) {
                celebrationSceneCount.textContent = this.sceneManager?.scenes.length || 0;
            }
            
            // 显示庆祝页面
            celebrationPage.classList.remove('hidden');
            
            // 添加庆祝动画效果
            this.addCelebrationEffect();
        }
    }

    // 添加庆祝效果
    addCelebrationEffect() {
        // 创建彩带效果
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 100);
        }
    }

    // 创建彩带
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${this.getRandomColor()};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 1000;
            animation: confettiFall 3s linear forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }

    // 获取随机颜色
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 获取当前场景
    getCurrentScene() {
        return this.sceneManager?.getCurrentScene();
    }

    // 获取场景进度
    getSceneProgress(sceneIndex) {
        const progress = this.sceneProgress[sceneIndex];
        return progress ? progress.percentage : 0;
    }

    // 切换音效
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        
        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.textContent = this.audioEnabled ? '🔊' : '🔇';
        }
    }

    // 处理键盘事件
    handleKeydown(event) {
        if (!this.isPlaying) return;
        
        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.isPaused ? this.resumeGame() : this.pauseGame();
                break;
            case 'Escape':
                this.pauseGame();
                break;
            case 'ArrowLeft':
                this.sceneManager?.prevScene();
                break;
            case 'ArrowRight':
                this.sceneManager?.nextScene();
                break;
        }
    }

    // 处理场景切换
    onSceneChange(newIndex, oldIndex) {
        
        // 停止当前场景的气泡生成
        this.bubbleManager?.stopSpawning();
        this.bubbleManager?.clearAllBubbles();
        
        // 重新开始新场景的气泡生成
        if (this.isPlaying) {
            this.startBubbleGeneration();
        }
    }

    // 设置事件回调
    setOnProgressUpdate(callback) {
        this.onProgressUpdate = callback;
    }

    setOnSceneComplete(callback) {
        this.onSceneComplete = callback;
    }

    setOnGameComplete(callback) {
        this.onGameComplete = callback;
    }

}

