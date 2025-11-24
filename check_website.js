// 网站加载诊断脚本
// 此脚本用于检查网站的加载状态和潜在问题

console.log('===== 网站加载诊断开始 =====');

// 检查DOM元素加载情况
function checkDomElements() {
  console.log('\n----- 检查DOM元素加载 -----');
  
  // 检查关键元素
  const keyElements = [
    { name: '导航栏', selector: '#navbar' },
    { name: '英雄区域', selector: 'header' },
    { name: '主要内容', selector: 'main' },
    { name: '页脚', selector: 'footer' },
    { name: 'Logo', selector: '[data-image="logo"]' }
  ];
  
  keyElements.forEach(element => {
    const el = document.querySelector(element.selector);
    if (el) {
      console.log(`✅ ${element.name} 已加载: ${element.selector}`);
      
      // 检查内容是否被填充
      if (el.hasAttribute('data-content')) {
        const contentKey = el.getAttribute('data-content');
        const content = el.textContent.trim();
        if (content && !content.includes('[调试:') && !content.includes('[内容占位:')) {
          console.log(`   ✅ ${element.name} 内容已填充 (${contentKey}): ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
        } else {
          console.log(`   ⚠️ ${element.name} 内容未完全填充 (${contentKey}): ${content}`);
        }
      }
      
      // 检查图片元素
      if (el.hasAttribute('data-image')) {
        const imageKey = el.getAttribute('data-image');
        if (el.tagName === 'IMG' && el.src) {
          console.log(`   ✅ 图片已设置 (${imageKey}): ${el.src}`);
        } else {
          console.log(`   ⚠️ 图片未设置或不是img元素 (${imageKey})`);
        }
      }
    } else {
      console.log(`❌ ${element.name} 未找到: ${element.selector}`);
    }
  });
  
  // 检查所有带data-content属性的元素
  const contentElements = document.querySelectorAll('[data-content]');
  console.log(`\n找到 ${contentElements.length} 个带有data-content属性的元素`);
  
  let emptyCount = 0;
  contentElements.forEach(el => {
    const content = el.textContent.trim();
    if (!content || content.includes('[调试:') || content.includes('[内容占位:')) {
      emptyCount++;
      console.log(`❌ 未填充的内容元素: ${el.getAttribute('data-content')}`);
    }
  });
  
  console.log(`\n未填充的内容元素: ${emptyCount}/${contentElements.length}`);
  
  // 检查所有带data-image属性的元素
  const imageElements = document.querySelectorAll('[data-image]');
  console.log(`\n找到 ${imageElements.length} 个带有data-image属性的元素`);
  
  let missingImageCount = 0;
  imageElements.forEach(el => {
    if (el.tagName === 'IMG') {
      if (!el.src || el.src === '' || el.src === window.location.href) {
        missingImageCount++;
        console.log(`❌ 未设置的图片元素: ${el.getAttribute('data-image')}`);
      }
    }
  });
  
  console.log(`\n未设置的图片元素: ${missingImageCount}/${imageElements.length}`);
}

// 检查JavaScript错误
function checkJavaScriptErrors() {
  console.log('\n----- 检查JavaScript错误 -----');
  
  // 检查Config对象是否可用
  if (window.Config) {
    console.log('✅ Config对象存在');
    console.log(`   - configLoaded: ${window.Config.configLoaded}`);
    
    try {
      const allConfig = window.Config.getAll();
      console.log(`   - getAll() 返回类型: ${typeof allConfig}`);
      if (allConfig && typeof allConfig === 'object') {
        console.log(`   - 配置对象包含属性: ${Object.keys(allConfig).join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Config.getAll() 抛出错误: ${error.message}`);
    }
    
  } else {
    console.log('❌ Config对象不存在');
  }
  
  // 检查ContentLoader对象是否可用
  if (window.contentLoader) {
    console.log('✅ ContentLoader对象存在');
  } else {
    console.log('❌ ContentLoader对象不存在');
  }
}

// 检查网络请求（在实际浏览器中运行时会记录）
function checkNetworkStatus() {
  console.log('\n----- 网络状态检查 -----');
  console.log(`当前URL: ${window.location.href}`);
  console.log(`文档就绪状态: ${document.readyState}`);
}

// 生成诊断报告
function generateDiagnosticReport() {
  console.log('\n===== 网站加载诊断报告 =====');
  
  const totalContentElements = document.querySelectorAll('[data-content]').length;
  const totalImageElements = document.querySelectorAll('[data-image]').length;
  
  let filledContentCount = 0;
  let loadedImageCount = 0;
  
  document.querySelectorAll('[data-content]').forEach(el => {
    const content = el.textContent.trim();
    if (content && !content.includes('[调试:') && !content.includes('[内容占位:')) {
      filledContentCount++;
    }
  });
  
  document.querySelectorAll('[data-image]').forEach(el => {
    if (el.tagName === 'IMG' && el.src && el.src !== '' && el.src !== window.location.href) {
      loadedImageCount++;
    }
  });
  
  const contentFillRate = totalContentElements > 0 ? Math.round((filledContentCount / totalContentElements) * 100) : 0;
  const imageLoadRate = totalImageElements > 0 ? Math.round((loadedImageCount / totalImageElements) * 100) : 0;
  
  console.log(`内容填充率: ${contentFillRate}% (${filledContentCount}/${totalContentElements})`);
  console.log(`图片加载率: ${imageLoadRate}% (${loadedImageCount}/${totalImageElements})`);
  
  if (contentFillRate >= 90 && imageLoadRate >= 90) {
    console.log('✅ 网站加载状态良好');
  } else if (contentFillRate >= 70 && imageLoadRate >= 70) {
    console.log('⚠️ 网站加载状态一般，有少量内容未加载');
  } else {
    console.log('❌ 网站加载状态较差，大部分内容未加载');
  }
}

// 主函数
function runDiagnostics() {
  try {
    checkDomElements();
    checkJavaScriptErrors();
    checkNetworkStatus();
    generateDiagnosticReport();
  } catch (error) {
    console.error('诊断过程中发生错误:', error);
  }
  
  console.log('\n===== 网站加载诊断结束 =====');
}

// 在DOM加载完成后运行诊断
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagnostics);
} else {
  // 如果DOM已加载，则立即运行诊断
  setTimeout(runDiagnostics, 1000);
}

// 导出函数供其他脚本调用
window.runWebsiteDiagnostics = runDiagnostics;