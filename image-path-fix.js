// image-path-fix.js - 图片路径规范化解决方案
// 此文件提供完整的图片路径规范化功能，确保所有图片正确从photos目录加载

/**
 * 图片路径规范化解决方案
 * 解决问题：网站中图片路径不正确导致的404错误
 * 特别是contact页面中的地图图片加载失败问题
 */

(function() {
  console.log('图片路径规范化解决方案初始化...');
  
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
  
  // 2. 拦截所有元素的setAttribute方法
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
    
    // 特别处理地图图片 - 确保contact.mapIcon正确加载
    const mapElements = document.querySelectorAll('[data-image="contact.mapIcon"]');
    mapElements.forEach(element => {
      const mapPath = 'photos/地图.png';
      if (element.tagName === 'IMG') {
        element.src = mapPath;
      } else {
        element.style.backgroundImage = `url("${mapPath}")`;
      }
      // 确保元素可见
      element.style.display = 'block';
      element.style.visibility = 'visible';
    });
    
    console.log(`图片路径修复完成，处理了 ${allImages.length} 个图片元素和 ${mapElements.length} 个地图元素`);
  }
  
  // 当文档加载完成后执行修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixAllImages);
  } else {
    // 立即执行修复
    setTimeout(fixAllImages, 100);
  }
  
  console.log('图片路径规范化解决方案初始化完成');
  
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
    }
  };
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