// 测试地图图片加载情况的脚本 - 增强版

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('===== 地图图片加载诊断工具 v2.0 =====');
    
    // 查找所有可能包含地图相关内容的元素
    const mapIconElements = document.querySelectorAll('[data-image="contact.mapIcon"]');
    const mapContainerElements = document.querySelectorAll('.map-container, .map-area, [class*="map"], [id*="map"]');
    
    console.log(`找到 ${mapIconElements.length} 个地图图标元素`);
    console.log(`找到 ${mapContainerElements.length} 个可能的地图容器元素`);
    
    // 检查地图图标元素的详细信息
    mapIconElements.forEach((element, index) => {
        console.log(`\n==== 地图图标元素 ${index + 1} 详情 ====`);
        console.log('元素类型:', element.tagName);
        console.log('元素HTML:', element.outerHTML);
        console.log('元素类名:', element.className);
        console.log('元素ID:', element.id);
        console.log('是否包含bg-loading-error类:', element.classList.contains('bg-loading-error'));
        
        // 获取计算样式
        const computedStyle = window.getComputedStyle(element);
        console.log('计算样式 - 宽度:', computedStyle.width);
        console.log('计算样式 - 高度:', computedStyle.height);
        console.log('计算样式 - 背景图片:', computedStyle.backgroundImage);
        console.log('计算样式 - 背景大小:', computedStyle.backgroundSize);
        console.log('计算样式 - 背景位置:', computedStyle.backgroundPosition);
        console.log('计算样式 - 显示状态:', computedStyle.display);
        console.log('计算样式 - 可见性:', computedStyle.visibility);
        
        // 检查内联样式
        console.log('内联样式 - 背景图片:', element.style.backgroundImage);
        
        // 检查是否被隐藏
        const isHidden = 
          computedStyle.display === 'none' || 
          computedStyle.visibility === 'hidden' || 
          parseInt(computedStyle.opacity) === 0 ||
          computedStyle.width === '0px' ||
          computedStyle.height === '0px';
        console.log('元素是否被隐藏:', isHidden);
    });
    
    // 检查地图容器元素
    mapContainerElements.forEach((container, index) => {
        console.log(`\n==== 地图容器元素 ${index + 1} ====`);
        console.log('容器类型:', container.tagName);
        console.log('容器类名:', container.className);
        console.log('容器内容预览:', container.textContent.substring(0, 100) + '...');
        console.log('容器计算样式 - 宽度:', window.getComputedStyle(container).width);
        console.log('容器计算样式 - 高度:', window.getComputedStyle(container).height);
        
        // 检查容器内是否有图片
        const containerImages = container.querySelectorAll('img, [style*="background-image"]');
        console.log(`容器内包含 ${containerImages.length} 个图片元素`);
    });
    
    // 深度检查Config对象
    console.log('\n==== Config对象深度检查 ====');
    if (window.Config) {
        console.log('Config对象存在');
        
        // 检查Config对象的所有属性
        const configProps = Object.getOwnPropertyNames(window.Config);
        console.log('Config属性列表:', configProps);
        
        // 检查config配置对象
        if (window.Config.config) {
            console.log('Config.config存在');
            console.log('Config.config的顶层属性:', Object.keys(window.Config.config));
            
            // 专门检查contact部分
            if (window.Config.config.contact) {
                console.log('contact配置存在:', Object.keys(window.Config.config.contact));
                console.log('contact.mapIcon值:', window.Config.config.contact.mapIcon || '未设置');
            } else {
                console.log('contact配置不存在');
            }
        } else {
            console.log('Config.config不存在');
            // 检查是否直接在Config对象下有contact属性
            if (window.Config.contact) {
                console.log('直接在Config对象下找到contact属性:', window.Config.contact);
            }
        }
        
        // 测试多种获取contact.mapIcon的方式
        console.log('\n==== 尝试多种方式获取contact.mapIcon ====');
        
        // 方式1: window.Config.config.contact.mapIcon
        const method1 = (window.Config.config && window.Config.config.contact && window.Config.config.contact.mapIcon) || '未获取到';
        console.log('方式1结果:', method1);
        
        // 方式2: window.Config.get方法
        const method2 = window.Config.get ? window.Config.get('contact.mapIcon', '未获取到') : 'get方法不存在';
        console.log('方式2结果:', method2);
        
        // 方式3: 直接访问window.Config.contact.mapIcon
        const method3 = (window.Config.contact && window.Config.contact.mapIcon) || '未获取到';
        console.log('方式3结果:', method3);
        
        // 方式4: 尝试从config中手动解析
        let method4 = '未获取到';
        try {
            const configData = JSON.parse(JSON.stringify(window.Config.config || window.Config));
            method4 = configData['contact'] && configData['contact']['mapIcon'] || '未获取到';
        } catch (e) {
            method4 = '解析错误: ' + e.message;
        }
        console.log('方式4结果:', method4);
    } else {
        console.log('Config对象不存在');
    }
    
    // 检查页面上所有包含data-image属性的元素
    console.log('\n==== 页面上所有data-image元素 ====');
    const allDataImages = document.querySelectorAll('[data-image]');
    console.log(`找到 ${allDataImages.length} 个data-image元素`);
    
    allDataImages.forEach((element, index) => {
        const key = element.getAttribute('data-image');
        console.log(`${index + 1}. 键: ${key}, 元素: ${element.tagName}, 类: ${element.className}`);
    });
    
    // 尝试直接加载图片测试 - 多种路径尝试
    console.log('\n==== 直接测试地图图片URL ====');
    const testUrls = [
        'photos/地图.png',
        '地图.png',
        '/photos/地图.png',
        '/地图.png'
    ];
    
    testUrls.forEach(url => {
        const testImage = new Image();
        testImage.onload = () => {
            console.log(`✓ 图片加载成功: ${url}`);
            console.log(`  图片尺寸: ${testImage.width}x${testImage.height}`);
        };
        testImage.onerror = (e) => {
            console.log(`✗ 图片加载失败: ${url}`);
        };
        testImage.src = url;
    });
    
    // ==== 全局图片路径规范化拦截器 ====\n  (function() {
    console.log('全局图片路径拦截器初始化...');
    
    // 规范化图片路径的核心函数
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
    
    // 从backgroundImage字符串中提取并规范化所有图片URL
    function normalizeBackgroundImage(bgImage) {
      if (typeof bgImage !== 'string') return bgImage;
      
      // 正则匹配所有url()中的路径
      return bgImage.replace(/url\((['"]?)([^'"]+)(['"]?)\)/g, (match, quote1, path, quote2) => {
        if (!path || path.startsWith('http://') || path.startsWith('https://')) {
          return match;
        }
        
        const normalizedPath = normalizeImagePath(path);
        console.log(`拦截并重定向背景图片: ${path} -> ${normalizedPath}`);
        return `url(${quote1}${normalizedPath}${quote2})`;
      });
    }
    
    // 1. 拦截Image构造函数的src属性
    const originalImageSrc = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
    Object.defineProperty(Image.prototype, 'src', {
      set: function(value) {
        const normalizedValue = normalizeImagePath(value);
        if (normalizedValue !== value) {
          console.log(`拦截图片src: ${value} -> ${normalizedValue}`);
        }
        
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
        if (normalizedValue !== value) {
          console.log(`拦截元素src属性: ${value} -> ${normalizedValue}`);
        }
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
        if (normalizedValue !== value) {
          console.log(`拦截backgroundImage: ${value} -> ${normalizedValue}`);
        }
        
        // 使用setProperty来确保兼容性
        this.setProperty('background-image', normalizedValue);
      },
      get: function() {
        return this.getPropertyValue('background-image');
      },
      configurable: true
    });
    
    console.log('全局图片路径拦截器初始化完成');
  })();
  
  // 提供手动设置地图图片的方法供调试
  console.log('\n==== 调试辅助功能 ====');
  window.testMapImage = function() {
    const mapIcons = document.querySelectorAll('[data-image="contact.mapIcon"]');
    mapIcons.forEach(icon => {
      console.log('手动设置地图图片...');
      // 确保使用完整路径
      const fullPath = 'photos/地图.png';
      if (icon.tagName === 'IMG') {
        icon.src = fullPath;
      } else {
        icon.style.backgroundImage = `url("${fullPath}")`;
      }
      // 确保元素可见
      icon.style.width = '200px';
      icon.style.height = '200px';
      icon.style.backgroundSize = 'cover';
      icon.style.display = 'block';
      icon.style.visibility = 'visible';
      console.log('手动设置完成:', icon.style.backgroundImage);
    });
    return mapIcons.length;
  };
  
  // 额外添加一个立即执行的修复函数
  console.log('\n==== 立即执行地图图片修复 ====');
  setTimeout(() => {
    const mapIcons = document.querySelectorAll('[data-image="contact.mapIcon"]');
    console.log(`发现 ${mapIcons.length} 个地图图标元素，立即尝试修复`);
    window.testMapImage();
    
    // 直接检查页面上所有backgroundImage设置，修复错误路径
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const bgImage = element.style.backgroundImage;
      if (bgImage && bgImage.includes('地图.png') && !bgImage.includes('photos/')) {
        console.log(`发现错误的背景图片路径: ${bgImage}`);
        const fixedBgImage = bgImage.replace('"地图.png"', '"photos/地图.png"')
                                  .replace("'地图.png'", "'photos/地图.png'");
        element.style.backgroundImage = fixedBgImage;
        console.log(`已修复为: ${fixedBgImage}`);
      }
    });
  }, 500);
    
    console.log('可在控制台执行 window.testMapImage() 进行手动调试');
});