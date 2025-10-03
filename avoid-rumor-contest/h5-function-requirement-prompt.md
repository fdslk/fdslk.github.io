# H5互动游戏《古都谣言净化录》技术开发需求

## 项目概述
开发一个基于HTML5的互动游戏，主题为「古都谣言净化录」。用户扮演「网络清风侠」，在西安地标场景中点击清除谣言气泡，净化网络环境。

## 核心功能需求

### 1. 场景管理系统
- 实现3-5个西安地标场景（大雁塔、城墙、回民街、钟楼、兵马俑）
- 每个场景包含：
  - 背景图层（灰色污染状态 → 彩色净化状态）
  - 谣言气泡生成系统
  - 净化进度追踪

### 2. 谣言气泡交互系统
```javascript
// 气泡数据结构示例
const rumorBubbles = [
  {
    id: 1,
    text: "吃荔枝会被测出酒驾",
    truth: "荔枝糖分发酵会产生酒精，但含量极低，几分钟后就会消散",
    type: "生活常识"
  },
  {
    id: 2, 
    text: "西安地铁施工挖毁古墓",
    truth: "西安地铁建设全程有考古专家参与，重要发现都会保护迁移",
    type: "社会传闻"
  }
  // 更多谣言数据...
]
```

**交互要求：**
- 气泡从底部随机位置生成，向上飘动
- 点击气泡触发破裂动画
- 破裂后显示辟谣信息的弹窗
- 添加触觉反馈（手机振动API）

### 3. 进度与状态管理
- 实时显示净化进度条
- 场景解锁逻辑：完成当前场景70%净化 → 解锁下一场景
- 本地存储游戏进度（localStorage）

### 4. 动画效果需求
- 气泡浮动动画（CSS3 keyframes）
- 气泡破裂粒子效果（Canvas或CSS）
- 场景色彩过渡动画（filter: grayscale() → filter: none）
- 加载页面动画（西安地标轮廓绘制）

### 5. 音效系统
- 背景音乐：古风轻音乐循环播放
- 音效：气泡破裂声、场景切换声、成功音效
- 支持音效开关控制

## 技术实现要点

### 前端技术栈
```html
<!-- 基础结构 -->
<div id="game-container">
  <div id="scene-wrapper">
    <div class="scene" data-scene="dayanta">
      <div class="background polluted"></div>
      <div class="background clean"></div>
      <div class="bubble-container"></div>
    </div>
  </div>
  <div id="progress-bar"></div>
  <div id="truth-popup" class="hidden"></div>
</div>
```

### 核心JavaScript模块
```javascript
// 需要实现的主要类
class GameEngine {
  constructor() {
    this.scenes = []
    this.currentScene = 0
    this.score = 0
  }
  
  initScenes() {}      // 初始化场景
  generateBubbles() {} // 生成谣言气泡
  handleBubbleClick() {} // 处理点击事件
  updateProgress() {}  // 更新进度
  switchScene() {}     // 切换场景
}

class Bubble {
  constructor(config) {
    this.text = config.text
    this.truth = config.truth
    this.element = null
  }
  
  createElement() {}   // 创建DOM元素
  startFloat() {}      // 开始浮动动画
  burst() {}           // 破裂动画
}
```

### 性能优化要求
- 使用requestAnimationFrame实现流畅动画
- 实现对象池管理气泡DOM元素，避免频繁创建销毁
- 图片资源预加载和懒加载
- 移动端触摸事件优化

### 响应式设计
- 适配移动端竖屏模式
- 触摸反馈优化
- 字体大小自适应

## 视觉设计规范

### 色彩方案
```css
:root {
  --color-polluted: #8C8C8C;    /* 污染状态灰色 */
  --color-clean: #FFD700;       /* 西安古都金色 */
  --color-bubble: #F0F8FF;      /* 气泡浅蓝色 */
  --color-truth: #4CAF50;       /* 真相绿色 */
}
```

### 动画时长标准
- 气泡浮动：8-12秒完成一个循环
- 破裂动画：0.3-0.5秒
- 场景过渡：1.5秒

## 数据与配置
需要准备的数据文件：
- `scenes.json` - 场景配置
- `rumors.json` - 谣言数据库  
- `game-config.json` - 游戏参数配置

## 交付要求
- 完整的HTML5单页应用
- 支持微信内置浏览器
- 压缩优化后的资源文件
- 详细的代码注释
