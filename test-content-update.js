// 内容更新测试脚本
// 用于验证content-loader.js的自动更新功能

/**
 * 内容更新测试函数
 * 1. 显示当前页面上使用data-content属性的元素
 * 2. 提示用户如何测试自动更新功能
 * 3. 提供手动触发内容更新的方法
 */
function testContentUpdate() {
  console.log('=== 内容更新测试工具 ===');
  
  // 显示当前页面上的data-content元素
  const contentElements = document.querySelectorAll('[data-content]');
  console.log(`当前页面有 ${contentElements.length} 个使用data-content属性的元素:`);
  
  contentElements.forEach((element, index) => {
    const key = element.getAttribute('data-content');
    const currentText = element.textContent;
    console.log(`${index + 1}. ${key}: "${currentText}"`);
  });
  
  // 创建一个简单的测试UI
  createTestUI();
  
  // 提示用户如何测试
  console.log('\n=== 测试自动更新功能 ===');
  console.log('1. 打开content-config.json文件');
  console.log('2. 修改任意内容（例如：nav.about的值）');
  console.log('3. 保存文件');
  console.log('4. 等待约30秒，查看页面内容是否自动更新');
  console.log('   或者点击页面上的"立即检查更新"按钮手动触发检查');
  
  // 如果contentLoader已加载，显示其状态
  if (window.contentLoader) {
    console.log('\n=== 内容加载器状态 ===');
    console.log('自动刷新已启用:', window.contentLoader.autoRefreshEnabled);
    console.log('刷新间隔:', window.contentLoader.refreshInterval / 1000, '秒');
  }
}

/**
 * 创建测试UI界面
 */
function createTestUI() {
  // 检查是否已存在测试UI
  if (document.getElementById('content-test-ui')) return;
  
  // 创建测试UI容器
  const testUI = document.createElement('div');
  testUI.id = 'content-test-ui';
  testUI.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200';
  
  // 添加标题
  const title = document.createElement('h3');
  title.className = 'font-bold text-sm mb-2 text-primary';
  title.textContent = '内容更新测试';
  testUI.appendChild(title);
  
  // 添加刷新按钮
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors';
  refreshBtn.textContent = '立即检查更新';
  refreshBtn.onclick = async () => {
    console.log('手动检查配置文件更新...');
    if (window.contentLoader) {
      const updated = await window.contentLoader.checkForUpdates();
      if (updated) {
        alert('内容已更新！');
      } else {
        alert('没有检测到新的更新。');
      }
    } else {
      alert('内容加载器未初始化');
    }
  };
  testUI.appendChild(refreshBtn);
  
  // 添加手动重载按钮
  const reloadBtn = document.createElement('button');
  reloadBtn.className = 'ml-2 px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors';
  reloadBtn.textContent = '强制重载内容';
  reloadBtn.onclick = async () => {
    console.log('强制重载内容...');
    if (window.contentLoader) {
      await window.contentLoader.reload();
      alert('内容已强制重载！');
    } else {
      alert('内容加载器未初始化');
    }
  };
  testUI.appendChild(reloadBtn);
  
  // 添加隐藏按钮
  const hideBtn = document.createElement('button');
  hideBtn.className = 'absolute top-2 right-2 text-gray-400 hover:text-gray-600';
  hideBtn.innerHTML = '&times;';
  hideBtn.style.fontSize = '16px';
  hideBtn.style.border = 'none';
  hideBtn.style.background = 'none';
  hideBtn.style.cursor = 'pointer';
  hideBtn.onclick = () => {
    testUI.style.display = 'none';
  };
  testUI.appendChild(hideBtn);
  
  // 添加到页面
  document.body.appendChild(testUI);
}

// 等待页面加载完成后运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testContentUpdate);
} else {
  testContentUpdate();
}

// 导出测试函数，方便手动调用
window.testContentUpdate = testContentUpdate;
