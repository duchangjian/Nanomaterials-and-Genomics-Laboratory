// 网站版本更新脚本 - 用于在内容更改时更新version.json
// 使用方法：在修改网站内容后，运行 node update-version.js 或直接在浏览器中打开此脚本页面

// 检查运行环境
if (typeof window !== 'undefined') {
  // 浏览器环境
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('正在更新网站版本信息...');
    
    try {
      // 生成新版本号
      const version = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      // 显示版本信息
      const versionInfo = document.createElement('div');
      versionInfo.style.cssText = `
        font-family: Arial, sans-serif;
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
        background-color: #f0f0f0;
        border-radius: 8px;
        text-align: center;
      `;
      
      versionInfo.innerHTML = `
        <h2>网站版本更新</h2>
        <p>请将以下内容复制到 <code>version.json</code> 文件中：</p>
        <pre style="text-align: left; background-color: white; padding: 15px; border-radius: 4px; overflow-x: auto;">{
  "version": "${version}",
  "timestamp": "${timestamp}",
  "description": "网站内容版本信息，用于自动更新检测"
}</pre>
        <p>复制完成后，提交此文件与您的内容更新一起推送到GitHub。</p>
      `;
      
      document.body.appendChild(versionInfo);
      
      // 选择并复制内容到剪贴板（如果浏览器支持）
      try {
        const preElement = versionInfo.querySelector('pre');
        const textArea = document.createElement('textarea');
        textArea.value = `{
  "version": "${version}",
  "timestamp": "${timestamp}",
  "description": "网站内容版本信息，用于自动更新检测"
}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // 显示复制成功提示
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 1000;
        `;
        successMsg.textContent = '✓ 版本信息已复制到剪贴板';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => successMsg.remove(), 300);
        }, 3000);
      } catch (err) {
        console.log('无法自动复制内容，请手动复制。');
      }
      
    } catch (error) {
      console.error('更新版本信息失败:', error);
    }
  });
} else if (typeof require !== 'undefined') {
  // Node.js环境
  const fs = require('fs');
  const path = require('path');
  
  console.log('正在更新网站版本信息...');
  
  try {
    // 生成新版本号
    const version = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // 创建版本信息对象
    const versionData = {
      version: version,
      timestamp: timestamp,
      description: "网站内容版本信息，用于自动更新检测"
    };
    
    // 写入version.json文件
    const versionFilePath = path.join(__dirname, 'version.json');
    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
    
    console.log(`✅ 版本信息已更新到 ${versionFilePath}`);
    console.log(`新版本号: ${version}`);
    console.log(`时间戳: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ 更新版本信息失败:', error);
    process.exit(1);
  }
} else {
  // 未知环境
  console.log('请在浏览器或Node.js环境中运行此脚本。');
}

// 为版本更新脚本添加HTML包装器（当直接在浏览器中打开时使用）
if (typeof window !== 'undefined' && !document.body.innerHTML.trim()) {
  document.body.style.cssText = `
    margin: 0;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f8f9fa;
  `;
  document.title = '网站版本更新工具';
}