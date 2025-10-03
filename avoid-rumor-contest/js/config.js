// 游戏配置管理
class GameConfig {
    constructor() {
        this.config = null;
        this.scenes = null;
        this.rumors = null;
    }

    // 加载配置文件
    async loadConfig() {
        try {
            const response = await fetch('data/config.json');
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('加载配置文件失败:', error);
            return this.getDefaultConfig();
        }
    }

    // 加载场景数据
    async loadScenes() {
        try {
            const response = await fetch('data/scenes.json');
            this.scenes = await response.json();
            return this.scenes;
        } catch (error) {
            console.error('加载场景数据失败:', error);
            return this.getDefaultScenes();
        }
    }

    // 加载谣言数据
    async loadRumors() {
        try {
            const response = await fetch('data/rumors.json');
            this.rumors = await response.json();
            return this.rumors;
        } catch (error) {
            console.error('加载谣言数据失败:', error);
            return this.getDefaultRumors();
        }
    }

    // 获取默认配置
    getDefaultConfig() {
        return {
            game: {
                title: "古都谣言净化录",
                subtitle: "网络清风侠的净化之旅",
                version: "1.0.0"
            },
            bubble: {
                floatDuration: 10000,
                burstDuration: 500,
                maxBubbles: 8,
                spawnInterval: 2000,
                colors: {
                    default: "#F0F8FF",
                    life: "#FFE4E1",
                    social: "#E6F3FF", 
                    history: "#F0FFF0",
                    culture: "#FFF8DC",
                    tourism: "#F5F5DC"
                }
            },
            scene: {
                transitionDuration: 1500,
                unlockThreshold: 70
            },
            progress: {
                updateInterval: 100
            },
            audio: {
                enabled: false,
                volume: 0.7
            }
        };
    }

    // 获取默认场景数据
    getDefaultScenes() {
        return {
            scenes: [
                {
                    id: "dayanta",
                    name: "大雁塔",
                    image: "大雁塔.jpg",
                    description: "千年古塔，见证历史",
                    unlockProgress: 0,
                    bubbleCount: 4
                }
            ]
        };
    }

    // 获取默认谣言数据
    getDefaultRumors() {
        return {
            rumors: [
                {
                    id: 1,
                    text: "吃荔枝会被测出酒驾",
                    truth: "荔枝糖分发酵会产生酒精，但含量极低，几分钟后就会消散",
                    type: "生活常识",
                    scene: "dayanta"
                }
            ]
        };
    }

    // 获取指定场景的谣言
    getRumorsForScene(sceneId) {
        if (!this.rumors || !this.rumors.rumors) {
            return [];
        }
        const filteredRumors = this.rumors.rumors.filter(rumor => rumor.scene === sceneId);
        return filteredRumors;
    }

    // 获取气泡颜色
    getBubbleColor(type) {
        const typeMap = {
            '生活常识': 'life',
            '社会传闻': 'social',
            '历史知识': 'history',
            '文化知识': 'culture',
            '旅游信息': 'tourism',
            '建筑知识': 'history',
            '安全常识': 'life',
            '参观须知': 'tourism',
            '设施信息': 'tourism',
            '地理知识': 'history'
        };
        
        const colorKey = typeMap[type] || 'default';
        return this.config?.bubble?.colors?.[colorKey] || '#F0F8FF';
    }

    // 获取游戏配置值
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
}

// 创建全局配置实例
window.gameConfig = new GameConfig();

