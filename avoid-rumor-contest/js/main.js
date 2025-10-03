// 主程序入口
class Main {
    constructor() {
        this.gameEngine = null;
        this.isLoading = true;
    }

    // 初始化主程序
    async init() {
        try {
            // 显示加载页面
            this.showLoadingScreen();
            
            // 创建游戏引擎实例
            this.gameEngine = new GameEngine();
            
            // 设置为全局实例
            window.gameEngine = this.gameEngine;
            
            // 初始化游戏引擎
            await this.gameEngine.init();
            
            // 设置事件回调
            this.setupGameCallbacks();
            
            // 模拟加载过程
            await this.simulateLoading();
            
            // 隐藏加载页面，显示游戏说明
            this.hideLoadingScreen();
            this.showGameInstructions();
            
        } catch (error) {
            console.error('主程序初始化失败:', error);
            this.showError('游戏初始化失败，请刷新页面重试');
        }
    }

    // 显示加载页面
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    // 隐藏加载页面
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // 显示游戏说明
    showGameInstructions() {
        const instructions = document.getElementById('game-instructions');
        if (instructions) {
            instructions.classList.remove('hidden');
        }
    }

    // 模拟加载过程
    async simulateLoading() {
        const progressFill = document.querySelector('.loading-screen .progress-fill');
        const loadingText = document.querySelector('.loading-text');
        
        const loadingSteps = [
            { progress: 20, text: '正在加载古都场景...' },
            { progress: 40, text: '正在准备谣言数据库...' },
            { progress: 60, text: '正在初始化游戏引擎...' },
            { progress: 80, text: '正在加载音效资源...' },
            { progress: 100, text: '加载完成！' }
        ];
        
        for (const step of loadingSteps) {
            await this.delay(800);
            
            if (progressFill) {
                progressFill.style.width = `${step.progress}%`;
            }
            
            if (loadingText) {
                loadingText.textContent = step.text;
            }
        }
        
        await this.delay(500);
    }
    
