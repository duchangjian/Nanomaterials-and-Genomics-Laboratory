// 配置加载器 - 统一管理网站所有配置项
class ConfigLoader {
    constructor() {
        this.config = {};
        this.configLoaded = false;
        this.loadConfig();
    }

    async loadConfig() {
        try {
            console.log('开始加载配置...');
            
            // 从.env文件加载配置
            await this.loadEnvFile();
            
            // 从Tailwind配置获取主题信息
            this.loadTailwindConfig();
            
            // 加载内容配置文件
            await this.loadContentConfig();
            
            // 加载图片配置文件
            await this.loadImagesConfig();
            
            // 合并默认配置
            this.mergeDefaultConfig();
            
            this.configLoaded = true;
            console.log('配置加载成功');
        } catch (error) {
            console.error('配置加载失败:', error);
            // 加载默认配置作为备用
            this.mergeDefaultConfig();
            this.configLoaded = true;
        }
    }

    async loadEnvFile() {
        // 简单的.env解析逻辑
        console.log('加载环境变量配置...');
        const response = await fetch('.env').catch(() => null);
        if (response && response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, value] = line.split('=', 2);
                    if (key && value !== undefined) {
                        // 处理布尔值和数字类型
                        const cleanValue = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
                        if (cleanValue === 'true') {
                            this.config[key] = true;
                        } else if (cleanValue === 'false') {
                            this.config[key] = false;
                        } else if (!isNaN(cleanValue)) {
                            this.config[key] = Number(cleanValue);
                        } else {
                            this.config[key] = cleanValue;
                        }
                    }
                }
            });
        }
    }

    loadTailwindConfig() {
        // 尝试从全局获取Tailwind配置
        console.log('加载Tailwind主题配置...');
        if (window.tailwind && window.tailwind.config) {
            this.config.theme = window.tailwind.config.theme || {};
        }
    }

    async loadContentConfig() {
        // 加载内容配置文件
        console.log('加载内容配置文件...');
        try {
            const response = await fetch('content-config.json').catch(() => null);
            if (response && response.ok) {
                const contentConfig = await response.json();
                this.config.content = contentConfig;
            }
        } catch (error) {
            console.warn('内容配置文件加载失败:', error);
        }
    }

    async loadImagesConfig() {
        // 加载图片配置文件
        console.log('加载图片配置文件...');
        try {
            const response = await fetch('images-config.json').catch(() => null);
            if (response && response.ok) {
                const imagesConfig = await response.json();
                this.config.images = imagesConfig;
            }
        } catch (error) {
            console.warn('图片配置文件加载失败:', error);
        }
    }

    mergeDefaultConfig() {
        const defaultConfig = {
            // 网站基本信息
            SITE_NAME: '纳米材料应用和植物基因组学实验室',
            SITE_DESCRIPTION: '致力于纳米材料与植物科学交叉领域的创新研究',
            SITE_KEYWORDS: '纳米材料,植物基因组学,农业应用,科研项目',
            
            // 实验室信息
            LAB_ADDRESS: '中国 北京市海淀区中关村南大街5号 农业大学生命科学学院',
            LAB_PHONE: '+86 10 8888 7777',
            LAB_EMAIL: 'nano_plant@example.edu.cn',
            LAB_WORKING_HOURS: '周一至周五 9:00-17:00',
            
            // 社交媒体链接
            SOCIAL_WECHAT: '#',
            SOCIAL_WEIBO: '#',
            SOCIAL_GITHUB: '#',
            SOCIAL_LINKEDIN: '#',
            
            // 地图链接
            MAP_LINK: '#',
            
            // 内容编辑工具配置
            EDITOR_ENABLED: true,
            EXPORT_FORMAT: 'json',
            
            // 性能优化配置
            CACHE_ENABLED: true,
            MINIFY_ENABLED: true,
            IMAGE_OPTIMIZATION: true,
            
            // 网站功能配置
            ENABLE_ANALYTICS: false,
            ENABLE_COOKIES_BANNER: false,
            ENABLE_DARK_MODE: false,
            
            // 国际化配置
            DEFAULT_LANGUAGE: 'zh',
            ENABLE_MULTI_LANGUAGE: false,
            
            // 主题配置
            theme: {
                colors: {
                    primary: '#1a5276',
                    secondary: '#3498db',
                    accent: '#f4d03f',
                    neutral: '#f4f9fd',
                    success: '#27ae60',
                    warning: '#f39c12',
                    error: '#e74c3c',
                    info: '#3498db'
                },
                breakpoints: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px'
                }
            }
        };

        // 深度合并配置，优先使用加载的配置
        this.config = this.deepMerge(defaultConfig, this.config);
    }
    
    // 深度合并对象的辅助方法
    deepMerge(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    // 检查是否为对象的辅助方法
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * 获取配置项
     * @param {string} key - 配置键名，支持点号分隔获取嵌套属性
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值或默认值
     */
    get(key, defaultValue = null) {
        if (!key) return defaultValue;
        
        // 支持嵌套属性访问，如 'theme.colors.primary'
        const keys = key.split('.');
        let result = this.config;
        
        for (const k of keys) {
            if (result === null || result === undefined || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[k];
        }
        
        return result !== undefined ? result : defaultValue;
    }

    /**
     * 设置配置项
     * @param {string} key - 配置键名，支持点号分隔设置嵌套属性
     * @param {*} value - 配置值
     */
    set(key, value) {
        if (!key) return;
        
        // 支持嵌套属性设置
        const keys = key.split('.');
        let current = this.config;
        
        // 遍历到倒数第二个键
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (current[k] === undefined || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        // 设置最后一个键的值
        current[keys[keys.length - 1]] = value;
    }

    /**
     * 获取所有配置
     * @returns {Object} 配置对象的深拷贝
     */
    getAll() {
        return this.deepClone(this.config);
    }
    
    /**
     * 深拷贝对象的辅助方法
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 深拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * 应用配置到页面
     */
    applyToPage() {
        console.log('应用配置到页面...');
        
        // 设置页面标题和元信息
        this._applyMetaTags();
        
        // 应用主题配置
        this._applyTheme();
        
        // 应用功能配置
        this._applyFeatures();
    }
    
    /**
     * 应用元标签配置
     * @private
     */
    _applyMetaTags() {
        // 设置页面标题
        if (this.get('SITE_NAME')) {
            const currentTitle = document.title;
            if (!currentTitle.includes(this.get('SITE_NAME'))) {
                document.title = currentTitle ? `${currentTitle} - ${this.get('SITE_NAME')}` : this.get('SITE_NAME');
            }
        }

        // 设置描述元标签
        if (this.get('SITE_DESCRIPTION')) {
            let descriptionMeta = document.querySelector('meta[name="description"]');
            if (!descriptionMeta) {
                descriptionMeta = document.createElement('meta');
                descriptionMeta.name = 'description';
                document.head.appendChild(descriptionMeta);
            }
            descriptionMeta.content = this.get('SITE_DESCRIPTION');
        }

        // 设置关键词元标签
        if (this.get('SITE_KEYWORDS')) {
            let keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (!keywordsMeta) {
                keywordsMeta = document.createElement('meta');
                keywordsMeta.name = 'keywords';
                document.head.appendChild(keywordsMeta);
            }
            keywordsMeta.content = this.get('SITE_KEYWORDS');
        }
        
        // 设置语言元标签
        const lang = this.get('DEFAULT_LANGUAGE', 'zh');
        document.documentElement.lang = lang;
    }
    
    /**
     * 应用主题配置
     * @private
     */
    _applyTheme() {
        // 将主题颜色添加到CSS变量中
        const colors = this.get('theme.colors', {});
        const style = document.createElement('style');
        style.textContent = `:root {
            ${Object.entries(colors).map(([key, value]) => `--color-${key}: ${value};`).join('\n            ')}
        }`;
        document.head.appendChild(style);
    }
    
    /**
     * 应用功能配置
     * @private
     */
    _applyFeatures() {
        // 启用分析功能
        if (this.get('ENABLE_ANALYTICS') && typeof window !== 'undefined') {
            console.log('分析功能已启用');
            // 这里可以添加Google Analytics或其他分析工具的初始化代码
        }
        
        // 启用深色模式
        if (this.get('ENABLE_DARK_MODE')) {
            console.log('深色模式已启用');
            document.documentElement.classList.add('dark');
        }
        
        // 启用多语言支持
        if (this.get('ENABLE_MULTI_LANGUAGE')) {
            console.log('多语言支持已启用');
            // 初始化多语言功能
        }
    }
    
    /**
     * 监听配置变化的事件发射器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        if (!this._listeners) {
            this._listeners = {};
        }
        
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }
        
        this._listeners[eventName].push(callback);
    }
    
    /**
     * 触发配置事件
     * @param {string} eventName - 事件名称
     * @param {*} data - 事件数据
     */
    emit(eventName, data) {
        if (!this._listeners || !this._listeners[eventName]) {
            return;
        }
        
        this._listeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件处理器错误 [${eventName}]:`, error);
            }
        });
    }
}

// 创建全局配置实例
window.Config = new ConfigLoader();

// 监听配置加载完成事件
window.Config.on('configLoaded', () => {
    console.log('配置已完全加载并可使用');
    // 这里可以添加依赖配置的初始化代码
});

// 页面加载完成后应用配置
function applyConfigWhenReady() {
    // 检查配置是否已加载
    if (window.Config.configLoaded) {
        window.Config.applyToPage();
        // 触发配置加载完成事件
        window.Config.emit('configLoaded');
    } else {
        // 如果配置尚未加载，等待一段时间后重试
        setTimeout(applyConfigWhenReady, 100);
    }
}

// 初始化配置应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConfigWhenReady);
} else {
    applyConfigWhenReady();
}

// 暴露配置加载器类供其他模块使用
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ConfigLoader;
}