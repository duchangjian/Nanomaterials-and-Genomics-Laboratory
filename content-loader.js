// 内容加载器 - 从配置文件加载内容到HTML页面

class ContentLoader {
  constructor() {
    this.contentConfig = null;
    this.imagesConfig = null;
    this.currentLanguage = 'zh'; // 默认语言为中文
  }

  // 初始化内容加载器
  async init() {
    try {
      // 加载配置文件
      await this.loadConfigs();
      
      // 加载内容到页面
      this.loadContent();
      
      console.log('内容加载完成！');
    } catch (error) {
      console.error('内容加载失败:', error);
    }
  }

  // 加载配置文件
  async loadConfigs() {
    const contentResponse = await fetch('content-config.json');
    if (!contentResponse.ok) throw new Error('加载内容配置失败');
    this.contentConfig = await contentResponse.json();

    const imagesResponse = await fetch('images-config.json');
    if (!imagesResponse.ok) throw new Error('加载图片配置失败');
    this.imagesConfig = await imagesResponse.json();
  }

  // 加载内容到页面
  loadContent() {
    this.loadTextContent();
    this.loadImages();
    this.setupLanguageToggle();
  }

  // 加载文本内容
  loadTextContent() {
    const elements = document.querySelectorAll('[data-content]');
    elements.forEach(element => {
      const contentKey = element.getAttribute('data-content');
      const content = this.getValueFromPath(this.contentConfig, contentKey);
      if (content) {
        element.textContent = content;
      }
    });
  }

  // 加载图片
  loadImages() {
    const elements = document.querySelectorAll('[data-image]');
    elements.forEach(element => {
      const imageKey = element.getAttribute('data-image');
      let imageConfig;

      // 特殊处理数组格式的图片配置
      if (imageKey.includes('[')) {
        const parts = imageKey.split('[');
        const basePath = parts[0];
        const index = parseInt(parts[1].split(']')[0]);
        const baseConfig = this.getValueFromPath(this.imagesConfig, 'images.' + basePath);
        if (baseConfig && baseConfig[index]) {
          imageConfig = baseConfig[index];
        }
      } else {
        // 常规图片配置
        imageConfig = this.getValueFromPath(this.imagesConfig, 'images.' + imageKey);
      }

      if (imageConfig) {
        if (element.tagName === 'IMG') {
          element.src = imageConfig.path;
          if (imageConfig.alt) {
            element.alt = imageConfig.alt;
          }
        } else {
          // 对于非img标签，设置背景图片
          element.style.backgroundImage = `url(${imageConfig.path})`;
        }
      }
    });
  }

  // 设置语言切换功能
  setupLanguageToggle() {
    const toggleButtons = document.querySelectorAll('[data-lang-toggle]');
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const language = button.getAttribute('data-lang-toggle');
        this.switchLanguage(language);
      });
    });
  }

  // 切换语言
  async switchLanguage(language) {
    if (language === this.currentLanguage) return;
    
    this.currentLanguage = language;
    
    // 这里可以扩展为从不同的语言配置文件加载内容
    // 例如: await this.loadLanguageConfig(language);
    
    // 重新加载内容
    this.loadTextContent();
    this.loadImages();
    
    // 更新语言切换按钮的状态
    document.querySelectorAll('[data-lang-toggle]').forEach(button => {
      if (button.getAttribute('data-lang-toggle') === language) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // 从嵌套对象中根据路径获取值
  getValueFromPath(obj, path) {
    if (!path) return null;
    
    return path.split('.').reduce((current, key) => {
      if (current === undefined || current === null) return null;
      return current[key];
    }, obj);
  }
}

// 页面加载完成后初始化内容加载器
document.addEventListener('DOMContentLoaded', () => {
  const loader = new ContentLoader();
  loader.init();
});