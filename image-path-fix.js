// image-path-fix.js - 图片路径规范化解决方案
// 图片路径修复 - 全局解决方案
// 用于规范化和修复网站中所有图片路径的问题

// 立即执行函数，确保在DOM加载前初始化拦截器
(function() {
  console.log('图片路径修复模块初始化...');
  
  /**
   * 规范化图片路径的核心函数
   * @param {string} path - 需要规范化的图片路径
   * @returns {string} 规范化后的图片路径
   */
  function normalizeImagePath(path) {
    if (typeof path !== 'string') return path;
    
    // 已规范化的路径直接返回
    if (path.startsWith('http://') || 
        path.startsWith('https://') || 
        path.startsWith('/photos/') || 
        path.startsWith('photos/')) {
      return path;
    }
    
    // 处理根目录路径 - 直接修改为photos/开头
    if (path.startsWith('/')) {
      // 移除前导斜杠并添加photos/
      return 'photos/' + path.substring(1);
    }
    
    // 处理相对路径 - 添加photos/前缀
    return 'photos/' + path;
  }
  
  /**
   * 从backgroundImage字符串中提取并规范化所有图片URL
   * @param {string} bgImage - background-image样式字符串
   * @returns {string} 规范化后的background-image样式字符串
   */
  function normalizeBackgroundImage(bgImage) {
    if (typeof bgImage !== 'string') return bgImage;
    
    // 正则匹配所有url()中的路径
    return bgImage.replace(/url\((['"]?)([^'"]+)(['"]?)\)/g, (match, quote1, path, quote2) => {
      if (!path || path.startsWith('http://') || path.startsWith('https://')) {
        return match;
      }
      
      const normalizedPath = normalizeImagePath(path);
      // console.log(`规范化背景图片: ${path} -> ${normalizedPath}`);
      return `url(${quote1}${normalizedPath}${quote2})`;
    });
  }
  
  // 1. 拦截Image构造函数的src属性
  const originalImageSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
  Object.defineProperty(Image.prototype, 'src', {
    set: function(value) {
      const normalizedValue = normalizeImagePath(value);
      if (originalImageSrc && originalImageSrc.set) {
        originalImageSrc.set.call(this, normalizedValue);
      } else {
        this.setAttribute('src', normalizedValue);
      }
    },
    get: function() {
      if (originalImageSrc && originalImageSrc.get) {
        return originalImageSrc.get.call(this);
      }
      return this.getAttribute('src');
    },
    configurable: true
  });
  
  // 拦截所有元素的setAttribute方法
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (name === 'src') {
      const normalizedValue = normalizeImagePath(value);
      return originalSetAttribute.call(this, name, normalizedValue);
    }
    
    // 拦截style属性设置，特别处理background-image
    if (name === 'style' && typeof value === 'string' && value.includes('background-image')) {
      const normalizedValue = normalizeBackgroundImage(value);
      return originalSetAttribute.call(this, name, normalizedValue);
    }
    
    // 处理data-image属性 - 针对research页面的特殊处理
    if (name.toLowerCase() === 'data-image') {
      console.log('检测到data-image属性:', value);
      // 研究项目图片的特殊处理
      if (value.startsWith('research.projects')) {
        console.log('特殊处理研究项目图片data-image属性');
        // 这里我们只记录，实际的路径规范化在fixAllImages中处理
      }
    }
    
    return originalSetAttribute.call(this, name, value);
  };
  
  // 3. 拦截元素的style.backgroundImage属性
  const originalStylePrototype = Object.getPrototypeOf(HTMLElement.prototype.style);
  Object.defineProperty(originalStylePrototype, 'backgroundImage', {
    set: function(value) {
      const normalizedValue = normalizeBackgroundImage(value);
      // 使用setProperty来确保兼容性
      this.setProperty('background-image', normalizedValue);
    },
    get: function() {
      return this.getPropertyValue('background-image');
    },
    configurable: true
  });
  
  // 4. 页面加载完成后，扫描并修复所有图片路径
  function fixAllImages() {
    // 修复所有img标签的src属性
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (img.src) {
        img.src = normalizeImagePath(img.src);
      }
    });
    
    // 修复所有元素的背景图片
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const bgImage = computedStyle.backgroundImage;
      
      if (bgImage && bgImage !== 'none' && 
          !bgImage.startsWith('http://') && !bgImage.startsWith('https://')) {
        element.style.backgroundImage = normalizeBackgroundImage(bgImage);
      }
    });
    
    // 特别处理研究项目图片 - 增强research页面的图片处理
    const researchProjectIcons = document.querySelectorAll('[data-image^="research.projects"]');
    console.log(`找到${researchProjectIcons.length}个研究项目图标`);
    
    researchProjectIcons.forEach(element => {
      const dataImage = element.getAttribute('data-image');
      console.log('处理研究项目图标:', dataImage);
      
      // 如果是i标签，确保背景图片正确设置
      if (element.tagName === 'I') {
        // 尝试从配置中获取正确的路径
        if (window.Config && window.Config.config && window.Config.config.research && window.Config.config.research.projects) {
          const match = dataImage.match(/research\.projects\[(\d+)\]\.icon/);
          if (match && match[1]) {
            const index = parseInt(match[1]);
            if (window.Config.config.research.projects[index] && window.Config.config.research.projects[index].icon) {
              const iconPath = normalizeImagePath(window.Config.config.research.projects[index].icon);
              console.log(`设置研究项目${index}图标:`, iconPath);
              element.style.backgroundImage = `url("${iconPath}")`;
              element.style.backgroundSize = 'cover';
              element.style.backgroundPosition = 'center';
              element.style.display = 'inline-block';
              element.style.width = '100px';
              element.style.height = '100px';
              element.style.borderRadius = '8px';
              element.style.margin = '10px';
              // 清除Font Awesome图标，避免冲突
              element.className = element.className.replace(/fa-\w+/g, '').replace(/fa\s+/g, '').trim();
            }
          }
        }
      }
    });
    
    // 为地图图片提供专用修复逻辑
    const mapElements = document.querySelectorAll('[data-image="contact.mapIcon"],.map-image,[id*="map"],[class*="map"]');
    console.log(`找到${mapElements.length}个可能的地图元素`);
    
    mapElements.forEach(element => {
      try {
        // 设置默认地图图片路径
        const mapPath = normalizeImagePath('地图.png');
        console.log(`设置地图图片路径:`, mapPath);
        
        if (element.tagName === 'IMG') {
          element.src = mapPath;
          element.alt = element.alt || '实验室地图';
        } else {
          element.style.backgroundImage = `url("${mapPath}")`;
          element.style.backgroundSize = 'contain';
          element.style.backgroundRepeat = 'no-repeat';
          element.style.backgroundPosition = 'center';
        }
        // 确保元素可见
        element.style.display = 'block';
        element.style.visibility = 'visible';
      } catch (e) {
        console.error('修复地图图片时出错:', e);
      }
    });
    
    console.log(`图片路径修复完成，处理了 ${allImages.length} 个图片元素、${researchProjectIcons.length} 个研究项目图标和 ${mapElements.length} 个地图元素`);
  }
  
  // 当文档加载完成后执行修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixAllImages);
  } else {
    // 立即执行修复
    setTimeout(fixAllImages, 100);
  }
  
  console.log('图片路径修复模块初始化完成，公开API已注册');
  
  // 导出公共API供外部调用
  window.ImagePathFix = {
    normalizePath: normalizeImagePath,
    normalizeBackgroundImage: normalizeBackgroundImage,
    fixAllImages: fixAllImages,
    testMapImage: function() {
      // 提供调试地图图片的方法
      const mapElements = document.querySelectorAll('[data-image="contact.mapIcon"]');
      mapElements.forEach(element => {
        console.log('测试地图图片元素:', element);
        element.style.width = '200px';
        element.style.height = '200px';
        element.style.backgroundSize = 'cover';
        element.style.display = 'block';
        element.style.visibility = 'visible';
      });
      return mapElements.length;
    },
    version: '1.1.0',
    // 添加研究项目图片专用修复方法
    fixResearchProjectImages: function() {
      console.log('执行研究项目图片专用修复...');
      const researchProjectIcons = document.querySelectorAll('[data-image^="research.projects"]');
      researchProjectIcons.forEach(element => {
        // 专用修复逻辑
        if (window.Config && window.Config.config && window.Config.config.research && window.Config.config.research.projects) {
          const dataImage = element.getAttribute('data-image');
          const match = dataImage.match(/research\.projects\[(\d+)\]\.icon/);
          if (match && match[1]) {
            const index = parseInt(match[1]);
            if (window.Config.config.research.projects[index] && window.Config.config.research.projects[index].icon) {
              const iconPath = normalizeImagePath(window.Config.config.research.projects[index].icon);
              if (element.tagName === 'I') {
                element.style.backgroundImage = `url("${iconPath}")`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
              }
            }
          }
        }
      });
    }
  };
  
  // 监听contentLoader.ready事件（如果内容加载器有此事件）
  window.addEventListener('contentLoader.ready', function() {
    console.log('内容加载器已就绪，开始修复图片路径...');
    fixAllImages();
  });
})();

/**
 * 使用说明：
 * 1. 在HTML页面的head部分引入此脚本
 * 2. 脚本会自动拦截所有图片路径设置并规范化
 * 3. 页面加载完成后会扫描并修复所有已有图片
 * 4. 可通过 window.ImagePathFix.testMapImage() 手动测试地图图片
 * 
 * 最佳实践建议：
 * 1. 在配置文件中统一管理所有图片路径
 * 2. 始终使用相对路径并包含正确的目录前缀
 * 3. 定期检查并修复图片路径问题
 */