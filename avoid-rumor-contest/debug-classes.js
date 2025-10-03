#!/usr/bin/env node

// 调试类加载问题
const fs = require('fs');
const path = require('path');

console.log('🔍 调试类加载问题...\n');

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

// 加载并检查每个文件
const jsDir = path.join(__dirname, 'js');
const files = ['config.js', 'bubble.js', 'scene-manager.js', 'game-engine.js'];

files.forEach(file => {
    const filePath = path.join(jsDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n📄 检查 ${file}:`);
        
        // 检查类定义
        if (content.includes('class GameEngine')) {
            console.log('  ✅ 包含 GameEngine 类定义');
        }
        if (content.includes('class BubbleManager')) {
            console.log('  ✅ 包含 BubbleManager 类定义');
        }
        if (content.includes('class SceneManager')) {
            console.log('  ✅ 包含 SceneManager 类定义');
        }
        if (content.includes('class Bubble')) {
            console.log('  ✅ 包含 Bubble 类定义');
        }
        if (content.includes('class GameConfig')) {
            console.log('  ✅ 包含 GameConfig 类定义');
        }
        
        // 尝试执行
        try {
            eval(content);
            console.log(`  ✅ ${file} 执行成功`);
        } catch (error) {
            console.log(`  ❌ ${file} 执行失败: ${error.message}`);
        }
    }
});

// 检查全局变量
console.log('\n🌍 检查全局变量:');
console.log('GameEngine:', typeof GameEngine);
console.log('BubbleManager:', typeof BubbleManager);
console.log('SceneManager:', typeof SceneManager);
console.log('Bubble:', typeof Bubble);
console.log('GameConfig:', typeof GameConfig);

// 检查window对象
console.log('\n🪟 检查window对象:');
console.log('window.GameEngine:', typeof window.GameEngine);
console.log('window.BubbleManager:', typeof window.BubbleManager);
console.log('window.SceneManager:', typeof window.SceneManager);
