// 热重载客户端脚本 - 适用于GitHub Pages的自动更新实现
class HotReloadClient {
  constructor() {
    // 在GitHub Pages环境中使用更长的检查间隔（10秒），减少服务器压力
    this.checkInterval = 10000; // 检查间隔，单位毫秒
    this.lastUpdateTime = Date.now();
    this.versionFile = 'version.json'; // 版本信息文件
    this.lastVersion = null;
    this.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  async start() {
    console.log('启动网站内容自动检查...');
    
    // 对于本地环境，显示通知；对于GitHub Pages环境，静默运行
    if (this.isLocalhost) {
      this.showNotification('✓ 自动刷新已启用');
    }
    
    // 首次检查版本
    await this.loadCurrentVersion();
    
    // 开始定期检查
    this.scheduleCheck();
  }

  async loadCurrentVersion() {
    try {
      // 尝试加载版本文件
      const response = await fetch(this.versionFile + '?t=' + Date.now(), {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.lastVersion = data.version;
        console.log('当前网站版本:', this.lastVersion);
      } else {
        // 如果版本文件不存在，使用时间戳作为临时版本
        this.lastVersion = Date.now().toString();
        console.log('未找到版本文件，使用时间戳作为版本标识');
      }
    } catch (error) {
      console.warn('加载版本信息失败，将使用备用检测方法:', error);
      // 备用方案：检查content-config.json的最后修改时间
      this.useConfigFileAsVersion();
    }
  }

  async useConfigFileAsVersion() {
    try {
      const response = await fetch('content-config.json?t=' + Date.now(), {
        method: 'HEAD', // 只获取头信息，不下载整个文件
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const lastModified = response.headers.get('last-modified') || Date.now().toString();
        this.lastVersion = lastModified;
      }
    } catch (error) {
      console.error('备用版本检测也失败:', error);
    }
  }

  async checkForUpdates() {
    try {
      // 本地环境使用原有方式
      if (this.isLocalhost) {
        try {
          const response = await fetch('/hot-reload-check');
          const data = await response.json();
          
          if (data.has_updates) {
            console.log('检测到文件更新，正在刷新页面...');
            this.showNotification('🔄 文件已更新，正在刷新页面...');
            // 添加时间戳以避免缓存
            const timestamp = new Date().getTime();
            window.location.href = `${window.location.pathname}?reload=${timestamp}`;
            return;
          }
        } catch (error) {
          console.warn('本地热重载服务不可用，切换到通用检测方式:', error);
          // 如果本地服务不可用，回退到通用检测方式
        }
      }
      
      // 通用检测方式：检查版本文件或配置文件
      let currentVersion;
      
      try {
        // 先尝试检查版本文件
        const response = await fetch(this.versionFile + '?t=' + Date.now(), {
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          currentVersion = data.version;
        } else {
          // 检查配置文件的最后修改时间
          const configResponse = await fetch('content-config.json?t=' + Date.now(), {
            method: 'HEAD',
            cache: 'no-cache'
          });
          currentVersion = configResponse.headers.get('last-modified') || Date.now().toString();
        }
      } catch (error) {
        // 如果都失败了，尝试检查content-loader.js文件
        const loaderResponse = await fetch('content-loader.js?t=' + Date.now(), {
          method: 'HEAD',
          cache: 'no-cache'
        });
        currentVersion = loaderResponse.headers.get('last-modified') || Date.now().toString();
      }
      
      // 比较版本
      if (currentVersion !== this.lastVersion) {
        console.log(`检测到版本更新: ${this.lastVersion} -> ${currentVersion}`);
        this.lastVersion = currentVersion;
        
        // 显示更新通知，让用户选择是否刷新
        this.showUpdateNotification();
      } else {
        console.log('网站内容是最新的，无需更新');
      }
    } catch (error) {
      console.error('检查更新时出错:', error);
    } finally {
      // 继续下一次检查
      this.scheduleCheck();
    }
  }

  scheduleCheck() {
    setTimeout(() => this.checkForUpdates(), this.checkInterval);
  }

  showNotification(message, type = 'success') {
    // 检查是否已存在通知元素
    const existingNotification = document.getElementById('hot-reload-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'hot-reload-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      background-color: ${type === 'success' ? '#4CAF50' : '#FF9800'};
      color: white;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  showUpdateNotification() {
    // 创建可交互的更新通知
    const notification = document.createElement('div');
    notification.id = 'hot-reload-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background-color: #2196F3;
      color: white;
      border-radius: 6px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
      transform: translateX(0);
    `;
    
    // 通知内容
    notification.innerHTML = `
      <div style="margin-bottom: 10px;">🔄 网站内容已更新</div>
      <div style="display: flex; gap: 8px;">
        <button id="reload-now" style="
          padding: 6px 12px;
          background-color: white;
          color: #2196F3;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        ">立即刷新</button>
        <button id="reload-later" style="
          padding: 6px 12px;
          background-color: transparent;
          color: white;
          border: 1px solid white;
          border-radius: 4px;
          cursor: pointer;
        ">稍后</button>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 添加事件监听
    document.getElementById('reload-now').addEventListener('click', () => {
      // 强制刷新页面，清除所有缓存
      window.location.reload(true);
    });

    document.getElementById('reload-later').addEventListener('click', () => {
      // 移除通知
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
}

// 创建版本信息文件生成器
class VersionFileGenerator {
  static async create() {
    try {
      const version = Date.now().toString();
      const versionData = { version, timestamp: new Date().toISOString() };
      
      // 在浏览器环境中，我们不能直接写入文件
      // 但我们可以在控制台输出提示，告诉开发者如何更新版本文件
      console.log('请更新 version.json 文件内容:', JSON.stringify(versionData, null, 2));
      
      // 如果是本地开发环境且支持localStorage，可以临时存储版本信息
      if (typeof localStorage !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        localStorage.setItem('siteVersion', version);
        console.log('版本信息已临时存储在localStorage中');
      }
    } catch (error) {
      console.error('生成版本信息失败:', error);
    }
  }
}

// 页面加载完成后启动自动刷新
document.addEventListener('DOMContentLoaded', () => {
  // 启动自动更新检查
  const hotReloadClient = new HotReloadClient();
  hotReloadClient.start();
  
  // 在控制台显示提示信息
  console.log('网站自动更新功能已启动');
  console.log('提示：当网站内容更新时，将会显示通知提示刷新页面');
});

// 导出类以便在其他脚本中使用（如果需要）
if (typeof window !== 'undefined') {
  window.HotReloadClient = HotReloadClient;
  window.VersionFileGenerator = VersionFileGenerator;
}