    // 添加测试气泡
    addTestBubble() {
        const testBubble = document.createElement('div');
        testBubble.className = 'bubble';
        testBubble.textContent = '测试气泡';
        testBubble.style.position = 'fixed';
        testBubble.style.left = '50%';
        testBubble.style.top = '50%';
        testBubble.style.transform = 'translate(-50%, -50%)';
        testBubble.style.zIndex = '9999';
        testBubble.style.background = 'rgba(255, 0, 0, 0.8)';
        testBubble.style.color = 'white';
        testBubble.style.padding = '10px 20px';
        testBubble.style.borderRadius = '20px';
        testBubble.style.cursor = 'pointer';
        
        document.body.appendChild(testBubble);
        
        // 3秒后移除
        setTimeout(() => {
            if (testBubble.parentNode) {
                testBubble.parentNode.removeChild(testBubble);
            }
        }, 3000);
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 设置游戏回调
    setupGameCallbacks() {
        if (!this.gameEngine) return;
        
        // 进度更新回调
        this.gameEngine.setOnProgressUpdate((sceneIndex, percentage) => {
            // 进度更新
        });
        
        // 场景完成回调
        this.gameEngine.setOnSceneComplete((sceneIndex) => {
            this.showSceneCompleteNotification(sceneIndex);
        });
        
        // 游戏完成回调
        this.gameEngine.setOnGameComplete(() => {
            // 游戏完成
        });
        
        // 气泡破裂回调已直接在游戏引擎中处理
    }

    // 显示场景完成通知
    showSceneCompleteNotification(sceneIndex) {
        const scene = this.gameEngine.sceneManager?.scenes[sceneIndex];
        if (!scene) return;
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'scene-complete-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 场景净化完成！</h3>
                <p>${scene.name} 已成功净化</p>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>❌ 错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">重试</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
        `;
        
        document.body.appendChild(errorDiv);
    }

    // 重新开始游戏
    restartGame() {
        // 先隐藏所有页面，避免残留遮罩层
        this.hideAllPages();

        // 调用引擎重置（内部会清空气泡、重置进度并切回首页）
        if (this.gameEngine) {
            this.gameEngine.restartGame();
        }

        // 再次确保首页可见
        this.showGameInstructions();
    }

    // 隐藏所有页面
    hideAllPages() {
        const pages = [
            'game-container',
            'celebration-page', 
            'completion-popup',
            'certificate-page',
            'truth-popup'
        ];
        
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('hidden');
            }
        });
    }

    // 显示证书页面
    showCertificate() {
        // 隐藏完成弹窗
        const completionPopup = document.getElementById('completion-popup');
        if (completionPopup) {
            completionPopup.classList.add('hidden');
        }
        
        // 显示证书页面
        const certificatePage = document.getElementById('certificate-page');
        if (certificatePage) {
            this.updateCertificateData();
            certificatePage.classList.remove('hidden');
        }
    }

    // 更新证书数据
    updateCertificateData() {
        const gameEngine = this.gameEngine;
        if (!gameEngine) return;
        
        // 更新证书统计数据
        const certCleanedCount = document.getElementById('cert-cleaned-count');
        const certSceneCount = document.getElementById('cert-scene-count');
        const certTotalCleaned = document.getElementById('cert-total-cleaned');
        const certTotalScenes = document.getElementById('cert-total-scenes');
        const certPurificationRate = document.getElementById('cert-purification-rate');
        const certificateDate = document.getElementById('certificate-date');
        
        if (certCleanedCount) {
            certCleanedCount.textContent = gameEngine.totalCleaned;
        }
        
        if (certSceneCount) {
            certSceneCount.textContent = gameEngine.sceneManager?.scenes.length || 0;
        }
        
        if (certTotalCleaned) {
            certTotalCleaned.textContent = gameEngine.totalCleaned;
        }
        
        if (certTotalScenes) {
            certTotalScenes.textContent = gameEngine.sceneManager?.scenes.length || 0;
        }
        
        if (certPurificationRate) {
            certPurificationRate.textContent = '100%';
        }
        
        if (certificateDate) {
            const now = new Date();
            certificateDate.textContent = now.toLocaleDateString('zh-CN');
        }
    }

    // 下载证书
    downloadCertificate() {
        // 创建证书的HTML内容
        const certificateContent = this.generateCertificateHTML();
        
        // 创建新窗口显示证书
        const printWindow = window.open('', '_blank');
        printWindow.document.write(certificateContent);
        printWindow.document.close();
        
        // 等待内容加载完成后打印
        printWindow.onload = function() {
            printWindow.print();
        };
    }

    // 生成证书HTML
    generateCertificateHTML() {
        const gameEngine = this.gameEngine;
        const totalCleaned = gameEngine?.totalCleaned || 0;
        const totalScenes = gameEngine?.sceneManager?.scenes.length || 0;
        const currentDate = new Date().toLocaleDateString('zh-CN');
        
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网络清风侠证书</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
            margin: 0;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .certificate {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
        }
        .certificate h1 {
            color: #333;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        .certificate h2 {
            color: #4CAF50;
            font-size: 1.8rem;
            margin: 0 0 2rem 0;
        }
        .certificate-text {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #333;
            margin-bottom: 2rem;
        }
        .player-name {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4CAF50;
            margin: 1rem 0;
            padding: 0.5rem;
            background: #f0f8f0;
            border-radius: 10px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 2rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 15px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-label {
            font-weight: bold;
            color: #666;
            display: block;
            margin-bottom: 0.5rem;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4CAF50;
        }
        .seal {
            background: #4CAF50;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: bold;
            display: inline-block;
            margin-top: 2rem;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                border: 2px solid #4CAF50;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>古都谣言净化录</h1>
        <h2>网络清风侠证书</h2>
        
        <div class="certificate-text">
            <p>兹证明</p>
            <div class="player-name">网络清风侠</div>
            <p>在西安市首届互联网辟谣优秀作品征集评选活动中，</p>
            <p>成功净化了 ${totalCleaned} 个谣言，</p>
            <p>完成了 ${totalScenes} 个古都场景的净化任务，</p>
            <p>为营造清朗网络空间做出了积极贡献。</p>
            <p>特此颁发此证书，以资鼓励。</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">净化总数</span>
                <span class="stat-value">${totalCleaned}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">完成场景</span>
                <span class="stat-value">${totalScenes}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">净化率</span>
                <span class="stat-value">100%</span>
            </div>
        </div>
        
        <div class="seal">西安市网络举报中心</div>
        <p style="margin-top: 1rem; color: #666;">颁发日期：${currentDate}</p>
    </div>
</body>
</html>`;
    }

    // 返回游戏
    backToGame() {
        // 重置游戏状态并返回主页
        this.restartGame();
    }

    // 处理庆祝页面确认按钮
    handleCelebrationConfirm() {
        // 重置游戏状态并返回主页
        this.restartGame();
    }

    // 添加CSS动画
    addNotificationAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .retry-btn {
                background: #f44336;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 1rem;
            }
            
            .retry-btn:hover {
                background: #d32f2f;
            }
        `;
        document.head.appendChild(style);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const main = new Main();
    
    // 添加通知动画样式
    main.addNotificationAnimations();
    
    // 初始化主程序
    await main.init();
    
    // 添加事件监听器
    setupEventListeners(main);
});

// 设置事件监听器
function setupEventListeners(main) {
    // 重新游戏按钮
    const restartBtn = document.getElementById('restart-game');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => main.restartGame());
    }

    // 游戏头部重新开始按钮
    const headerRestartBtn = document.getElementById('restart-btn');
    if (headerRestartBtn) {
        headerRestartBtn.addEventListener('click', () => main.restartGame());
    }

    // 获取证书按钮
    const getCertBtn = document.getElementById('get-certificate');
    if (getCertBtn) {
        getCertBtn.addEventListener('click', () => main.showCertificate());
    }

    // 下载证书按钮
    const downloadCertBtn = document.getElementById('download-certificate');
    if (downloadCertBtn) {
        downloadCertBtn.addEventListener('click', () => main.downloadCertificate());
    }

    // 返回游戏按钮
    const backToGameBtn = document.getElementById('back-to-game');
    if (backToGameBtn) {
        backToGameBtn.addEventListener('click', () => main.backToGame());
    }

    // 庆祝页面确认按钮
    const celebrationConfirmBtn = document.getElementById('celebration-confirm');
    if (celebrationConfirmBtn) {
        celebrationConfirmBtn.addEventListener('click', () => main.handleCelebrationConfirm());
    }
}

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (window.gameEngine) {
        if (document.hidden) {
            window.gameEngine.pauseGame();
        } else {
            window.gameEngine.resumeGame();
        }
    }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    // 重新计算气泡位置等
    if (window.gameEngine && window.gameEngine.bubbleManager) {
        // 这里可以添加响应式调整逻辑
    }
});

// 防止页面滚动（移动端）
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.bubble-container')) {
        e.preventDefault();
    }
}, { passive: false });

// 添加触摸反馈
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('bubble')) {
        // 添加触摸反馈效果
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});

// 导出主类供调试使用
window.Main = Main;

