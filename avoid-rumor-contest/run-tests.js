#!/usr/bin/env node

// 测试运行脚本
const fs = require('fs');
const path = require('path');

// 加载游戏类文件
function loadGameClasses() {
    // 设置全局环境
    global.window = global;
    global.document = {
        getElementById: () => null,
        createElement: () => ({
            classList: { add: () => {}, remove: () => {} },
            style: {},
            textContent: '',
            appendChild: () => {},
            addEventListener: () => {}
        }),
        addEventListener: () => {}
    };
    
    // 模拟fetch函数
    global.fetch = async (url) => {
        const filePath = path.join(__dirname, url);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return {
                json: async () => JSON.parse(content)
            };
        }
        throw new Error(`File not found: ${url}`);
    };
    
    const jsDir = path.join(__dirname, 'js');
    const files = ['config.js', 'bubble.js', 'scene-manager.js', 'game-engine.js'];
    
    files.forEach(file => {
        const filePath = path.join(jsDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            try {
                // 在Node.js环境中执行JavaScript代码
                // 使用vm模块来正确执行代码
                const vm = require('vm');
                const context = {
                    global: global,
                    window: global,
                    document: global.document,
                    fetch: global.fetch,
                    console: console,
                    setTimeout: setTimeout,
                    clearTimeout: clearTimeout,
                    setInterval: setInterval,
                    clearInterval: clearInterval,
                    requestAnimationFrame: (callback) => setTimeout(callback, 16),
                    cancelAnimationFrame: (id) => clearTimeout(id)
                };
                
                // 将执行结果暴露到全局
                vm.createContext(context);
                vm.runInContext(content, context);
                
                // 将类定义复制到全局作用域
                if (context.GameEngine) global.GameEngine = context.GameEngine;
                if (context.BubbleManager) global.BubbleManager = context.BubbleManager;
                if (context.SceneManager) global.SceneManager = context.SceneManager;
                if (context.Bubble) global.Bubble = context.Bubble;
                if (context.GameConfig) global.GameConfig = context.GameConfig;
                
                console.log(`✅ 加载 ${file}`);
            } catch (error) {
                console.log(`❌ 加载 ${file} 失败: ${error.message}`);
            }
        }
    });
}

// 加载测试文件
function loadTests() {
    const testPath = path.join(__dirname, 'tests', 'game-engine.test.js');
    if (fs.existsSync(testPath)) {
        const content = fs.readFileSync(testPath, 'utf8');
        // 设置全局环境
        global.window = global;
        global.document = {};
        eval(content);
    }
}

// 主函数
async function main() {
    console.log('🔧 加载游戏类文件...');
    loadGameClasses();
    
    console.log('🧪 加载测试文件...');
    loadTests();
    
    console.log('🚀 开始运行测试...\n');
    
    try {
        // 检查TestRunner是否已定义
        if (typeof TestRunner !== 'undefined') {
            await TestRunner.runAllTests();
        } else {
            console.log('⚠️  TestRunner未定义，运行简化测试...');
            await runSimpleTests();
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ 测试运行失败:', error);
        process.exit(1);
    }
}

// 简化测试函数
async function runSimpleTests() {
    console.log('🧪 运行简化测试...\n');
    
    const tests = [
        { name: '文件完整性检查', test: () => checkFileIntegrity() },
        { name: '游戏引擎类检查', test: () => checkGameEngineClass() },
        { name: '气泡管理器类检查', test: () => checkBubbleManagerClass() },
        { name: '场景管理器类检查', test: () => checkSceneManagerClass() }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            test.test();
            console.log(`✅ ${test.name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n📊 简化测试结果:');
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`🎯 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

// 文件完整性检查
function checkFileIntegrity() {
    const requiredFiles = [
        'js/config.js',
        'js/bubble.js', 
        'js/scene-manager.js',
        'js/game-engine.js',
        'js/main.js',
        'css/style.css',
        'index.html'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${file}`);
        }
    }
}

// 游戏引擎类检查
function checkGameEngineClass() {
    if (typeof GameEngine === 'undefined') {
        throw new Error('GameEngine类未定义');
    }
    
    const engine = new GameEngine();
    if (!engine.sceneProgress) {
        throw new Error('GameEngine缺少sceneProgress属性');
    }
}

// 气泡管理器类检查
function checkBubbleManagerClass() {
    if (typeof BubbleManager === 'undefined') {
        throw new Error('BubbleManager类未定义');
    }
    
    const manager = new BubbleManager();
    if (!manager.bubbles) {
        throw new Error('BubbleManager缺少bubbles属性');
    }
}

// 场景管理器类检查
function checkSceneManagerClass() {
    if (typeof SceneManager === 'undefined') {
        throw new Error('SceneManager类未定义');
    }
    
    const manager = new SceneManager();
    if (!manager.scenes) {
        throw new Error('SceneManager缺少scenes属性');
    }
}

// 运行测试
main();
