// 内容加载器 - 根据配置替换页面内容
console.log('内容加载器初始化...');

class ContentLoader {
  constructor() {
    console.log('ContentLoader构造函数被调用');
    this.loaded = false;
  }

  // 初始化函数
  init() {
    console.log('ContentLoader初始化开始');
    
    // 等待DOM完全加载后再执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.initializeContent();
    } else {
      console.log('等待DOM完全加载...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM已完全加载，开始初始化内容');
        this.initializeContent();
      });
    }
  }
  
  // 初始化内容应用
  initializeContent() {
    try {
      // 直接显示配置调试信息
      console.log('==== 配置调试信息 ====');
      console.log('window.Config存在:', !!window.Config);
      if (window.Config) {
        console.log('Config类型:', typeof window.Config);
        console.log('Config属性:', Object.keys(window.Config).join(', '));
        
        // 检查图片相关配置
        const configData = window.Config.config || window.Config;
        if (configData && configData.index && configData.index.photos) {
          console.log('index.photos存在:', !!configData.index.photos);
          if (configData.index.photos.photos) {
            console.log('photos数组存在，长度:', configData.index.photos.photos.length);
            configData.index.photos.photos.forEach((photo, index) => {
              console.log(`照片${index}路径:`, photo.src);
            });
          }
        }
      }
      
      // 检查带有data-image属性的元素
      const imageElements = document.querySelectorAll('[data-image]');
      console.log(`找到${imageElements.length}个带有data-image属性的元素`);
      imageElements.forEach((el, index) => {
        console.log(`元素${index}:`, el, 'data-image值:', el.getAttribute('data-image'));
      });
      
      // 检查Config对象是否已加载
      if (window.Config && window.Config.configLoaded) {
        console.log('Config已加载，直接应用内容');
        this.applyContent();
      } else {
        console.log('Config未完全加载，等待configLoaded事件');
        // 监听configLoaded事件
        if (window.Config && window.Config.on) {
          window.Config.on('configLoaded', () => {
            console.log('接收到configLoaded事件，开始应用内容');
            this.applyContent();
          });
        } else {
          // 备用方案：定时检查Config对象状态
          this.checkConfigReady();
        }
      }
    } catch (e) {
      console.error('初始化内容时出错:', e);
    }
  }

  // 定时检查Config对象是否准备好
  checkConfigReady() {
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 300;

    const check = () => {
      attempts++;
      console.log(`第${attempts}次检查Config状态`);
      
      if (window.Config && window.Config.configLoaded) {
        console.log('Config已准备好，应用内容');
        this.applyContent();
        return;
      }

      if (attempts >= maxAttempts) {
        console.error('Config加载超时，尝试使用现有配置');
        this.applyContent(); // 尝试使用现有配置
        return;
      }

      setTimeout(check, checkInterval);
    };

    setTimeout(check, checkInterval);
  }

  // 应用配置到页面内容
  applyContent() {
    console.log('开始应用配置到页面内容');
    
    // 即使Config对象不存在，也尝试使用现有内容作为回退
    if (!window.Config) {
      console.warn('Config对象不存在，使用回退模式加载内容');
    }

    try {
      // 记录开始时间，用于性能监控
      const startTime = performance.now();
      
      // 替换带有data-content属性的元素内容
      this.replaceContentElements();
      
      // 延迟替换图片元素，确保DOM完全加载
      setTimeout(() => {
        try {
          console.log('延迟执行图片元素替换...');
          // 替换带有data-image属性的图片
          this.replaceImageElements();
        } catch (e) {
          console.error('延迟替换图片元素时出错:', e);
        }
      }, 100);
      
      // 计算处理时间
      const processTime = performance.now() - startTime;
      console.log(`内容处理耗时: ${processTime.toFixed(2)}ms`);
      
      this.loaded = true;
      console.log('内容加载完成');
      
      // 添加加载完成标记到body
      document.body.dataset.contentLoaded = 'true';
      
      // 触发内容加载完成事件
      try {
        if (window.Config && window.Config.emit) {
          window.Config.emit('contentLoaded');
        } else {
          // 备用方案：自定义事件
          const event = new CustomEvent('contentLoader.ready');
          window.dispatchEvent(event);
        }
      } catch (e) {
        console.warn('触发事件时出错:', e);
      }
    } catch (e) {
      console.error('应用内容时发生严重错误:', e);
      // 即使出错也设置为已加载，避免重复尝试
      this.loaded = true;
      document.body.dataset.contentLoadError = 'true';
    }
    
    // 无论是否出错，都进行最终检查
    this.performFinalCheck();
  }
  
  // 执行最终检查
  performFinalCheck() {
    try {
      // 统计未加载的内容元素数量
      const loadingElements = document.querySelectorAll('.config-loading');
      if (loadingElements.length > 0) {
        console.warn(`仍有${loadingElements.length}个元素处于加载状态`);
        // 为加载中的元素设置默认样式和内容
        loadingElements.forEach(el => {
          el.classList.remove('config-loading');
          el.classList.add('config-fallback');
          if (el.textContent === '内容加载中...') {
            el.textContent = '';
          }
        });
      }
      
      // 统计图片加载错误
      const imageErrors = document.querySelectorAll('.image-loading-error, .missing-image');
      if (imageErrors.length > 0) {
        console.warn(`有${imageErrors.length}个图片加载失败或缺失`);
      }
      
    } catch (e) {
      console.error('执行最终检查时出错:', e);
    }
  }

  // 替换内容元素
  replaceContentElements() {
    console.log('开始替换内容元素...');
    try {
      const elements = document.querySelectorAll('[data-content]');
      console.log(`找到${elements.length}个内容元素`);

      elements.forEach((element) => {
        try {
          const key = element.getAttribute('data-content');
          if (!key) {
            console.warn('发现data-content属性为空的元素:', element);
            return;
          }
          
          console.log(`处理元素: ${key}`);
          
          // 尝试从配置中获取内容
          let content;
          try {
            if (window.Config && window.Config.get) {
              content = window.Config.get(key, '');
            } else {
              // 备用方案：手动解析路径
              content = this.getValueFromPath(key);
            }
          } catch (e) {
            console.error(`获取配置内容时出错 [${key}]:`, e);
            content = '';
          }

          if (content && content !== '') {
            console.log(`替换元素内容: ${key} -> ${content}`);
            // 保存原始内容作为回退
            element.dataset.originalContent = element.textContent;
            element.textContent = content;
          } else {
            console.log(`未找到配置: ${key}，保留原内容`);
            // 检查是否有回退文本在元素内
            if (element.textContent.trim() === '') {
              // 如果元素为空，设置默认回退文本
              element.textContent = '内容加载中...';
              element.classList.add('config-loading');
            }
          }
        } catch (e) {
          console.error(`处理单个内容元素时出错:`, e, element);
          // 确保单个元素错误不会影响其他元素处理
          element.textContent = element.textContent || '内容加载错误';
          element.classList.add('config-error');
        }
      });
    } catch (e) {
      console.error('替换内容元素时发生严重错误:', e);
      // 即使出错也继续执行
    }
  }

  // 替换图片元素
  replaceImageElements() {
    console.log('开始替换图片元素...');
    try {
      const elements = document.querySelectorAll('[data-image]');
      console.log(`找到${elements.length}个图片元素`);

      elements.forEach((element) => {
        try {
          const key = element.getAttribute('data-image');
          if (!key) {
            console.warn('发现data-image属性为空的元素:', element);
            return;
          }
          
          console.log(`处理图片元素: ${key}`);
          console.log(`元素HTML:`, element.outerHTML);
          
          // 保存原始属性作为回退
          if (element.tagName === 'IMG' && element.src) {
            element.dataset.originalSrc = element.src;
          }
          if (element.style.backgroundImage) {
            element.dataset.originalBackground = element.style.backgroundImage;
          }
          
          // 尝试从配置中获取图片路径
          let imagePath = '';
          try {
            // 详细调试信息
            console.log(`==== 处理图片元素 [${key}] ====`);
            
            // 特殊处理logo - 优先处理logo
            if (key === 'logo' && window.Config) {
              console.log('优先处理logo配置');
              const configData = window.Config.config || window.Config;
              if (configData && configData.logo && configData.logo.icon) {
                imagePath = configData.logo.icon;
                console.log(`直接从logo.icon获取路径:`, imagePath);
              } else {
                // 添加备用logo路径 - 使用英文文件名避免编码问题
                console.log('未找到logo配置，使用备用logo路径');
                imagePath = 'photos/academic_website_design.png';
              }
            }
            
            // 特殊处理contact.mapIcon - 增强处理逻辑
            if (!imagePath && key === 'contact.mapIcon' && window.Config) {
              console.log('处理contact.mapIcon配置');
              // 直接访问Config对象的配置
              const configData = window.Config.config || {};
              
              // 多种方式尝试获取contact.mapIcon
              if (configData.contact && configData.contact.mapIcon) {
                // 立即规范化路径，确保包含photos/前缀
                let rawPath = configData.contact.mapIcon;
                // 强制规范化路径格式
                imagePath = this.normalizeImagePath(rawPath);
                console.log(`获取contact.mapIcon并规范化: ${rawPath} -> ${imagePath}`);
              } else if (window.Config.get) {
                // 使用get方法获取
                let rawPath = window.Config.get('contact.mapIcon', '');
                // 强制规范化路径格式
                imagePath = this.normalizeImagePath(rawPath);
                console.log(`使用Config.get获取并规范化: ${rawPath} -> ${imagePath}`);
              }
              
              // 如果还是没有获取到，直接设置默认路径
              if (!imagePath || imagePath === 'photos/') {
                console.log('未找到contact.mapIcon配置或配置为空，使用默认路径');
                imagePath = 'photos/地图.png';
              }
            }
            
            // 如果logo或contact.mapIcon处理后仍然没有路径，继续使用其他方法
            if (!imagePath || (key !== 'logo' && key !== 'contact.mapIcon')) {
              // 直接检查Config对象
              if (window.Config) {
                console.log('Config对象存在:', Object.keys(window.Config).join(', '));
                
                // 直接获取实验室照片路径 - 增强的路径处理
                if (key.includes('index.photos.photos')) {
                  console.log('处理实验室照片配置路径:', key);
                  const configData = window.Config.config || window.Config;
                  
                  if (configData && configData.index && configData.index.photos && configData.index.photos.photos) {
                    console.log('找到index.photos.photos数组:', configData.index.photos.photos);
                    
                    // 提取数组索引 - 改进的正则表达式
                    const indexMatch = key.match(/index\.photos\.photos\[(\d+)\](\.src)?/);
                    if (indexMatch) {
                      const index = parseInt(indexMatch[1]);
                      if (configData.index.photos.photos[index]) {
                        // 尝试直接获取对象或其src属性
                        const photoObj = configData.index.photos.photos[index];
                        let rawPath = '';
                        if (typeof photoObj === 'string') {
                          rawPath = photoObj;
                        } else if (photoObj && photoObj.src) {
                          rawPath = photoObj.src;
                        }
                        // 强制规范化路径
                        imagePath = this.normalizeImagePath(rawPath);
                        console.log(`直接从配置获取并规范化: ${rawPath} -> ${imagePath}`);
                      }
                    }
                  }
                }
                
                // 使用Config.get方法
                if (window.Config.get && !imagePath) {
                  console.log('使用Config.get方法获取图片路径');
                  let rawPath = window.Config.get(key, '');
                  // 强制规范化路径
                  imagePath = this.normalizeImagePath(rawPath);
                  console.log(`Config.get结果并规范化: ${rawPath} -> ${imagePath}`);
                }
              }
              
              // 如果Config.get没有获取到值，使用手动解析路径
              if (!imagePath || imagePath === 'photos/') {
                console.log('使用手动解析路径方法');
                let rawPath = this.getValueFromPath(key);
                // 强制规范化路径
                imagePath = this.normalizeImagePath(rawPath);
                console.log(`手动解析并规范化: ${rawPath} -> ${imagePath}`);
              }
            }
          } catch (e) {
            console.error(`获取图片路径时出错 [${key}]:`, e);
          }

          // 验证图片路径 - 确保是字符串类型
          if (imagePath && typeof imagePath === 'string' && imagePath.trim() !== '') {
            // 标准化图片路径，确保路径格式正确 - 双重保障
            let normalizedPath = this.normalizeImagePath(imagePath);
              
            console.log(`设置图片路径: ${key} -> ${normalizedPath} (原始: ${imagePath})`);
            
            // 针对图片标签的处理
            if (element.tagName === 'IMG') {
              // 添加加载状态类
              element.classList.add('image-loading');
              
              // 添加加载和错误处理
              const handleLoad = () => {
                console.log(`图片加载成功: ${normalizedPath}`);
                element.classList.remove('image-loading', 'image-loading-error');
                element.classList.add('image-loaded');
                // 移除事件监听器
                element.removeEventListener('load', handleLoad);
                element.removeEventListener('error', handleError);
              };
              
              const handleError = () => {
                console.error(`图片加载失败: ${normalizedPath}`);
                element.classList.remove('image-loading');
                element.classList.add('image-loading-error');
                // 尝试使用原始src
                if (element.dataset.originalSrc) {
                  element.src = element.dataset.originalSrc;
                } else {
                  // 使用占位图
                  element.alt = element.alt || '图片加载失败';
                  element.textContent = element.alt;
                }
                // 移除事件监听器
                element.removeEventListener('load', handleLoad);
                element.removeEventListener('error', handleError);
              };
              
              // 添加事件监听器
              element.addEventListener('load', handleLoad);
              element.addEventListener('error', handleError);
              
              // 设置图片路径
              element.src = normalizedPath;
              
              // 如果图片已经加载完成（缓存情况），手动触发load事件
              if (element.complete) {
                setTimeout(handleLoad, 0);
              }
            } 
            // 对于非img元素，设置背景 - 改进处理逻辑
            else {
              try {
                console.log(`设置非IMG元素背景: ${normalizedPath}`);
                // 首先清空之前的背景设置
                element.style.backgroundImage = '';
                
                // 确保使用正确的引号格式和路径
                element.style.backgroundImage = `url("${normalizedPath}")`;
                
                console.log(`背景图片设置完成:`, element.style.backgroundImage);
                
                // 添加背景图片加载检查
                const img = new Image();
                img.onload = () => {
                  console.log(`背景图片加载成功: ${normalizedPath}`);
                  element.classList.remove('bg-loading-error');
                };
                img.onerror = () => {
                  console.error(`背景图片加载失败: ${normalizedPath}`);
                  element.classList.add('bg-loading-error');
                  // 强制使用备用路径处理
                  console.log('尝试修复加载失败的背景图片路径');
                  // 确保使用正确的photos/路径格式
                  const fixedPath = this.normalizeImagePath(normalizedPath);
                  element.style.backgroundImage = `url("${fixedPath}")`;
                  console.log(`已尝试修复路径: ${normalizedPath} -> ${fixedPath}`);
                };
                img.src = normalizedPath;
              } catch (e) {
                console.error(`设置背景图片时出错 [${key}]:`, e);
                // 使用备用路径
                try {
                  const backupPath = 'photos/地图.png';
                  element.style.backgroundImage = `url("${backupPath}")`;
                  console.log(`使用备用路径: ${backupPath}`);
                } catch (backupError) {
                  console.error('备用路径设置也失败:', backupError);
                }
              }
            }
            
            // 设置alt属性
            if (element.tagName === 'IMG' && !element.alt && window.Config && window.Config.get) {
              try {
                const alt = window.Config.get(`${key}.alt`, '');
                if (alt) {
                  element.alt = alt;
                } else if (!element.alt) {
                  // 如果没有提供alt，使用key作为默认alt
                  element.alt = `图片: ${key}`;
                }
              } catch (e) {
                console.warn(`设置图片alt属性时出错 [${key}]:`, e);
              }
            }
          } else {
            console.log(`未找到图片配置: ${key}，保留原设置`);
            // 使用默认地图图片作为最后的备用
            if (key === 'contact.mapIcon') {
              console.log('使用默认地图图片作为最后的备用');
              try {
                const defaultPath = 'photos/地图.png';
                if (element.tagName === 'IMG') {
                  element.src = defaultPath;
                } else {
                  element.style.backgroundImage = `url("${defaultPath}")`;
                }
                console.log(`已设置默认地图图片: ${defaultPath}`);
              } catch (e) {
                console.error('设置默认地图图片失败:', e);
              }
            }
          }
        } catch (e) {
          console.error(`处理图片元素时出错 [${key}]:`, e);
        }
      });
    } catch (e) {
      console.error('替换图片元素时发生错误:', e);
    }
  }
  
  // 新增：规范化图片路径的辅助方法 - 确保所有相对路径都有正确的photos/前缀
  normalizeImagePath(path) {
    if (!path || typeof path !== 'string') {
      return 'photos/';
    }
    
    const trimmedPath = path.trim();
    
    // 如果是绝对路径或http(s)路径，直接返回
    if (trimmedPath.startsWith('http://') || 
        trimmedPath.startsWith('https://') || 
        trimmedPath.startsWith('/')) {
      return trimmedPath;
    }
    
    // 如果不是以photos/开头，强制添加photos/前缀
    if (!trimmedPath.startsWith('photos/')) {
      return 'photos/' + trimmedPath;
    }
    
    return trimmedPath;
  }
  
  // 从嵌套对象路径获取值
  getValueFromPath(path) {
    try {
      if (!window.Config || (!window.Config.config && !window.Config.navigation && !window.Config.site)) {
        console.warn('配置对象不存在或格式不正确');
        return '';
      }
      
      // 使用更灵活的方式访问配置，优先使用完整的config对象，如果不存在则使用顶层属性
      const root = window.Config.config || window.Config;
      
      // 安全地分割路径
      if (!path || typeof path !== 'string') {
        console.warn('无效的路径参数:', path);
        return '';
      }
      
      const keys = path.split('.');
      let value = root;
      
      // 安全地遍历路径
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        
        // 处理数组索引，如 photos[0] 或 index.photos.photos[0].src
        if (key.includes('[')) {
          try {
            // 处理可能包含多个键的情况，如 photos.photos[0]
            const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
            if (!arrayMatch) {
              console.error(`无效的数组索引格式: ${key}`);
              return '';
            }
            
            const arrayName = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            
            if (isNaN(index)) {
              console.error(`无效的数组索引: ${index}`);
              return '';
            }
            
            // 检查当前value是否有效
            if (!value || typeof value !== 'object') {
              console.warn(`尝试访问无效对象的数组属性: ${arrayName}`);
              return '';
            }
            
            // 检查数组是否存在且有效
            if (value[arrayName] && Array.isArray(value[arrayName]) && index >= 0 && index < value[arrayName].length) {
              value = value[arrayName][index];
            } else {
              console.warn(`数组访问失败: ${arrayName}[${index}] 不存在或无效`);
              return '';
            }
          } catch (e) {
            console.error(`处理数组索引时出错 [${key}]:`, e);
            return '';
          }
        } else {
          // 安全地访问对象属性
          if (value === null || value === undefined) {
            console.warn(`路径导航中断: 在${keys.slice(0, i).join('.')}处遇到null或undefined`);
            return '';
          }
          
          if (typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            console.warn(`属性不存在: ${key}`);
            return '';
          }
        }
      }
      
      // 确保返回的是字符串或可以转换为字符串的值
      if (value === null || value === undefined) {
        return '';
      }
      
      // 如果是对象但不是数组，转换为JSON字符串
      if (typeof value === 'object' && !Array.isArray(value)) {
        try {
          return JSON.stringify(value);
        } catch (e) {
          console.warn('无法将对象转换为字符串:', e);
          return '';
        }
      }
      
      return String(value);
    } catch (e) {
      console.error(`解析配置路径时发生错误 [${path}]:`, e);
      return '';
    }
  }
}

// 创建并导出全局内容加载器实例
window.contentLoader = new ContentLoader();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化内容加载器');
    window.contentLoader.init();
  });
} else {
  // 如果DOM已加载，立即初始化
  setTimeout(() => {
    window.contentLoader.init();
  }, 100);
}