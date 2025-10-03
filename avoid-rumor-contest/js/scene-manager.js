// 场景管理器
class SceneManager {
    constructor() {
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.sceneWrapper = null;
        this.isTransitioning = false;
    }

    // 初始化场景管理器
    async init() {
        // 加载场景数据
        const scenesData = await window.gameConfig.loadScenes();
        this.scenes = scenesData.scenes || [];
        
        // 获取场景容器
        this.sceneWrapper = document.getElementById('scene-wrapper');
        
        if (!this.sceneWrapper) {
            console.error('场景容器未找到');
            return;
        }
        
        // 创建场景元素
        this.createScenes();
        
        // 显示第一个场景
        if (this.scenes.length > 0) {
            this.showScene(0);
        }
    }

    // 创建场景元素
    createScenes() {
        this.scenes.forEach((sceneData, index) => {
            const sceneElement = this.createSceneElement(sceneData, index);
            this.sceneWrapper.appendChild(sceneElement);
        });
    }

    // 创建单个场景元素
    createSceneElement(sceneData, index) {
        const scene = document.createElement('div');
        scene.className = 'scene';
        scene.dataset.sceneId = sceneData.id;
        scene.dataset.sceneIndex = index;
        
        // 设置背景图片
        scene.style.backgroundImage = `url('${sceneData.image}')`;
        
        // 添加污染状态（初始状态）
        scene.classList.add('polluted');
        
        // 如果不是第一个场景，隐藏
        if (index !== 0) {
            scene.classList.add('hidden');
        } else {
            scene.classList.add('active');
        }
        
        // 创建气泡容器
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'bubble-container';
        scene.appendChild(bubbleContainer);
        
        return scene;
    }

    // 显示指定场景
    showScene(index) {
        if (this.isTransitioning || index < 0 || index >= this.scenes.length) {
            return;
        }
        
        this.isTransitioning = true;
        
        // 记录旧场景索引
        const oldIndex = this.currentSceneIndex;
        
        // 隐藏当前场景
        const currentScene = this.getCurrentSceneElement();
        if (currentScene) {
            currentScene.classList.remove('active');
            currentScene.classList.add('hidden');
        }
        
        // 显示新场景
        const newScene = this.getSceneElement(index);
        if (newScene) {
            newScene.classList.remove('hidden');
            newScene.classList.add('active');
            
            // 添加淡入动画
            newScene.classList.add('scene-fade-in');
            
            setTimeout(() => {
                newScene.classList.remove('scene-fade-in');
            }, 1500);
        }
        
        this.currentSceneIndex = index;
        
        // 更新场景名称显示
        this.updateSceneName();
        
        // 更新导航按钮状态
        this.updateNavigationButtons();
        
        // 触发场景切换事件
        this.triggerSceneChange(index, oldIndex);
        
        // 延迟结束过渡状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1500);
    }

    // 切换到下一个场景
    nextScene() {
        const nextIndex = this.currentSceneIndex + 1;
        if (nextIndex < this.scenes.length) {
            this.showScene(nextIndex);
        }
    }

    // 切换到上一个场景
    prevScene() {
        const prevIndex = this.currentSceneIndex - 1;
        if (prevIndex >= 0) {
            this.showScene(prevIndex);
        }
    }

    // 获取当前场景数据
    getCurrentScene() {
        return this.scenes[this.currentSceneIndex] || null;
    }

    // 获取当前场景元素
    getCurrentSceneElement() {
        return this.getSceneElement(this.currentSceneIndex);
    }

    // 获取指定索引的场景元素
    getSceneElement(index) {
        return this.sceneWrapper.querySelector(`[data-scene-index="${index}"]`);
    }

    // 更新场景名称显示
    updateSceneName() {
        const currentScene = this.getCurrentScene();
        const sceneNameElement = document.getElementById('current-scene-name');
        
        if (currentScene && sceneNameElement) {
            sceneNameElement.textContent = currentScene.name;
        }
    }

    // 更新导航按钮状态
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-scene');
        const nextBtn = document.getElementById('next-scene');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSceneIndex <= 0;
        }
        
        if (nextBtn) {
            // 检查下一个场景是否已解锁
            const nextSceneIndex = this.currentSceneIndex + 1;
            const isNextSceneUnlocked = this.isSceneUnlocked(nextSceneIndex);
            nextBtn.disabled = this.currentSceneIndex >= this.scenes.length - 1 || !isNextSceneUnlocked;
            
            // 更新按钮文本
            if (!isNextSceneUnlocked && nextSceneIndex < this.scenes.length) {
                nextBtn.textContent = `下一场景 (需${this.scenes[nextSceneIndex]?.unlockProgress || 70}%)`;
            } else {
                nextBtn.textContent = '下一场景';
            }
        }
    }

    // 净化场景
    purifyScene(sceneIndex) {
        const sceneElement = this.getSceneElement(sceneIndex);
        if (sceneElement) {
            sceneElement.classList.remove('polluted');
            sceneElement.classList.add('clean');
            sceneElement.classList.add('purification-effect');
            
            // 移除净化效果类
            setTimeout(() => {
                sceneElement.classList.remove('purification-effect');
            }, 2000);
        }
    }

    // 检查场景是否已解锁
    isSceneUnlocked(sceneIndex) {
        if (sceneIndex === 0) return true; // 第一个场景默认解锁
        
        const scene = this.scenes[sceneIndex];
        if (!scene) return false;
        
        // 检查前一个场景的净化进度
        const prevSceneIndex = sceneIndex - 1;
        const prevScene = this.scenes[prevSceneIndex];
        if (!prevScene) return false;
        
        // 这里需要从游戏引擎获取进度数据
        const progress = window.gameEngine?.getSceneProgress(prevSceneIndex) || 0;
        return progress >= (scene.unlockProgress || 70);
    }

    // 获取可用的场景列表
    getAvailableScenes() {
        return this.scenes.filter((scene, index) => this.isSceneUnlocked(index));
    }

    // 获取场景进度
    getSceneProgress(sceneIndex) {
        // 这里需要从游戏引擎获取实际的净化进度
        return window.gameEngine?.getSceneProgress(sceneIndex) || 0;
    }

    // 重置所有场景
    resetAllScenes() {
        this.scenes.forEach((scene, index) => {
            const sceneElement = this.getSceneElement(index);
            if (sceneElement) {
                sceneElement.classList.remove('clean');
                sceneElement.classList.add('polluted');
            }
        });
        
        // 显示第一个场景
        this.showScene(0);
    }

    // 添加场景切换事件监听
    addSceneChangeListener(callback) {
        this.onSceneChange = callback;
    }

    // 触发场景切换事件
    triggerSceneChange(newIndex, oldIndex) {
        if (this.onSceneChange) {
            this.onSceneChange(newIndex, oldIndex);
        }
    }
}

