// 游戏引擎单元测试
class GameEngineTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🧪 开始运行游戏引擎单元测试...\n');
        
        // 模拟DOM环境
        this.setupMockDOM();
        
        // 运行测试用例
        await this.testGameEngineInitialization();
        await this.testSceneProgressInitialization();
        await this.testBubbleBurstHandling();
        await this.testSceneCompletion();
        await this.testGameCompletion();
        await this.testPauseResume();
        await this.testRestartGame();
        
        // 显示测试结果
        this.showTestResults();
    }

    // 设置模拟DOM环境
    setupMockDOM() {
        // 创建模拟的DOM元素
        const mockElements = {
            'scene-wrapper': { appendChild: () => {}, querySelector: () => null },
            'progress-fill': { style: { width: '' } },
            'progress-text': { textContent: '' },
            'cleaned-count': { textContent: '' },
            'current-scene-name': { textContent: '' },
            'prev-scene': { disabled: false, addEventListener: () => {} },
            'next-scene': { disabled: false, addEventListener: () => {} },
            'truth-popup': { classList: { add: () => {}, remove: () => {} } },
            'celebration-page': { classList: { add: () => {}, remove: () => {} } },
            'completion-popup': { classList: { add: () => {}, remove: () => {} } },
            'certificate-page': { classList: { add: () => {}, remove: () => {} } },
            'game-instructions': { classList: { add: () => {}, remove: () => {} } },
            'game-container': { classList: { add: () => {}, remove: () => {} } }
        };

        // 模拟document.getElementById
        global.document = {
            getElementById: (id) => mockElements[id] || null,
            addEventListener: () => {},
            createElement: () => ({ 
                classList: { add: () => {}, remove: () => {} },
                style: {},
                textContent: '',
                appendChild: () => {}
            })
        };

        // 模拟window对象
        global.window = {
            addEventListener: () => {},
            gameConfig: {
                loadConfig: async () => ({}),
                loadRumors: async () => ({ rumors: [] }),
                loadScenes: async () => ({ scenes: [] }),
                getRumorsForScene: () => []
            }
        };

        // 模拟requestAnimationFrame
        global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
        global.cancelAnimationFrame = (id) => clearTimeout(id);
    }

    // 测试游戏引擎初始化
    async testGameEngineInitialization() {
        this.runTest('游戏引擎初始化', async () => {
            const gameEngine = new GameEngine();
            await gameEngine.init();
            
            // 验证初始化状态
            this.assert(gameEngine.isInitialized === true, '游戏引擎应该已初始化');
            this.assert(gameEngine.sceneManager !== null, '场景管理器应该已创建');
            this.assert(gameEngine.bubbleManager !== null, '气泡管理器应该已创建');
            this.assert(gameEngine.totalCleaned === 0, '初始净化数量应该为0');
        });
    }

    // 测试场景进度初始化
    async testSceneProgressInitialization() {
        this.runTest('场景进度初始化', async () => {
            const gameEngine = new GameEngine();
            
            // 模拟场景数据
            gameEngine.sceneManager = {
                scenes: [
                    { name: '大雁塔', bubbleCount: 4 },
                    { name: '钟楼', bubbleCount: 4 },
                    { name: '回民街', bubbleCount: 3 },
                    { name: '陕历博', bubbleCount: 4 }
                ]
            };
            
            gameEngine.initializeProgress();
            
            // 验证进度数据
            this.assert(Object.keys(gameEngine.sceneProgress).length === 4, '应该有4个场景的进度数据');
            this.assert(gameEngine.sceneProgress[0].total === 4, '大雁塔场景应该有4个气泡');
            this.assert(gameEngine.sceneProgress[0].cleaned === 0, '初始净化数量应该为0');
            this.assert(gameEngine.sceneProgress[0].completed === false, '初始完成状态应该为false');
        });
    }

    // 测试气泡破裂处理
    async testBubbleBurstHandling() {
        this.runTest('气泡破裂处理', async () => {
            const gameEngine = new GameEngine();
            gameEngine.sceneManager = { currentSceneIndex: 0 };
            gameEngine.sceneProgress = {
                0: { cleaned: 0, total: 4, percentage: 0, completed: false }
            };
            
            const mockBubble = {
                text: '测试谣言',
                truth: '测试真相',
                type: '测试类型'
            };
            
            gameEngine.onBubbleBurst(mockBubble);
            
            // 验证净化计数增加
            this.assert(gameEngine.totalCleaned === 1, '净化计数应该增加1');
            this.assert(gameEngine.sceneProgress[0].cleaned === 1, '场景净化数量应该增加1');
        });
    }

    // 测试场景完成
    async testSceneCompletion() {
        this.runTest('场景完成', async () => {
            const gameEngine = new GameEngine();
            gameEngine.sceneManager = { 
                currentSceneIndex: 0,
                purifyScene: () => {}
            };
            gameEngine.sceneProgress = {
                0: { cleaned: 4, total: 4, percentage: 100, completed: false },
                1: { cleaned: 0, total: 4, percentage: 0, completed: false },
                2: { cleaned: 0, total: 3, percentage: 0, completed: false },
                3: { cleaned: 0, total: 4, percentage: 0, completed: false }
            };
            
            let gameCompleted = false;
            gameEngine.onGameComplete = () => { gameCompleted = true; };
            
            gameEngine.completeScene(0);
            
            // 验证场景完成状态
            this.assert(gameEngine.sceneProgress[0].completed === true, '场景0应该标记为已完成');
            this.assert(gameCompleted === false, '游戏不应该完成（还有其他场景未完成）');
        });
    }

    // 测试游戏完成
    async testGameCompletion() {
        this.runTest('游戏完成', async () => {
            const gameEngine = new GameEngine();
            gameEngine.sceneManager = { 
                purifyScene: () => {}
            };
            gameEngine.sceneProgress = {
                0: { cleaned: 4, total: 4, percentage: 100, completed: true },
                1: { cleaned: 4, total: 4, percentage: 100, completed: true },
                2: { cleaned: 3, total: 3, percentage: 100, completed: true },
                3: { cleaned: 4, total: 4, percentage: 100, completed: true }
            };
            
            let gameCompleted = false;
            gameEngine.onGameComplete = () => { gameCompleted = true; };
            
            gameEngine.completeScene(3);
            
            // 验证游戏完成
            this.assert(gameCompleted === true, '游戏应该完成');
        });
    }

    // 测试暂停恢复
    async testPauseResume() {
        this.runTest('暂停恢复', async () => {
            const gameEngine = new GameEngine();
            gameEngine.isPlaying = true;
            gameEngine.isPaused = false;
            gameEngine.bubbleManager = {
                pauseAllBubbles: () => {},
                resumeAllBubbles: () => {},
                stopSpawning: () => {},
                startSpawning: () => {}
            };
            
            // 测试暂停
            gameEngine.pauseGame();
            this.assert(gameEngine.isPaused === true, '游戏应该被暂停');
            
            // 测试恢复
            gameEngine.resumeGame();
            this.assert(gameEngine.isPaused === false, '游戏应该被恢复');
        });
    }

    // 测试重新开始游戏
    async testRestartGame() {
        this.runTest('重新开始游戏', async () => {
            const gameEngine = new GameEngine();
            gameEngine.totalCleaned = 10;
            gameEngine.sceneProgress = {
                0: { cleaned: 4, total: 4, completed: true },
                1: { cleaned: 4, total: 4, completed: true }
            };
            gameEngine.sceneManager = {
                resetAllScenes: () => {}
            };
            
            gameEngine.restartGame();
            
            // 验证重置状态
            this.assert(gameEngine.totalCleaned === 0, '净化计数应该重置为0');
            this.assert(gameEngine.isPlaying === false, '游戏应该停止');
            this.assert(gameEngine.isPaused === false, '暂停状态应该重置');
        });
    }

    // 运行单个测试
    async runTest(testName, testFunction) {
        try {
            await testFunction();
            this.passedTests++;
            this.testResults.push(`✅ ${testName}`);
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            this.testResults.push(`❌ ${testName}: ${error.message}`);
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }

    // 断言函数
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    // 显示测试结果
    showTestResults() {
        console.log('\n📊 测试结果汇总:');
        console.log(`✅ 通过: ${this.passedTests}`);
        console.log(`❌ 失败: ${this.failedTests}`);
        console.log(`📈 总计: ${this.passedTests + this.failedTests}`);
        console.log(`🎯 成功率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 所有测试通过！');
        } else {
            console.log('\n⚠️  有测试失败，请检查代码。');
        }
    }
}

// 气泡管理器测试
class BubbleManagerTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    async runAllTests() {
        console.log('\n🧪 开始运行气泡管理器单元测试...\n');
        
        this.setupMockDOM();
        
        await this.testBubbleCreation();
        await this.testBubbleAnimation();
        await this.testBubbleBurst();
        await this.testBubbleManager();
        
        this.showTestResults();
    }

    setupMockDOM() {
        global.document = {
            createElement: () => ({
                classList: { add: () => {}, remove: () => {} },
                style: {},
                textContent: '',
                addEventListener: () => {},
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
            }),
            body: { appendChild: () => {} }
        };
        
        global.window = { innerWidth: 800, innerHeight: 600 };
        global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
        global.cancelAnimationFrame = (id) => clearTimeout(id);
    }

    async testBubbleCreation() {
        this.runTest('气泡创建', async () => {
            const bubbleConfig = {
                id: 1,
                text: '测试谣言',
                truth: '测试真相',
                type: '测试类型',
                scene: 'test'
            };
            
            const bubble = new Bubble(bubbleConfig);
            const element = bubble.createElement();
            
            this.assert(bubble.id === 1, '气泡ID应该正确');
            this.assert(bubble.text === '测试谣言', '气泡文本应该正确');
            this.assert(element !== null, '应该创建DOM元素');
        });
    }

    async testBubbleAnimation() {
        this.runTest('气泡动画', async () => {
            const bubble = new Bubble({
                id: 1,
                text: '测试',
                truth: '真相',
                type: '类型',
                scene: 'test'
            });
            
            bubble.createElement();
            bubble.startFloat();
            
            this.assert(bubble.isActive === true, '气泡应该处于活动状态');
            
            bubble.pause();
            this.assert(bubble.isActive === false, '气泡应该被暂停');
            
            bubble.resume();
            this.assert(bubble.isActive === true, '气泡应该被恢复');
        });
    }

    async testBubbleBurst() {
        this.runTest('气泡破裂', async () => {
            const bubble = new Bubble({
                id: 1,
                text: '测试',
                truth: '真相',
                type: '类型',
                scene: 'test'
            });
            
            let burstCalled = false;
            bubble.onBurst = () => { burstCalled = true; };
            
            bubble.createElement();
            bubble.burst();
            
            this.assert(bubble.isBursting === true, '气泡应该处于破裂状态');
            this.assert(burstCalled === true, '应该触发破裂回调');
        });
    }

    async testBubbleManager() {
        this.runTest('气泡管理器', async () => {
            const manager = new BubbleManager();
            const mockContainer = { appendChild: () => {} };
            
            manager.init(mockContainer);
            
            this.assert(manager.container === mockContainer, '容器应该正确设置');
            this.assert(manager.isSpawning === true, '应该开始生成气泡');
            
            manager.stopSpawning();
            this.assert(manager.isSpawning === false, '应该停止生成气泡');
        });
    }

    runTest(testName, testFunction) {
        try {
            testFunction();
            this.passedTests++;
            this.testResults.push(`✅ ${testName}`);
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            this.testResults.push(`❌ ${testName}: ${error.message}`);
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    showTestResults() {
        console.log('\n📊 气泡管理器测试结果:');
        console.log(`✅ 通过: ${this.passedTests}`);
        console.log(`❌ 失败: ${this.failedTests}`);
        console.log(`📈 总计: ${this.passedTests + this.failedTests}`);
        console.log(`🎯 成功率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
    }
}

// 主测试运行器
class TestRunner {
    static async runAllTests() {
        console.log('🚀 开始运行所有单元测试...\n');
        
        const gameEngineTest = new GameEngineTest();
        await gameEngineTest.runAllTests();
        
        const bubbleManagerTest = new BubbleManagerTest();
        await bubbleManagerTest.runAllTests();
        
        console.log('\n🎊 所有测试完成！');
    }
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestRunner, GameEngineTest, BubbleManagerTest };
}
