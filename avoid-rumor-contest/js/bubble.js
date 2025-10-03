// 气泡类
class Bubble {
    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        this.truth = config.truth;
        this.type = config.type;
        this.scene = config.scene;
        this.element = null;
        this.isActive = false;
        this.isBursting = false;
        this.animationId = null;
        this.startTime = Date.now();
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
    }

    // 创建DOM元素
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.textContent = this.text;
        this.element.dataset.bubbleId = this.id;
        this.element.dataset.rumorType = this.type;
        
        // 添加类型样式
        const typeClass = this.getTypeClass();
        this.element.classList.add(typeClass);
        
        // 设置随机位置
        this.setRandomPosition();
        
        // 添加点击事件
        this.element.addEventListener('click', (e) => this.handleClick(e));
        
        // 添加触摸事件（移动端）
        this.element.addEventListener('touchstart', (e) => this.handleTouch(e));
        
        return this.element;
    }

    // 获取类型样式类
    getTypeClass() {
        const typeMap = {
            '生活常识': 'type-life',
            '社会传闻': 'type-social',
            '历史知识': 'type-history',
            '文化知识': 'type-culture',
            '旅游信息': 'type-tourism',
            '建筑知识': 'type-history',
            '安全常识': 'type-life',
            '参观须知': 'type-tourism',
            '设施信息': 'type-tourism',
            '地理知识': 'type-history'
        };
        return typeMap[this.type] || 'type-default';
    }

    // 设置随机位置
    setRandomPosition() {
        // 从屏幕底部开始，随机水平位置
        this.position.x = Math.random() * (window.innerWidth - 200);
        this.position.y = window.innerHeight + 50;
        
        // 设置随机速度
        this.velocity.x = (Math.random() - 0.5) * 20; // -10 到 10
        this.velocity.y = -30 - Math.random() * 20; // -50 到 -30
        
        this.updateElementPosition();
    }

    // 更新元素位置
    updateElementPosition() {
        if (!this.element) return;
        
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    // 开始浮动动画
    startFloat() {
        if (!this.element || this.isBursting) return;
        
        this.isActive = true;
        this.element.classList.add('floating');
        
        // 使用requestAnimationFrame实现平滑动画
        this.animate();
    }

    // 动画循环
    animate() {
        if (!this.isActive || this.isBursting) return;
        
        const now = Date.now();
        const deltaTime = now - this.startTime;
        
        // 更新位置
        this.position.x += this.velocity.x * 0.016; // 假设60fps
        this.position.y += this.velocity.y * 0.016;
        this.rotation += 0.5;
        
        // 添加轻微的摆动效果
        this.position.x += Math.sin(deltaTime * 0.001) * 2;
        
        this.updateElementPosition();
        
        // 检查是否超出屏幕
        if (this.element && this.element.parentNode) {
            const container = this.element.parentNode;
            const containerRect = container.getBoundingClientRect();
            if (this.position.y < -100 || this.position.x < -200 || this.position.x > containerRect.width + 200) {
                this.destroy();
                return;
            }
        }
        
        // 继续动画
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // 处理点击事件
    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.isBursting) return;
        
        this.burst();
        
        // 触发触觉反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    // 处理触摸事件
    handleTouch(event) {
        event.preventDefault();
        this.handleClick(event);
    }

    // 破裂动画
    burst() {
        if (this.isBursting) return;
        
        this.isBursting = true;
        this.isActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.element) {
            this.element.classList.add('bursting');
            
            // 创建粒子效果
            this.createParticleEffect();
            
            // 创建波纹效果
            this.createRippleEffect();
            
            // 延迟移除元素
            setTimeout(() => {
                this.destroy();
            }, 500);
        }
        
        // 触发破裂事件
        if (this.onBurst) {
            this.onBurst(this);
        } else {
            console.error('onBurst回调未设置');
        }
    }

    // 创建粒子效果
    createParticleEffect() {
        if (!this.element) return;
        
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 创建多个粒子
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            
            // 随机方向和速度
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particle.style.setProperty('--vx', `${vx}px`);
            particle.style.setProperty('--vy', `${vy}px`);
            
            document.body.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    // 创建波纹效果
    createRippleEffect() {
        if (!this.element) return;
        
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${centerX}px`;
        ripple.style.top = `${centerY}px`;
        
        document.body.appendChild(ripple);
        
        // 移除波纹
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // 销毁气泡
    destroy() {
        this.isActive = false;
        this.isBursting = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
    }

    // 暂停动画
    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    // 恢复动画
    resume() {
        if (!this.isBursting) {
            this.isActive = true;
            this.animate();
        }
    }
}

// 气泡管理器
class BubbleManager {
    constructor() {
        this.bubbles = [];
        this.maxBubbles = 8;
        this.spawnInterval = 2000;
        this.spawnTimer = null;
        this.isSpawning = false;
        this.container = null;
    }

    // 初始化
    init(container) {
        this.container = container;
        this.startSpawning();
    }

    // 开始生成气泡
    startSpawning() {
        if (this.isSpawning) return;
        
        this.isSpawning = true;
        
        // 立即生成一个测试气泡
        setTimeout(() => {
            this.spawnBubble();
        }, 100);
        
        this.spawnTimer = setInterval(() => {
            this.spawnBubble();
        }, this.spawnInterval);
    }

    // 停止生成气泡
    stopSpawning() {
        this.isSpawning = false;
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }
    }

    // 生成气泡
    spawnBubble() {
        if (this.bubbles.length >= this.maxBubbles) return;
        
        // 获取当前场景的谣言数据
        const currentScene = window.gameEngine?.getCurrentScene();
        if (!currentScene) return;
        
        const rumors = window.gameConfig.getRumorsForScene(currentScene.id);
        
        // 如果没有加载到谣言数据，使用默认数据
        let randomRumor;
        if (rumors.length === 0) {
            randomRumor = {
                id: 999,
                text: "测试谣言气泡",
                truth: "这是一个测试真相",
                type: "测试类型",
                scene: currentScene.id
            };
        } else {
            randomRumor = rumors[Math.floor(Math.random() * rumors.length)];
        }
        
        // 创建气泡
        const bubble = new Bubble(randomRumor);
        const element = bubble.createElement();
        
        // 设置破裂回调
        bubble.onBurst = (bubble) => {
            this.handleBubbleBurst(bubble);
        };
        
        // 添加到容器
        if (this.container) {
            this.container.appendChild(element);
            this.bubbles.push(bubble);
            
            // 开始浮动动画
            bubble.startFloat();
        }
    }

    // 处理气泡破裂
    handleBubbleBurst(bubble) {
        
        // 从数组中移除
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
        }
        
        // 触发游戏引擎事件
        if (window.gameEngine) {
            window.gameEngine.onBubbleBurst(bubble);
        } else {
            console.error('游戏引擎未找到');
        }
    }

    // 清理所有气泡
    clearAllBubbles() {
        this.stopSpawning();
        
        this.bubbles.forEach(bubble => {
            bubble.destroy();
        });
        
        this.bubbles = [];
    }

    // 暂停所有气泡
    pauseAllBubbles() {
        this.bubbles.forEach(bubble => {
            bubble.pause();
        });
    }

    // 恢复所有气泡
    resumeAllBubbles() {
        this.bubbles.forEach(bubble => {
            bubble.resume();
        });
    }

    // 更新配置
    updateConfig(config) {
        this.maxBubbles = config.maxBubbles || 8;
        this.spawnInterval = config.spawnInterval || 2000;
    }
}

